import * as Service from './visits.service';
import Model from './visits.model';
import * as controllerHelper from '../../../helpers/controllerHelper';
import * as responseHelper from '../../../helpers/responseHelper';
import { pageFindOneOrCreate } from '../Pages/pages.service';
import { deviceFindOneOrCreate } from '../Devices/devices.service';
import { referrerFindOneOrCreate } from '../Referrers/referrers.service';
import { Schema } from 'mongoose';
import { DEVICES, PAGES, REFERRERS, USER } from '../../../constant/dbCollections';


const populateOpts = [];
const uniqueOpts = [{ field: 'ma_may', message: 'Mã máy đo' }];

export const remove = controllerHelper.createRemoveFunction(Model);
export const findOne = controllerHelper.createFindOneFunction(Model);
export const create = async (req, res) => {
  try {
    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, error, 400);

    const {
      user_id,
      page_url,
      page_title,
      ip_address,
      browser,
      operating_system,
      device_type,
      device_branch,
      device_model,
      referrer,
    } = value;
    const page = await pageFindOneOrCreate(value)
    const device = await deviceFindOneOrCreate(value)
    const sourceReferrer = await referrerFindOneOrCreate(value)
    const data = await Model.create({
      user_id,
      page_id: page?._id,
      device_id: device?._id,
      referrer_id: sourceReferrer?._id,
      ip_address,
      browser,
      operating_system,
    });
    return responseHelper.success(res, data);
  } catch (err) {
    return responseHelper.error(res, err, 500);
  }
};
export const update = controllerHelper.createUpdateByIdFunction(Model, Service, populateOpts, uniqueOpts);
export const getAll = controllerHelper.createGetAllFunction(Model, ['ten_may', 'loai_may', 'ma_may']);
