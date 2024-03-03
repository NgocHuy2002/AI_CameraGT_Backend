import * as ValidatorHelper from '../../helpers/validatorHelper';
import { NOTIFICATION_ACTION, NOTIFICATION_STATUS, NOTIFICATION_TYPE } from './notification.constants';
import NOTIFICATION from './notification.model';
import CAMERA from './../Camera/camera.model';
import WARNING from './../Warning/warning.model';
import ROLE from './../Role/role.model';
import { Server } from 'socket.io';
import { NOTIFICATION_EVENT } from './notification.event';
import userService from '../User/user.service';
import { extractIds } from '../../utils/dataconverter';
import Expo from 'expo-server-sdk';
import i18next from 'i18next';

const Joi = require('joi');
const objSchema = Joi.object({});

const cors = require('cors');

export async function create(data) {
  const { error, value } = validate(data);
  if (error) throw error;
  return NOTIFICATION.create(value);
}

export function getAll(query) {
  const apiResponse = NOTIFICATION.find(query).lean();
  return apiResponse;
}

export function getAllByUserId(userId) {
  const apiResponse = NOTIFICATION.find({ user_id: userId, is_deleted: false }).sort({ 'created_at': -1 }).lean();
  return apiResponse;
}

export async function updateAll(chiTietUpdate) {
  for (const row of chiTietUpdate) {
    const { error, value } = validate(row);
    if (error) throw error;
    await NOTIFICATION.findByIdAndUpdate(value._id, value);
  }
}

export const validate = (data, method) => {
  return ValidatorHelper.validate(objSchema, data, method);
};

function generateContent(type, action, data) {
  if (type === NOTIFICATION_TYPE.USER_TO_USER) {
    switch (action) {
      case NOTIFICATION_ACTION.KIEM_TRA_CANH_BAO:
        return `{"key": "CONTENT_KIEM_TRA_CANH_BAO"}`;

      case NOTIFICATION_ACTION.KET_QUA_CANH_BAO:
        return `{"key": "CONTENT_KET_QUA_CANH_BAO"}`;

      case NOTIFICATION_ACTION.HUY_KET_QUA_CANH_BAO:
        return `{"key": "CONTENT_HUY_KET_QUA_CANH_BAO"}`;

      default:
        // return `Bạn có thông báo mới`;
        return `BAN_CO_THONG_BAO_MOI`;
    }
  } else if (type === NOTIFICATION_TYPE.SYSTEM_TO_USER) {
    switch (action) {
      case NOTIFICATION_ACTION.XAC_NHAN_CANH_BAO:
        return `{"key": "CONTENT_XAC_NHAN_CANH_BAO"}`;
      case NOTIFICATION_ACTION.KIEM_TRA_CANH_BAO_DANH_SACH_DEN:
        return `{"key": "CONTENT_XAC_NHAN_DANH_SACH_DEN"}`;
      case NOTIFICATION_ACTION.XAC_NHAN_DANH_SACH_DEN:
        return `{"key": "CONTENT_THEM_MOI_DANH_SACH_DEN"}`;
      default:
        // return `Bạn có thông báo mới`;
        return `BAN_CO_THONG_BAO_MOI`;
    }
  }
  // return `Bạn có thông báo mới`;
  return `{"key": "BAN_CO_THONG_BAO_MOI"}`;
}

function generateTitle(type, action, data) {
  if (type === NOTIFICATION_TYPE.USER_TO_USER) {
    switch (action) {
      case NOTIFICATION_ACTION.KIEM_TRA_CANH_BAO:
        return `{"key": "TITLE_KIEM_TRA_CANH_BAO"}`;

      case NOTIFICATION_ACTION.KET_QUA_CANH_BAO:
        return `{"key": "TITLE_KET_QUA_CANH_BAO"}`;

      case NOTIFICATION_ACTION.HUY_KET_QUA_CANH_BAO:
        return `{"key": "TITLE_HUY_KET_QUA_CANH_BAO"}`;
      case NOTIFICATION_ACTION.THONG_BAO_HET_HAN_JETSON:
        return `{"key": "Máy tính nhúng ${data?.name || ''} sắp hết thời hạn sử dụng "}`
      default:
        // return `Thông báo khác`;
        return `THONG_BAO_KHAC`;
    }
  } else if (type === NOTIFICATION_TYPE.SYSTEM_TO_USER) {
    switch (action) {
      case NOTIFICATION_ACTION.XAC_NHAN_CANH_BAO:
        return `{"key": "TITLE_XAC_NHAN_CANH_BAO"}`;
      case NOTIFICATION_ACTION.KIEM_TRA_CANH_BAO_DANH_SACH_DEN:
        return `{"key": "TITLE_XAC_NHAN_DANH_SACH_DEN"}`;
      case NOTIFICATION_ACTION.XAC_NHAN_DANH_SACH_DEN:
        return `{"key": "TITLE_THEM_MOI_DANH_SACH_DEN"}`;
      default:
        // return `Thông báo khác`;
        return `THONG_BAO_KHAC`;
    }
  }
  // return `Thông báo khác`;
  return `{"key": "THONG_BAO_KHAC"}`;
}

export async function notification(notify_type, action, users, data, t) {
  try {
    const contentGenerated = generateContent(notify_type, action, data);
    const titleGenerated = generateTitle(notify_type, action, data);
    console.log(data);
    const newNotificationData = users.map(userId => {
      return {
        user_id: userId,
        // source_type: sourceType,
        notify_type: notify_type,
        // payload_type: payloadType,
        // payload_id: data?._id,
        status: NOTIFICATION_STATUS.SENT,
        content: contentGenerated,
        payload: data,
        title: titleGenerated,
        // source_id: source?._id,
      };
    });

    const newNotifications = await NOTIFICATION.create(newNotificationData);

    await pushNotification(t, newNotifications);
  } catch (e) {
    console.log('e', e);
  }
}

let io;
const socketIdStorage = {};

let allNotification;
let unReadNotification;

export function initNotificationService(server) {
  io = new Server(server, {
    transports: ['websocket'],
    path: '/socket',
    cors: {
      origin: '*:*', // Specify the allowed origin (e.g., your client app's domain)
      methods: ['GET', 'POST'], // Specify allowed HTTP methods
      // allowedHeaders: ['my-custom-header'], // Specify allowed headers
      credentials: true, // Specify if you want to allow credentials (e.g., cookies)
    },
  });

  io.on('connection', (socket) => {
    console.log('a socket connected', socket.id);
    socket.on('disconnect', createHandler(socket, unregisterUserDevice));
    socket.on('user_login_id', createHandler(socket, registerUserDevice));
    socket.on('user_received_notification', createHandler(socket, receivedAllNotification));
    socket.on('user_viewed_all_notifications', createHandler(socket, viewedAllNotification));
    socket.on('user_viewed_one_notification', createHandler(socket, viewedOneNotification));
    socket.on('refresh_notification', createHandler(socket, refreshDataNotification));
    // socket.on('admin_confirm_status_notification', createHandler(socket, adminConfirmStatusNotification));
  });
}

function createHandler(socket, registerUserDevice) {
  return (payload) => {
    return registerUserDevice(socket, payload);
  };
}

async function getCurrentNumberNotifications(user_id) {
  allNotification = await getAllByUserId(user_id);
  unReadNotification = allNotification.filter(notification => notification.status !== NOTIFICATION_STATUS.VIEWED);

  return {
    // total: allNotification?.length,
    totalNotice: allNotification?.length,
    // unread: unReadNotification?.length,
    unreadNotice: unReadNotification?.length,
  };
}

async function informNotificationCountToAllDevices(user_id) {
  try {
    emitEventToUser(user_id, NOTIFICATION_EVENT.NOTIFICATION_COUNT, await getCurrentNumberNotifications(user_id));
  } catch (e) {
    console.log(e);
  }
}

async function informOneNotificationsUpdatedToAllDevices(user_id, notificationUpdated) {
  await informNotificationCountToAllDevices(user_id);
  emitEventToUser(user_id, NOTIFICATION_EVENT.NOTIFICATION_UPDATED_ONE, notificationUpdated);
}

async function informAllNotificationsUpdatedToAllDevices(user_id) {
  await informNotificationCountToAllDevices(user_id);
  emitEventToUser(user_id, NOTIFICATION_EVENT.NOTIFICATION_UPDATED_ALL);
}

async function informNotificationCountToOneDevice(socket, user_id) {
  try {
    socket.emit(NOTIFICATION_EVENT.NOTIFICATION_COUNT, await getCurrentNumberNotifications(user_id));
  } catch (e) {
    console.log(e);
  }
}

async function registerUserDevice(socket, { user_id }) {
  socket.user_id = user_id;
  if (socketIdStorage[user_id]) {
    socketIdStorage[user_id] = [socket.id, ...socketIdStorage[user_id]];
  } else {
    socketIdStorage[user_id] = [socket.id];
  }
  await informNotificationCountToOneDevice(socket, user_id);
}

export function unregisterUserDevice(socket) {
  console.log('a socket disconnected');
  const user_id = socket.user_id;
  const socketId = socket.id;
  if (socketIdStorage.hasOwnProperty(socket.user_id)) {
    let arrSocketIO = socketIdStorage[user_id];
    let idx = arrSocketIO.indexOf(socketId);
    if (idx !== -1) {
      arrSocketIO.splice(idx, 1);
    }
    if (arrSocketIO.length === 0) {
      delete socketIdStorage[user_id];
    } else {
      socketIdStorage[user_id] = arrSocketIO;
    }
  }
}

async function receivedAllNotification(socket, { user_id }) {
  try {
    NOTIFICATION.updateMany({ user_id: user_id }, { status: NOTIFICATION_STATUS.RECEIVED });
    await informAllNotificationsUpdatedToAllDevices(user_id);
  } catch (e) {
    console.log(e);
  }
}

async function viewedAllNotification(socket, { user_id }) {
  try {
    await NOTIFICATION.updateMany({ user_id: user_id }, { status: NOTIFICATION_STATUS.VIEWED });
    await informAllNotificationsUpdatedToAllDevices(user_id);
  } catch (e) {
    console.log(e);
  }
}

async function viewedOneNotification(socket, { user_id, _id }) {
  try {
    let notificationViewed;
    notificationViewed = await NOTIFICATION.findByIdAndUpdate(_id, { status: NOTIFICATION_STATUS.VIEWED }, { new: true }).lean();
    notificationViewed = await multiLanguageNotify(null, notificationViewed);
    await informOneNotificationsUpdatedToAllDevices(user_id, notificationViewed);
  } catch (e) {
    console.log(e);
  }
}

async function refreshDataNotification(socket, { user_id }) {
  await informNotificationCountToAllDevices(user_id);
}

function emitEventToUser(user_id, event, payload) {
  socketIdStorage[user_id]?.forEach(socketId => {
    io.sockets.sockets.get(socketId)?.emit(event, payload);
  });
}

export async function pushNotification(t, notifications) {
  for (let notification of notifications) {
    const notiMultiLang = await multiLanguageNotify(t, notification);
    notification = notiMultiLang;

    const jsoNotification = JSON.parse(JSON.stringify(notification));
    informNotificationCountToAllDevices(jsoNotification.user_id);
    emitEventToUser(jsoNotification.user_id, NOTIFICATION_EVENT.NOTIFICATION_NEW, jsoNotification);

    pushNotifyMobile(jsoNotification.user_id, NOTIFICATION_EVENT.NOTIFICATION_NEW, jsoNotification);
  }
}

export async function multiLanguageNotify(t, noti) {
  let notifyContent = '';
  let notifyContentObject;
  let notifyTitle = '';
  let notifyTitleObject;

  const cameraData = await CAMERA.findById(noti?.payload?.camera_id).lean();
  let cameraName = cameraData?.name;

  try {
    notifyContentObject = JSON.parse(`${noti.content}`);
  } catch {
    notifyContentObject = null;
  }

  try {
    notifyTitleObject = JSON.parse(`${noti.title}`);
  } catch {
    notifyTitleObject = null;
  }

  if (notifyContentObject?.key) {
    switch (notifyContentObject.key) {
      case "CONTENT_XAC_NHAN_CANH_BAO":
        notifyContent = (t ? t('notify_confirm_warning') : i18next.t('notify_confirm_warning')).format(noti?.payload?.content, cameraName);
        break;

      case "CONTENT_KIEM_TRA_CANH_BAO":
        notifyContent = (t ? t('notify_check_warning') : i18next.t('notify_check_warning')).format(noti?.payload?.content, cameraName);
        break;

      case "CONTENT_KET_QUA_CANH_BAO":
        notifyContent = (t ? t('notify_check_result_warning') : i18next.t('notify_check_result_warning')).format(noti?.payload?.content, cameraName);
        break;

      case "CONTENT_HUY_KET_QUA_CANH_BAO":
        notifyContent = (t ? t('notify_cancel_check_result_warning') : i18next.t('notify_cancel_check_result_warning')).format(noti?.payload?.content, cameraName);
        break;

      case "BAN_CO_THONG_BAO_MOI":
        notifyContent = (t ? t('notify_default_new_message') : i18next.t('notify_default_new_message'));
        break;
      case "CONTENT_XAC_NHAN_DANH_SACH_DEN":
        notifyContent = (t ? t('blacklist_confirm_warning') : i18next.t('blacklist_confirm_warning')).format(i18next.t(noti?.payload?.vehicle_type), noti?.payload?.license_plates);
        break;
      case "CONTENT_THEM_MOI_DANH_SACH_DEN":
        notifyContent = (t ? t('blacklist_add_new_warning') : i18next.t('blacklist_add_new_warning')).format(i18next.t(noti?.payload?.vehicle_type), noti?.payload?.license_plates);
        break;
      default:
        notifyContent = (t ? t('notify_default_new_message') : i18next.t('notify_default_new_message'));
        break;
    }
  } else {
    notifyContent = noti.content;
  }

  if (notifyTitleObject?.key) {
    switch (notifyTitleObject.key) {
      case "TITLE_XAC_NHAN_CANH_BAO":
        notifyTitle = (t ? t('title_confirm_warning') : i18next.t('title_confirm_warning'));
        break;
      case "TITLE_KIEM_TRA_CANH_BAO":
        notifyTitle = (t ? t('title_check_warning') : i18next.t('title_check_warning'));
        break;
      case "TITLE_KET_QUA_CANH_BAO":
        notifyTitle = (t ? t('title_check_result_warning') : i18next.t('title_check_result_warning'));
        break;
      case "TITLE_HUY_KET_QUA_CANH_BAO":
        notifyTitle = (t ? t('title_cancel_check_result_warning') : i18next.t('title_cancel_check_result_warning'));
        break;
      case "THONG_BAO_MA_CODE_UNG_DUNG_IOS":
        notifyTitle = (t ? t('title_iOS_app_code') : i18next.t('title_iOS_app_code'));
        break;
      case "THONG_BAO_CAP_NHAT_VERSION_MOI":
        notifyTitle = (t ? t('title_upgraded_new_version') : i18next.t('title_upgraded_new_version'));
        break;
      case "THONG_BAO_KHAC":
        notifyTitle = (t ? t('Thông báo khác') : i18next.t('Thông báo khác'));
        break;
      case "TITLE_XAC_NHAN_DANH_SACH_DEN":
        notifyContent = (t ? t('blacklist_confirm_warning') : i18next.t('blacklist_confirm_warning')).format(t(noti?.payload?.vehicle_type), noti?.payload?.license_plates);
        break;
      case "TITLE_THEM_MOI_DANH_SACH_DEN":
        notifyContent = (t ? t('blacklist_add_new_warning') : i18next.t('blacklist_add_new_warning')).format(t(noti?.payload?.vehicle_type), noti?.payload?.license_plates);
        break;
      default:
        notifyTitle = '';
        break;
    }
  } else {
    notifyTitle = noti.title;
  }

  noti.content = notifyContent;
  noti.title = notifyTitle;

  return noti;
}

export async function pushNotifyMobile(user_id, event, data) {
  let userTokens = await userService.getTokens(user_id);
  const { totalNotice, unreadNotice } = await getCurrentNumberNotifications(user_id);
  // const dataReduced = {
  //   ...data,
  // };
  expoPushNotification(userTokens, data.title, data.content, unreadNotice, data);
}

export function expoPushNotification(expoTokens, title, body, badge, data) {
  let expo = new Expo();
  let messages = [];

  for (let pushToken of expoTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
    messages.push({
      to: pushToken,
      _id: data._id,
      title: title,
      body: body,
      data: data,
      sound: 'default',
      badge: badge,
      channelId: 'notification',
    });
  }

  // The Expo push notification service accepts batches of notifications so

  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        // console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
      } catch (error) {
        console.error(error);
        if (error.code === 'PUSH_TOO_MANY_EXPERIENCE_IDS') {
          console.log('lỗi duplicate');
          Object.values(error.details).forEach(tokens => {
            expoPushNotification(tokens, title, body, badge, data);
          });
        }
      }
    }
  })();
}
