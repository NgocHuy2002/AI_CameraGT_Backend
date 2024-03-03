import * as Service from "./camera.service";
import * as UnitService from "../Unit/unit.service";
import Model from "./camera.model";
import * as controllerHelper from "../../helpers/controllerHelper";
import queryHelper from "../../helpers/queryHelper";
import * as responseAction from "../../helpers/responseHelper";
import CommonError from "../../error/CommonError";

import ModelVehicle from "../VehicleList/vehicle.model";
import ModelUnit from "../Unit/unit.model";

const searchLike = ["name"];
const populateOpts = [
  { path: "type_id" },
  { path: "position_id" },
  {
    path: "unit_id",
    populate: { path: "parent_id", select: "name" }
  }
];

const uniqueOpts = [{ field: 'domain', message: 'Tên miền' }];
const sortOpts = '';

// export const findOne = controllerHelper.createFindOneFunction(Model, populateOpts);
export const remove = controllerHelper.createRemoveFunction(Model);
export const create = controllerHelper.createCreateFunction(Model, Service, populateOpts, uniqueOpts);
export const update = controllerHelper.createUpdateByIdFunction(Model, Service, populateOpts, uniqueOpts);

export async function findOneById(Model, id, populateOps, lean) {
  let queryPromise = Model.findById(id);
  if (populateOps) {
    populateOps.forEach(populateOp => {
      queryPromise.populate(populateOp);
    });
  }
  if (lean) {
    queryPromise = queryPromise.lean();
  }
  return queryPromise;
}

export async function findOne(req, res) {
  try {
    const { id } = req.params;
    let data = await findOneById(Model, id, populateOpts, true);
    if (!data) {
      return responseAction.error(res, CommonError.NOT_FOUND);
    }
    return responseAction.success(res, data);
  } catch (err) {
    responseAction.error(res, err);
  }
}

export async function getAll(req, res) {
  try {
    const query = queryHelper.extractQueryParam(req, searchLike);
    const { criteria, options } = query;
    if (!req.user?.is_system_admin) {
      criteria.unit_id = await UnitService.getDonViQuery(req, null);
    }
    options.populate = populateOpts;
    const data = await Model.paginate(criteria, options);
    responseAction.success(res, data);
  } catch (err) {
    console.log(err);
    responseAction.error(res, err);
  }
}

export async function getAllCameraToAi(req, res) {
  try {
    const data = await Model.find({ is_deleted: false }).lean();
    responseAction.success(res, data);
  } catch (err) {
    console.log(err);
    responseAction.error(res, err);
  }
}

export async function getAllNavigationMap(req, res) {
  try {
    const query = queryHelper.extractQueryParam(req, searchLike);
    let { criteria, options } = query;
    let dataCamera = null;
    if(criteria.unit_id){
      let unitId = await ModelUnit.find({ parent_id: criteria.unit_id, is_deleted: false })
        .distinct("_id")
        .lean();

      dataCamera = await Model.find({ unit_id: {$in: [criteria.unit_id, ...unitId]}, is_deleted: false })
        .distinct("_id")
        .lean();
    }

    delete criteria.unit_id;
    const objQuery = { is_deleted: false };
    if (dataCamera) {
      objQuery["camera_id"] = { $in: dataCamera };
    }
    if (criteria.vehicle_type && criteria.vehicle_type !== 'ALL') {
      objQuery["vehicle_type"] = criteria.vehicle_type;
    }
    if (criteria.license_plates) {
      const regexPattern = new RegExp(criteria.license_plates, 'i'); // 'i' để làm cho tìm kiếm không phân biệt chữ hoa chữ thường

      objQuery["license_plates"] = {
          $regex: regexPattern
      };
    }
    if (criteria.time) {
      const startOfDay = new Date(criteria.time['$in'][0]);
      startOfDay.setHours(0, 0, 0, 0); // Đặt thời gian về đầu ngày

      const endOfDay = new Date(criteria.time['$in'][1]);
      endOfDay.setHours(23, 59, 59, 999); // Đặt thời gian về cuối ngày

      objQuery["time"] = {
          $gte: startOfDay,
          $lte: endOfDay
      };
    }
    const populate = [
      {
        path: "camera_id",
        populate: [{ path: "unit_id" }, { path: "position_id" }, { path: "type_id" }]
      }
    ];
    const data = await ModelVehicle.find(objQuery).populate(populate).lean();
    let idVahicle = {};
    let dataCustom = [];
    
    data?.map(item => {
      let index = idVahicle[item.license_plates]
      if(index >= 0){
        if(dataCustom[index] && dataCustom[index]['marker']){
          dataCustom[index]['marker'].push({
            latitude: item?.camera_id?.position_id?.lat || '',
            longitude: item?.camera_id?.position_id?.long || '',
            nameCamera: item?.camera_id?.name || '',
            unit: item?.camera_id?.unit_id?.name || '',
            position: item?.camera_id?.position_id?.name || '',
          })
        }
      } else {
        idVahicle[item.license_plates] = Object.keys(idVahicle).length;
        dataCustom.push({
          marker: [
            {
              latitude: item?.camera_id?.position_id?.lat || '',
              longitude: item?.camera_id?.position_id?.long || '',
              nameCamera: item?.camera_id?.name || '',
              unit: item?.camera_id?.unit_id?.name || '',
              position: item?.camera_id?.position_id?.name || '',
            }
          ],
          key: item?.camera_id?._id,
          license_plates: item?.license_plates || '',
          vehicle_type: item?.vehicle_type || '',
          time: item?.time,
          created_at: item?.created_at,
        })
      }
    });

    responseAction.success(res, {
      docs: dataCustom,
      totalPages: dataCustom.length,
    });
  } catch (err) {
    console.log(err);
    responseAction.error(res, err);
  }
}

export async function getAllMerkerCamera(req, res) {
  try {
    const data = await Model.find({ is_deleted: false })
      .populate(populateOpts)
      .lean();

    responseAction.success(res, data);
  } catch (err) {
    console.log(err);
    responseAction.error(res, err);
  }
}
