import * as Service from './notification.service';
import Model from './notification.model';
import * as controllerHelper from '../../helpers/controllerHelper';
import * as responseHelper from '../../helpers/responseHelper';
import queryHelper from '../../helpers/queryHelper';

const populateOpts = [];

export const findOne = controllerHelper.createFindOneFunction(Model, populateOpts);
export const remove = controllerHelper.createRemoveFunction(Model);
export const update = controllerHelper.createUpdateByIdFunction(Model, Service, populateOpts);
export const create = controllerHelper.createCreateFunction(Model, Service, populateOpts);

export async function getAll(req, res) {
  try {
    const { t } = req;
    let user = req.user;
    const query = queryHelper.extractQueryParam(req, null, true, false);
    const { criteria, options } = query;
    criteria.user_id = user.id;
    options.sort = { created_at: -1 };
    const data = await Model.paginate(criteria, options);

    for (let noti of data.docs) {
      const notiMultiLang = await Service.multiLanguageNotify(t, noti);
      noti = notiMultiLang;
    }

    return responseHelper.success(res, data);
  } catch (err) {
    responseHelper.error(res, err);
  }
}

export async function getAllSent(req, res) {
  try {
    let user = req.user;
    const data = await Model.find({
      user_id: user.id,
      status: 'SENT',
    }).lean()
    return responseHelper.success(res, {count: data?.length || 0});
  } catch (err) {
    responseHelper.error(res, err);
  }
}
