import * as Service from './ward.service';
import Model from './ward.model';
import * as controllerHelper from '../../helpers/controllerHelper';

const searchLike = ['name', 'code'];
const populateOpts = ['district_id', 'province_id'];
const uniqueOpts = [];
const sortOpts = '';

export const findOne = controllerHelper.createFindOneFunction(Model, populateOpts);
export const remove = controllerHelper.createRemoveFunction(Model);
export const create = controllerHelper.createCreateFunction(Model, Service, populateOpts, uniqueOpts);
export const update = controllerHelper.createUpdateByIdFunction(Model, Service, populateOpts, uniqueOpts);
export const getAll = controllerHelper.createGetAllFunction(Model, searchLike, populateOpts, sortOpts);

