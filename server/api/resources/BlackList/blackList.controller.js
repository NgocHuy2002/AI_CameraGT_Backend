import * as Service from "./blackList.service";
import Model from "./blackList.model";
import CAMERA from "./../Camera/camera.model";
import VEHICLE from "./../VehicleList/vehicle.model";

import queryHelper from "../../helpers/queryHelper";
import * as controllerHelper from "../../helpers/controllerHelper";
import * as responseHelper from "../../helpers/responseHelper";
import * as NotificationService from "../Notification/notification.service";

import { findOneById } from "../../helpers/controllerHelper";
import { update } from "./../VehicleList/vehicle.controller";
import * as UserService from "../User/user.service";
import { NOTIFICATION_ACTION, NOTIFICATION_TYPE } from "../Notification/notification.constants";
import { STORE_DIRS } from "../../constant/constant";
import * as fileUtils from "../../utils/fileUtils";
import { extractIds } from "../../utils/dataconverter";
import * as responseAction from "../../helpers/responseHelper";

const searchLike = ["license_plates"];
const populateOpts = [];
const uniqueOpts = [];
const sortOpts = "";

export const findOne = controllerHelper.createFindOneFunction(Model, populateOpts);
// export const remove = controllerHelper.createRemoveFunction(Model);
export async function remove(req, res) {
  try {
    const { license_plates } = req.params;
    const data = await Model.findOneAndUpdate({ license_plates: license_plates }, { is_deleted: true }, { new: true });
    if (!data) {
      return responseHelper.error(res, CommonError.NOT_FOUND);
    }
    return responseHelper.success(res, data);
  } catch (error) {
    responseHelper.error(res, error);
  }
}

export async function updateByLicensePlates(req, res) {
  try {
    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, error, 400);

    const { t } = req;
    const { license_plates } = req.params;
    let vehicleData = await VEHICLE.find({ license_plates: license_plates, is_deleted: false });
    if (vehicleData) {
      await update({ params: { license_plates }, body: value }, res);
    }
    let checkData = await Model.find({ license_plates: license_plates, is_deleted: false });
    if (checkData) {
      return responseHelper.success(res, updatedData);
    }
    let updatedData = await Model.updateOne({ license_plates: license_plates, is_deleted: false }, value, { new: true })
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

export async function create(req, res) {
  try {
    let userData = [];

    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, error, 400);
    const { t } = req;
    const userResponse = await UserService.getAll();

    userData = [...userData, ...userResponse];
    const userNotiId = extractIds(userData);

    const checkData = await Model.findOne({ license_plates: value.license_plates, is_deleted: false });

    if (checkData) {
      return res.status(400).json({ success: false, message: t("error_license_plates_is_in_is_black_list") });
    }
    const data = await Model.create(value);

    const createdData = await findOneById(Model, data._id, populateOpts, true);

    // await NotificationService.notification(NOTIFICATION_TYPE.SYSTEM_TO_USER, NOTIFICATION_ACTION.XAC_NHAN_DANH_SACH_DEN, userNotiId, createdData, t);

    return responseHelper.success(res, createdData);
  } catch (err) {
    return responseHelper.error(res, err, 500);
  }
}

export async function getAll(req, res) {
  try {
    const query = queryHelper.extractQueryParam(req, searchLike);
    const { criteria, options } = query;
    options.populate = populateOpts;
    options.sort = { created_at: -1 };
    const data = await Model.paginate(criteria, options);
    responseAction.success(res, data);
  } catch (err) {
    console.log(err);
    responseAction.error(res, err);
  }
}
