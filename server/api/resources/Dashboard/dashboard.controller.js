import * as responseAction from '../../helpers/responseHelper';
import queryHelper from '../../helpers/queryHelper';
import VEHICLE from '../VehicleList/vehicle.model';
import * as UnitService from '../Unit/unit.service';
const mongoose = require('mongoose');

async function convertCriteria(req, criteria) {
  if (criteria.tu_ngay && !criteria.tu_ngay?.hasOwnProperty('$exists')) {
    if (criteria.den_ngay && !criteria.den_ngay.hasOwnProperty('$exists')) {
      criteria.created_at = {
        $gte: criteria.tu_ngay,
        $lte: criteria.den_ngay,
      };
    } else {
      criteria.created_at = { $gte: criteria.tu_ngay };
    }
  } else {
    if (criteria.den_ngay && !criteria.den_ngay.hasOwnProperty('$exists')) {
      criteria.created_at = { $lte: criteria.den_ngay };
    }
  }
  delete criteria.tu_ngay;
  delete criteria.den_ngay;
  return criteria;
}

export async function getDataBlackListPercent(req, res) {
  try {
    const query = queryHelper.extractQueryParam(req);
    let { criteria } = query;
    criteria = await convertCriteria(req, criteria);

    let objQueryUnit = {};
    let unitIdList = {};
    if (!req.user?.is_system_admin) {
      unitIdList = await UnitService.getDonViQuery(req, null);
      unitIdList['$in'] = unitIdList['$in'].map(function (id) {
        return mongoose.Types.ObjectId(id);
      });

      objQueryUnit['camera.unit_id'] = unitIdList;
    }

    const countBlackList = await VEHICLE.aggregate(
      [
        {
          $match: criteria
        },
        {
          $match: {
            "$and": [
              { is_black_list: true },
              criteria
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
          $count: "count_vehicle_blacklist"
        }
      ]
    );

    const countOther = await VEHICLE.aggregate(
      [
        {
          $match: criteria
        },
        {
          $match: {
            "$and": [
              { is_black_list: false },
              criteria
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
          $count: "count_vehicle_other"
        }
      ]
    );

    const dataRes = {
      countBlackList: countBlackList[0]?.count_vehicle_blacklist || 0,
      countOther: countOther[0]?.count_vehicle_other || 0,
    };

    responseAction.success(res, dataRes);
  } catch (err) {
    responseAction.error(res, err);
  }
}

export async function getDataVehiclePercent(req, res) {
  try {
    const query = queryHelper.extractQueryParam(req);
    let { criteria } = query;
    criteria = await convertCriteria(req, criteria);

    let objQueryUnit = {};
    let unitIdList = {};
    if (!req.user?.is_system_admin) {
      unitIdList = await UnitService.getDonViQuery(req, null);
      unitIdList['$in'] = unitIdList['$in'].map(function (id) {
        return mongoose.Types.ObjectId(id);
      });

      objQueryUnit['camera.unit_id'] = unitIdList;
    }

    const countCar = await VEHICLE.aggregate(
      [
        {
          $match: criteria
        },
        {
          $match: {
            vehicle_type: { "$regex": "O_TO" },
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
          $count: "count_car"
        }
      ]
    );

    const countMotor = await VEHICLE.aggregate(
      [
        {
          $match: criteria
        },
        {
          $match: {
            vehicle_type: { "$regex": "XE_MAY" },
            // confirm_status: { $nin: ["CHUA_XAC_NHAN"] }
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
          $count: "count_motor"
        }
      ]
    );

    const countCoach = await VEHICLE.aggregate(
      [
        {
          $match: criteria
        },
        {
          $match: {
            vehicle_type: { "$regex": "XE_KHACH" },
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
          $count: "count_coach"
        }
      ]
    );

    const countTruck = await VEHICLE.aggregate(
      [
        {
          $match: criteria
        },
        {
          $match: {
            vehicle_type: { "$regex": "XE_TAI" },
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
          $count: "count_truck"
        }
      ]
    );

    const dataRes = {
      countCar: countCar[0]?.count_car || 0,
      countMotor: countMotor[0]?.count_motor || 0,
      countCoach: countCoach[0]?.count_coach || 0,
      countTruck: countTruck[0]?.count_truck || 0,
    };

    responseAction.success(res, dataRes);
  } catch (err) {
    responseAction.error(res, err);
  }
}

export async function getDataVehicleQuality(req, res) {
  try {
    const query = queryHelper.extractQueryParam(req);
    let { criteria } = query;
    criteria = await convertCriteria(req, criteria);

    let objQueryUnit = {};
    let unitIdList = {};
    if (!req.user?.is_system_admin) {
      unitIdList = await UnitService.getDonViQuery(req, null);
      unitIdList['$in'] = unitIdList['$in'].map(function (id) {
        return mongoose.Types.ObjectId(id);
      });

      objQueryUnit['camera.unit_id'] = unitIdList;
    }

    const countByDateOrigin = await VEHICLE.aggregate(
      [
        {
          $match: criteria
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
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$created_at" }
              },
              type: "$vehicle_type"
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { created_at: -1 }
        }
      ]
    );

    const countByDate = countByDateOrigin.map(item => ({
      date: item._id.date,
      type: item._id.type,
      value: item.count
    }));

    responseAction.success(res, countByDate);
  } catch (err) {
    responseAction.error(res, err);
  }
}