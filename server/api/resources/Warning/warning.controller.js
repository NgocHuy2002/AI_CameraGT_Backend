import * as Service from './warning.service';
import Model from './warning.model';
import CAMERA from './../Camera/camera.model';
import ROLE from './../Role/role.model';
import CAI_DAT_HE_THONG from '../CaiDatHeThong/caiDatHeThong.model';
import queryHelper from '../../helpers/queryHelper';
import * as controllerHelper from '../../helpers/controllerHelper';
import * as responseHelper from '../../helpers/responseHelper';
const mongoose = require('mongoose');

import * as NotificationService from '../Notification/notification.service';
import * as UserService from '../User/user.service';
import { NOTIFICATION_ACTION, NOTIFICATION_TYPE } from '../Notification/notification.constants';
import { extractIds } from '../../utils/dataconverter';
import { findOneById } from '../../helpers/controllerHelper';
import { STORE_DIRS } from '../../constant/constant';
import * as fileUtils from '../../utils/fileUtils';
import { sendEmail } from '../../utils/mailHelper';
import { getConfig } from '../../../config/config';

import * as UnitService from '../Unit/unit.service';

const config = getConfig(process.env.NODE_ENV);
const searchLike = [];
const populateOpts = [
  { path: 'camera_id', populate: 'position_id unit_id' },
];
const uniqueOpts = [];
const sortOpts = '';

export const findOne = controllerHelper.createFindOneFunction(Model, populateOpts);
export const remove = controllerHelper.createRemoveFunction(Model);
// export const update = controllerHelper.createUpdateByIdFunction(Model, Service, populateOpts, uniqueOpts);

export async function create(req, res) {
  try {
    console.log('GO TO 1st CREATE');
    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, error, 400);
    const { t } = req;

    const dataSettingSystem = await CAI_DAT_HE_THONG.findOne();

    const imageId = fileUtils.createUniqueFileName(req.files.file.originalFilename);
    await fileUtils.createByName(req.files.file.path, imageId, STORE_DIRS.IMAGE_WARNING);

    // Get thông tin camera
    // const cameraData = await findOneById(CAMERA, data.camera_id, populateOpts, true);
    const cameraData = await CAMERA.findOne({ ip_address: value.camera_ip });

    let dataPost = { ...value, image_id: imageId, camera_id: cameraData?._id };
    // const data = await Model.create(value);
    const data = await Model.create(dataPost);

    const createdData = await findOneById(Model, data._id, populateOpts, true);

    // Thêm dữ liệu vào bảng Notification
    let userData = [];
    const roleInfo = await ROLE.findOne({ code: 'ADMIN' }).lean();
    const userResponse = await UserService.getAll({ unit_id: cameraData.unit_id, role_id: roleInfo._id });
    if (userResponse) {
      userData = [...userData, ...userResponse];
      const userNotiId = extractIds(userData);

      // Gửi thông báo
      await NotificationService.notification(NOTIFICATION_TYPE.SYSTEM_TO_USER, NOTIFICATION_ACTION.XAC_NHAN_CANH_BAO, userNotiId, createdData, t);

      // Gửi mail
      if(dataSettingSystem.send_email){
        userData.map(user => {
          if (user.email) {
            const data = JSON.parse(createdData.object.replaceAll('\'', '"'));
            const labelString = data.map(item => t(item.label)).join(',');
            let mailOptions = {
              from: `${t('email_user_create_from')} <${config.mail.auth.user}>`, // Địa chỉ mail gửi
              to: user.email, // Địa chỉ mail nhận
              subject: t('email_new_warning_subject'), // Subject line
              html: `<h2>${t('Hệ thống đã phát hiện cảnh báo mới')}</h2>
                  <div><strong>${t('Nội dung')}: </strong>${createdData.content}</div>
                  <div><strong>${t('Đối tượng')}: </strong>${labelString}</div>    
                  <div><strong>${t('Ngày phát hiện')}: </strong>${createdData.dectect_time}</div>
                  <div><strong>Vui lòng truy cập hệ thống để xem chi tiết</div>`, // html body
            };
  
            sendEmail(mailOptions, (err) => {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      }
    }
    // if (callback) callback(createdData);
    return responseHelper.success(res, createdData);
  } catch (err) {
    return responseHelper.error(res, err, 500);
  }
}

export async function update(req, res) {
  try {
    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, error, 400);

    const dataSettingSystem = await CAI_DAT_HE_THONG.findOne();

    const { t } = req;
    const { id } = req.params;

    const existData = await Model.findById(id).lean();

    let updatedData = await Model.findByIdAndUpdate({ _id: id }, value, { new: true }).populate(populateOpts).lean();
    if (!updatedData) {
      return responseHelper.error(res, CommonError.NOT_FOUND);
    }

    const cameraData = await CAMERA.findById(updatedData.camera_id).lean();
    if (!cameraData) return null;

    // Trường hợp cảnh báo được xác nhận là cảnh báo đúng
    if (existData.confirm_status !== value.confirm_status && value.confirm_status === 'CANH_BAO_DUNG') {
      let userData = [];
      let userResponse = [];

      if (updatedData.assign_users.length > 0) {
        userResponse = await UserService.getAll({ _id: { $in: updatedData.assign_users } }).lean();
      } else {
        const roleInfo = await ROLE.findOne({ code: 'MEMBER' }).lean();
        userResponse = await UserService.getAll({ unit_id: cameraData?.unit_id, role_id: roleInfo?._id, _id: { $ne: req.user?._id } }).lean();
      }

      if (userResponse && userResponse.length) {
        userData = [...userData, ...userResponse];
        const userNotiId = extractIds(userData);
        await NotificationService.notification(NOTIFICATION_TYPE.USER_TO_USER, NOTIFICATION_ACTION.KIEM_TRA_CANH_BAO, userNotiId, updatedData, t);

        // Gửi mail
        if(dataSettingSystem.send_email){
          userData.map(user => {
            if (user.email) {
              const data = JSON.parse(updatedData.object.replaceAll('\'', '"'));
              const labelString = data.map(item => t(item.label)).join(',');
              let mailOptions = {
                from: `${t('email_user_create_from')} <${config.mail.auth.user}>`, // Địa chỉ mail gửi
                to: user.email, // Địa chỉ mail nhận
                subject: t('Admin yêu cầu thực hiện kiểm tra cảnh báo'), // Subject line
                html: `<h2>${t('Admin yêu cầu thực hiện kiểm tra cảnh báo')}</h2>
                  <div><strong>${t('Nội dung')}: </strong>${updatedData.content}</div>
                  <div><strong>${t('Đối tượng')}: </strong>${labelString}</div>
                  <div><strong>${t('Ngày phát hiện')}: </strong>${updatedData.dectect_time}</div>
                  <div><strong>${t('Kết quả kiểm tra')}: </strong>${updatedData.check_result}</div>
                  <div><strong>Vui lòng truy cập hệ thống để xem chi tiết</div>`, // html body
              };

              sendEmail(mailOptions, (err) => {
                if (err) {
                  console.log(err);
                }
              });
            }
          });
        }
      }
    }
    // Trường hợp cảnh báo được kiểm tra hoặc huỷ kết quả kiểm tra
    else if (existData.confirm_status === value.confirm_status && existData.check_status !== value.check_status) {
      let userData = [];
      const roleInfo = await ROLE.findOne({ code: 'ADMIN' }).lean();
      const userResponse = await UserService.getAll({ unit_id: cameraData?.unit_id, role_id: roleInfo?._id, _id: { $ne: req.user?._id } }).lean();

      if (userResponse && userResponse.length) {
        userData = [...userData, ...userResponse];
        const userNotiId = extractIds(userData);

        if (value.check_status) {
          await NotificationService.notification(NOTIFICATION_TYPE.USER_TO_USER, NOTIFICATION_ACTION.KET_QUA_CANH_BAO, userNotiId, updatedData, t);

          // Gửi mail
          if(dataSettingSystem.send_email){
            userData.map(user => {
              if (user.email) {
                const data = JSON.parse(updatedData.object.replaceAll('\'', '"'));
                const labelString = data.map(item => t(item.label)).join(',');
                let mailOptions = {
                  from: `${t('email_user_create_from')} <${config.mail.auth.user}>`, // Địa chỉ mail gửi
                  to: user.email, // Địa chỉ mail nhận
                  subject: t('Nhân viên đã thực hiện kiểm tra'), // Subject line
                  html: `<h2>${t('Nhân viên đã thực hiện kiểm tra')}</h2>
                  <div><strong>${t('Nội dung')}: </strong>${updatedData.content}</div>
                  <div><strong>${t('Đối tượng')}: </strong>${labelString}</div>
                  <div><strong>${t('Ngày phát hiện')}: </strong>${updatedData.dectect_time}</div>
                  <div><strong>${t('Kết quả kiểm tra')}: </strong>${updatedData.check_result}</div>
                  <div><strong>Vui lòng truy cập hệ thống để xem chi tiết</div>`, // html body
                };

                sendEmail(mailOptions, (err) => {
                  if (err) {
                    console.log(err);
                  }
                });
              }
            });
          }
        }
        else {
          await NotificationService.notification(NOTIFICATION_TYPE.USER_TO_USER, NOTIFICATION_ACTION.HUY_KET_QUA_CANH_BAO, userNotiId, updatedData, t);

          // Gửi mail
          if(dataSettingSystem.send_email){
            userData.map(user => {
              if (user.email) {
                const data = JSON.parse(updatedData.object.replaceAll('\'', '"'));
                const labelString = data.map(item => t(item.label)).join(',');
                let mailOptions = {
                  from: `${t('email_user_create_from')} <${config.mail.auth.user}>`, // Địa chỉ mail gửi
                  to: user.email, // Địa chỉ mail nhận
                  subject: t('Nhân viên đã hủy kết quả kiểm tra'), // Subject line
                  html: `<h2>${t('Nhân viên đã hủy kết quả kiểm tra')}</h2>
                  <div><strong>${t('Nội dung')}: </strong>${updatedData.content}</div>
                  <div><strong>${t('Đối tượng')}: </strong>${labelString}</div>
                  <div><strong>${t('Ngày phát hiện')}: </strong>${updatedData.dectect_time}</div>
                  <div><strong>${t('Kết quả kiểm tra')}: </strong>${updatedData.check_result}</div>
                  <div><strong>Vui lòng truy cập hệ thống để xem chi tiết</div>`, // html body
                };

                sendEmail(mailOptions, (err) => {
                  if (err) {
                    console.log(err);
                  }
                });
              }
            });
          }
        }
      }
    }
    else {
      // Trường hợp khác thì không gửi thông báo
    }

    return responseHelper.success(res, updatedData);
  } catch (err) {
    return responseHelper.error(res, err, 500);
  }
}

export async function getAll(req, res) {
  try {
    const query = queryHelper.extractQueryParam(req, searchLike, true, false);
    const { criteria, options } = query;
    if (populateOpts) {
      options.populate = populateOpts;
    }

    let objQueryUnit = {}
    let unitIdList = {};
    if (!req.user?.is_system_admin) {
      unitIdList = await UnitService.getDonViQuery(req, null);
      unitIdList['$in'] = unitIdList['$in'].map(function (id) {
        return mongoose.Types.ObjectId(id);
      });

      objQueryUnit['camera.unit_id'] = unitIdList;
    }

    if (req.query.all) {
      let queryPromise = Model.find(criteria).collation({ locale: 'vi' });
      queryPromise.lean = true;

      if (populateOpts) {
        populateOpts.forEach(populateOp => {
          queryPromise.populate(populateOp);
        });
      }

      const data = await queryPromise;
      return responseHelper.success(res, data);
    } else {
      const page = parseInt(req.query?.page) || 1;
      const limit = parseInt(req.query?.limit) || 10;

      let objQuery = {}
      let objQueryCamera = {}
      if (req.query) {
        if (req.query.unit_id) {
          objQueryCamera['camera.unit_id'] = mongoose.Types.ObjectId(req.query.unit_id);
        }
        if (req.query.position_id) {
          objQueryCamera['camera.position_id'] = mongoose.Types.ObjectId(req.query.position_id);
        }
        if (req.query.confirm_status) {
          objQuery['confirm_status'] = req.query.confirm_status;
        }
        if (req.query.check_status) {
          objQuery['check_status'] = req.query.check_status === 'DA_KIEM_TRA';
        }
        // if (req.query._id) {
        //   objQuery['_id'] = mongoose.Types.ObjectId(req.query._id);
        // }
      }

      const options = [
        {
          $match: {
            is_deleted: false,
            ...objQuery,
          }
        },
        {
          $match: {
            object: { "$regex": req.query?.object || '' },
          }
        },
        {
          $lookup: {
            from: 'Camera',
            localField: 'camera_id',
            foreignField: '_id',
            as: 'camera',
          },
        },
        {
          $unwind: '$camera',
        },
        {
          $match: objQueryUnit
        },
        {
          $match: objQueryCamera
        },
        {
          $lookup: {
            from: 'Position',
            localField: 'camera.position_id',
            foreignField: '_id',
            as: 'position',
          },
        },
        {
          $unwind: '$position',
        },
        {
          $lookup: {
            from: 'Unit',
            localField: 'camera.unit_id',
            foreignField: '_id',
            as: 'unit',
          },
        },
        {
          $unwind: '$unit',
        },
        { $sort: { created_at: -1 } },
        {
          $lookup: {
            from: 'CameraType',
            localField: 'camera.type_id',
            foreignField: '_id',
            as: 'cameratype',
          },
        },
        {
          $project: {
            _id: 1,
            content: '$content',
            confirm_status: '$confirm_status',
            check_status: '$check_status',
            check_result: '$check_result',
            dectect_time: '$dectect_time',
            image_id: '$image_id',
            object: '$object',
            assign_users: '$assign_users',
            created_at: '$created_at',
            camera_id: {
              _id: '$camera._id',
              name: '$camera.name',
              ip_address: '$camera.ip_address',
              domain: '$camera.domain',
              username: '$camera.username',
              password: '$camera.password',
              port: '$camera.port',
              rtsp_url: '$camera.rtsp_url',
              status: '$camera.status',
              detect_point: '$camera.detect_point',
              img_sample_url: '$camera.img_sample_url',
              time_send_frame: '$camera.time_send_frame',
              type_id: {
                _id: '$cameratype._id',
                name: '$cameratype.name',
                brand: '$cameratype.brand',
              },
              position_id: {
                _id: '$position._id',
                name: '$position.name',
              },
              unit_id: {
                _id: '$unit._id',
                name: '$unit.name'
              },
            }
          },
        }
      ]

      const initialAggregateResult = await Model.aggregate(options)

      const aggregateResult = await Model.aggregate([
        ...options,
        {
          $skip: (page - 1) * 10,
        },
        {
          $limit: limit,
        },
      ])

      const totalDocs = initialAggregateResult.length;
      const totalPages = Math.ceil(totalDocs / limit);
      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;
      const prevPage = hasPrevPage ? page - 1 : null;
      const nextPage = hasNextPage ? page + 1 : null;

      const data = {
        docs: aggregateResult,
        totalDocs,
        limit,
        totalPages,
        page,
        pagingCounter: page,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
      };

      return responseHelper.success(res, data);
    }
  } catch (err) {
    return responseHelper.error(res, err);
  }
};
