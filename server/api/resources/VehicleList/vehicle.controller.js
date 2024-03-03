import * as Service from "./vehicle.service";
import Model from "./vehicle.model";
import CAMERA from './../Camera/camera.model';
import BLACKLIST from './../BlackList/blackList.model';
import ROLE from './../Role/role.model';
import { updateByLicensePlates } from "../BlackList/blackList.controller";

import queryHelper from "../../helpers/queryHelper";
import * as controllerHelper from "../../helpers/controllerHelper";
import * as responseHelper from "../../helpers/responseHelper";
import * as NotificationService from '../Notification/notification.service';
import * as UserService from '../User/user.service';

import { NOTIFICATION_ACTION, NOTIFICATION_TYPE } from '../Notification/notification.constants';
import { findOneById } from '../../helpers/controllerHelper';
import { STORE_DIRS } from '../../constant/constant';
import * as fileUtils from '../../utils/fileUtils';
import * as UnitService from '../Unit/unit.service';
import { extractIds } from '../../utils/dataconverter';

import mongoose from "mongoose";

const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const { spawn } = require('child_process');

ffmpeg.setFfmpegPath(ffmpegStatic);

const searchLike = ["content"];
const populateOpts = [
  { path: 'camera_id', populate: 'position_id unit_id' },
];
const uniqueOpts = [];
const sortOpts = "";

export const findOne = controllerHelper.createFindOneFunction(Model, populateOpts);
export const remove = controllerHelper.createRemoveFunction(Model);


export async function create(req, res) {
  try {
    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, error, 400);
    let userData = [];
    const { t } = req;

    // const dataSettingSystem = await CAI_DAT_HE_THONG.findOne();
    const anhFull = fileUtils.createUniqueFileName(req.files.file[0].originalFilename);
    const anhPhuongTien = fileUtils.createUniqueFileName(req.files.file[1].originalFilename);
    const anhBienSo = fileUtils.createUniqueFileName(req.files.file[2].originalFilename);
    await fileUtils.createByName(req.files.file[0].path, anhFull, STORE_DIRS.FULL_IMAGE);
    await fileUtils.createByName(req.files.file[1].path, anhPhuongTien, STORE_DIRS.VEHICLE_IMAGE);
    await fileUtils.createByName(req.files.file[2].path, anhBienSo, STORE_DIRS.LICENSE_PLATES_IMAGE);

    // Get thông tin camera
    const cameraData = await CAMERA.findOne({ domain: value.domain });
    const roleInfo = await ROLE.findOne({ code: 'ADMIN' }).lean();
    // Check
    const userResponse = await UserService.getAll({ unit_id: cameraData.unit_id, role_id: roleInfo._id });
    // const userResponse = await UserService.getAll();

    userData = [...userData, ...userResponse];
    const userNotiId = extractIds(userData);
    console.log(userNotiId);
    let dataPost = {
      ...value,
      image: anhFull,
      vehicle_image: anhPhuongTien,
      license_plates_image: anhBienSo,
      camera_id: cameraData?._id
    };
    const blackListData = await BLACKLIST.findOne({ license_plates: value.license_plates, is_deleted: false });
    if (blackListData) {
      dataPost = {
        ...dataPost,
        is_black_list: true
      }
      let updateBL = {
        license_plates_color: value.license_plates_color,
        vehicle_color: value.vehicle_color,
        vehicle_type: value.vehicle_type,
      }
      const license_plates = value.license_plates
      const updateResult = await updateByLicensePlates({ params: { license_plates }, body: updateBL }, res);
    }
    const data = await Model.create(dataPost);

    const createdData = await findOneById(Model, data._id, populateOpts, true);
    // Notification
    if (blackListData) {
      await NotificationService.notification(NOTIFICATION_TYPE.SYSTEM_TO_USER, NOTIFICATION_ACTION.KIEM_TRA_CANH_BAO_DANH_SACH_DEN, userNotiId, createdData, t);
    }
    return responseHelper.success(res, createdData);
  } catch (err) {
    return responseHelper.error(res, err, 500);
  }
}

export async function getAll(req, res) {
  try {
    const query = queryHelper.extractQueryParam(req, searchLike, true, false);
    let { criteria, options } = query;
    let sort = null;
    if (populateOpts) {
      options.populate = populateOpts;
    }
    if (options?.sort) {
      sort = options.sort;
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

      let objQueryUnit = {}
      let objQuery = {};
      let objQueryCamera = {}
      let unitIdList = {};

      const excludedProperties = ['tu_ngay', 'den_ngay'];

      if (criteria.tu_ngay && criteria.den_ngay) {
        const timeStart = new Date(criteria.tu_ngay);
        const timeEnd = new Date(criteria.den_ngay);
        // timeStart.setDate(timeStart.getDate());
        // timeStart.setHours(0, 0, 0, 0);
        // timeEnd.setDate(timeEnd.getDate());
        // timeEnd.setHours(23, 59, 59, 999);
        objQuery = {
          ...criteria,
          created_at: {
            $gte: timeStart,
            $lte: timeEnd,
          },
        };
        criteria.license_plates ? objQuery.license_plates = { $regex: criteria.license_plates.toString(), $options: 'i' } : undefined,
          excludedProperties.forEach(prop => delete objQuery[prop]);
      } else {
        objQuery = {
          ...criteria,
        };
        criteria.license_plates ? objQuery.license_plates = { $regex: criteria.license_plates.toString(), $options: 'i' } : undefined;
      }
      if (!req.user?.is_system_admin) {
        unitIdList = await UnitService.getDonViQuery(req, null);
        unitIdList['$in'] = unitIdList['$in'].map(function (id) {
          return mongoose.Types.ObjectId(id);
        });

        objQueryUnit['camera.unit_id'] = unitIdList;
        // criteria.unit_id = await UnitService.getDonViQuery(req, null);
      }
      if (req.query) {
        if (req.query.unit_id) {
          objQueryCamera['camera.unit_id'] = mongoose.Types.ObjectId(req.query.unit_id);
        }
        if (req.query.position_id) {
          objQueryCamera['camera.position_id'] = mongoose.Types.ObjectId(req.query.position_id);
        }
      }
      console.log('objQuery >>>', objQuery);
      const options = [
        {
          $match: {
            $and: [
              objQuery
            ]
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
        {
          $sort: {
            [sort ? Object.keys(sort)[0] : 'created_at']: sort ? Object.values(sort)[0] : -1
          }
        },
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
            time_detect: '$time_detect',
            image: '$image',
            vehicle_image: '$vehicle_image',
            license_plates_image: '$license_plates_image',
            vehicle_type: '$vehicle_type',
            license_plates: '$license_plates',
            is_black_list: '$is_black_list',
            license_plates_color: '$license_plates_color',
            vehicle_brand: '$vehicle_brand',
            vehicle_style: '$vehicle_style',
            vehicle_color: '$vehicle_color',
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
                ten_don_vi: '$unit.ten_don_vi'
              },
              // powerline_id: {
              //   _id: '$powerline._id',
              //   name: '$powerline.name'
              // }
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

export async function update(req, res) {
  try {
    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, error, 400);

    //   const dataSettingSystem = await CAI_DAT_HE_THONG.findOne();

    const { t } = req;
    const { license_plates } = req.params;
    // const blackListData = await BLACKLIST.findOne({ license_plates: license_plates, is_deleted: false });
    // if (blackListData) {
    //   let updateBL = {
    //     license_plates: value.license_plates,
    //     license_plates_color: value.license_plates_color,
    //     vehicle_color: value.vehicle_color,
    //     vehicle_type: value.vehicle_type,
    //   }
    //   await updateByLicensePlates({ params: { license_plates }, body: updateBL }, res);
    // }
    let updatedData = await Model.updateMany({ license_plates: license_plates }, value, { new: true })
      .populate(populateOpts)
      .lean();
    if (!updatedData) {
      return responseHelper.error(res, CommonError.NOT_FOUND);
    }

    return responseHelper.success(res, updatedData);
  } catch (err) {
    return responseHelper.error(res, err, 500);
  }
}

export async function updateOne(req, res) {
  try {
    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, error, 400);

    const { t } = req;
    const { id } = req.params;
    const vehicle = await Model.findOne({ _id: id, is_deleted: false });
    if (vehicle) {
      const license_plates = vehicle.license_plates
      const blackListData = await BLACKLIST.findOne({ license_plates: vehicle.license_plates, is_deleted: false });
      console.log(blackListData);
      if (blackListData) {
        let updateBL = {
          license_plates: value.license_plates,
          license_plates_color: value.license_plates_color,
          vehicle_color: value.vehicle_color,
          vehicle_type: value.vehicle_type,
        }
        await updateByLicensePlates({ params: { license_plates }, body: updateBL }, res);
      }
    }

    let updatedData = await Model.updateOne({ _id: id }, value, { new: true })
      .populate(populateOpts)
      .lean();
    if (!updatedData) {
      return responseHelper.error(res, CommonError.NOT_FOUND);
    }

    return responseHelper.success(res, updatedData);
  } catch (err) {
    return responseHelper.error(res, err, 500);
  }
}

// export async function stream(req, res) {
//   console.log("Start run");
//   const outputDir = 'storage/videos/';
//   const rtspStreamUrl = 'rtsp://admin:Cahh@12345@cahh49.smartddns.tv:37779/cam/realmonitor?channel=1&subtype=0'; // IP camera's RTSP stream URL

//   const ffmpegProcess = spawn('ffmpeg', [
//     '-rtsp_transport', 'tcp',
//     '-i', rtspStreamUrl,
//     '-c:v', 'libx264',
//     '-preset', 'veryfast',
//     '-tune', 'zerolatency',
//     '-b:v', '900k',
//     '-f', 'hls',
//     '-hls_time', '6',
//     '-hls_list_size', '0',
//     `${outputDir}stream.m3u8`
//   ]);
  
//   ffmpegProcess.stdout.on('data', (data) => {
//     console.log(`FFMPEG stdout: ${data}`);
//   });
  
//   ffmpegProcess.stderr.on('data', (data) => {
//     console.error(`FFMPEG stderr: ${data}`);
//   });
  
//   ffmpegProcess.on('close', (code) => {
//     console.log(`FFMPEG process exited with code ${code}`);
//   });
  
//   process.on('SIGINT', () => {
//     console.log('Stopping FFMPEG process...');
//     ffmpegProcess.kill('SIGINT');
//   });
// }
