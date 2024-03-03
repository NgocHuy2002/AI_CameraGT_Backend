import * as Service from './caiDatHeThong.service';
import Model, { APP_ANDROID_TYPE } from './caiDatHeThong.model';
import * as controllerHelper from '../../helpers/controllerHelper';
import * as responseHelper from '../../helpers/responseHelper';
import * as fileUtils from '../../utils/fileUtils';
import { STORE_DIRS } from '../../constant/constant';
import CommonError from '../../error/CommonError';
import { deleteFile } from '../../utils/fileUtils';
import { defaultPermissionExtractor } from '../RBAC/middleware';
import SettingPermission from '../RBAC/permissions/SettingPermission';
import { authorizePermission } from '../RBAC/authorizationHelper';
import UserService from '../User/user.service';
import * as NotificationService from '../Notification/notification.service';
import * as dbCollections from '../../constant/dbCollections';
import { NOTIFICATION_ACTION, NOTIFICATION_TYPE } from '../Notification/notification.constants';
import { extractIds } from '../../utils/dataconverter';

export async function findOne(req, res) {
  try {
    const data = await Model.findOne({}, { _id: 0 }).lean();
    if (!data) {
      return responseHelper.error(res, CommonError.NOT_FOUND);
    }
    if (!authorizePermission(defaultPermissionExtractor(req), [SettingPermission.UPDATE])) {
      data.ldap_username = data.ldap_username?.replace(new RegExp('.', 'g'), '*');
      data.ldap_password = data.ldap_password?.replace(new RegExp('.', 'g'), '*');
      data.sign_appcode = data.sign_appcode?.replace(new RegExp('.', 'g'), '*');
      data.sign_password = data.sign_password?.replace(new RegExp('.', 'g'), '*');
    }

    return responseHelper.success(res, data);
  } catch (err) {
    responseHelper.error(res, err);
  }
}

export async function update(req, res) {
  try {
    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, CommonError.NOT_FOUND);
    const setting = await Model.findOne().lean();
    if (value.phien_auto_xoa_anh == 0) value.phien_auto_xoa_anh = undefined;
    const data = await Model.findOneAndUpdate({ _id: setting._id }, value, { new: true });
    if (!data) {
      return responseHelper.error(res, CommonError.NOT_FOUND);
    }
    return responseHelper.success(res, data);
  } catch (err) {
    responseHelper.error(res, err);
  }
}

export const getAll = controllerHelper.createGetAllFunction(Model);

export async function updateAppAndroid(req, res) {
  try {
    const fileId = fileUtils.createUniqueFileName(req.files.file.originalFilename);
    await fileUtils.createByName(req.files.file.path, fileId, STORE_DIRS.MOBILE_APP);

    const data = await Model.findOne().lean();
    if (!data) {
      return responseHelper.error(res, CommonError.NOT_FOUND);
    }
    const dataReturn = await Model.findOneAndUpdate(
      { _id: data._id },
      { android_app: fileId, android_app_type: APP_ANDROID_TYPE.FILE, link_android_app: '' },
      { new: true });
    if (data.android_app) {
      deleteFile(`${STORE_DIRS.MOBILE_APP}/${data.android_app}`);
    }
    return responseHelper.success(res, dataReturn);
  } catch (err) {
    responseHelper.error(res, err);
  }
}

export async function updateLinkAndroid(req, res) {
  try {
    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, CommonError.NOT_FOUND);
    const beforeUpdate = await Model.findOne().lean();
    if (!beforeUpdate) {
      return responseHelper.error(res, CommonError.NOT_FOUND);
    }
    const dataReturn = await Model.findOneAndUpdate(
      { _id: beforeUpdate._id },
      {
        link_android_app: value.link_android_app,
        android_app_type: APP_ANDROID_TYPE.LINK,
        android_app: '',
      },
      { new: true });
    if (beforeUpdate.android_app) {
      deleteFile(`${STORE_DIRS.MOBILE_APP}/${beforeUpdate.android_app}`);
    }
    return responseHelper.success(res, dataReturn);
  } catch (err) {
    responseHelper.error(res, err);
  }
}

export async function updateAppIos(req, res) {
  try {
    const fileId = fileUtils.createUniqueFileName(req.files.file.originalFilename);
    await fileUtils.createByName(req.files.file.path, fileId, STORE_DIRS.MOBILE_APP);

    const data = await Model.findOne().lean();
    if (!data) {
      return responseHelper.error(res, CommonError.NOT_FOUND);
    }
    const dataReturn = await Model.findOneAndUpdate({ _id: data._id }, { ios_app: fileId }, { new: true });
    if (data.ios_app) {
      deleteFile(`${STORE_DIRS.MOBILE_APP}/${data.ios_app}`);
    }
    return responseHelper.success(res, dataReturn);
  } catch (err) {
    responseHelper.error(res, err);
  }
}

export async function flightControlApp(req, res) {
  try {
    const fileId = fileUtils.createUniqueFileName(req.files.file.originalFilename);
    await fileUtils.createByName(req.files.file.path, fileId, STORE_DIRS.MOBILE_APP);

    const currentData = await Model.findOne().lean();
    if (!currentData) {
      return responseHelper.error(res, CommonError.NOT_FOUND);
    }
    const dataReturn = await Model.findOneAndUpdate({ _id: currentData._id }, { flight_control_app: fileId }, { new: true });
    if (currentData.flight_control_app) {
      deleteFile(`${STORE_DIRS.MOBILE_APP}/${currentData.flight_control_app}`);
    }
    return responseHelper.success(res, dataReturn);
  } catch (err) {
    responseHelper.error(res, err);
  }
}

export async function uploadModelAi(req, res) {
  try {
    const fileId = fileUtils.createUniqueFileName(req.files.file.originalFilename);
    await fileUtils.createByName(req.files.file.path, fileId, STORE_DIRS.MODEL_AI);

    const currentData = await Model.findOne().lean();
    if (!currentData) {
      return responseHelper.error(res, CommonError.NOT_FOUND);
    }
    const dataReturn = await Model.findOneAndUpdate({ _id: currentData._id }, { model_ai: fileId }, { new: true });
    if (currentData.model_ai) {
      deleteFile(`${STORE_DIRS.MODEL_AI}/${currentData.model_ai}`);
    }
    return responseHelper.success(res, dataReturn);
  } catch (err) {
    responseHelper.error(res, err);
  }
}

export async function notificationCapNhatVersion(req, res) {
  try {
    const { t } = req;
    let userData = [];
    let notifyData = {...req.body};
    delete notifyData.typeNotify;

    const userResponse = await UserService.getAll();
    userData = [...userData, ...userResponse];

    const userNotiId = extractIds(userData).filter(userId => userId?.toString() !== req.user._id?.toString());

    const dataResponse = await NotificationService.notification(NOTIFICATION_TYPE.SYSTEM_TO_USER, dbCollections.CAI_DAT_HE_THONG,
      null, userNotiId, NOTIFICATION_ACTION.CAP_NHAT_VERSION_MOI, notifyData, req.body.typeNotify, t);
    
    return responseHelper.success(res, dataResponse);
  } catch (err) {
    responseHelper.error(res, err);
  }
}

export async function serverLog(req, res) {
  try {
    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, CommonError.NOT_FOUND);
    const setting = await Model.findOne().lean();
    const data = await Model.findOneAndUpdate({ _id: setting._id }, value, { new: true });
    if (!data) {
      return responseHelper.error(res, CommonError.NOT_FOUND);
    }
    return responseHelper.success(res, data);
  } catch (err) {
    responseHelper.error(res, err);
  }
}
