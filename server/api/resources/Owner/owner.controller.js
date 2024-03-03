import * as Service from "./owner.service";
import Model from "./owner.model";
import VEHICLE from "./../VehicleList/vehicle.model";

import queryHelper from "../../helpers/queryHelper";
import * as controllerHelper from "../../helpers/controllerHelper";
import * as responseHelper from "../../helpers/responseHelper";

import { findOneById } from "../../helpers/controllerHelper";
import { STORE_DIRS } from "../../constant/constant";
import * as fileUtils from "../../utils/fileUtils";

const searchLike = [];
const populateOpts = [];
const uniqueOpts = [];
const sortOpts = "";

export const findOne = controllerHelper.createFindOneFunction(Model, populateOpts);
export const remove = controllerHelper.createRemoveFunction(Model);

export async function create(req, res) {
  try {
    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, error, 400);
    const { t } = req;

    const checkData = await Model.findOne({ license_plates: value.license_plates });
    if (checkData) {
      return res.status(400).json({ success: false, message: t("error_license_plates_is_registered") });
    }
    const data = await Model.create(value);

    const createdData = await findOneById(Model, data._id, populateOpts, true);

    return responseHelper.success(res, createdData);
  } catch (err) {
    return responseHelper.error(res, err, 500);
  }
}

export async function findByLicensePlates(req, res) {
  try {
    const license_plates = req.params.license_plates;
    const data = await Model.find({ license_plates: license_plates });
    if (data) {
      return responseHelper.success(res, data);
    }
  } catch (error) {
    return responseHelper.error(res, err, 500);
  }
}

export async function update(req, res) {
  try {
    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, error, 400);

    //   const dataSettingSystem = await CAI_DAT_HE_THONG.findOne();

    const { t } = req;
    const { license_plates } = req.params;

    let updatedData = await Model.findOneAndUpdate({ license_plates: license_plates }, value, { new: true })
      .populate(populateOpts)
      .lean();
    if (!updatedData) {
      return responseHelper.error(res, CommonError.NOT_FOUND);
    }

    // const cameraData = await CAMERA.findById(updatedData.camera_id).lean();
    // if (!cameraData) return null;

    return responseHelper.success(res, updatedData);
  } catch (err) {
    return responseHelper.error(res, err, 500);
  }
}
