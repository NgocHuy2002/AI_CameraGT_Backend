import * as Service from './cameraType.service';
import Model from './cameraType.model';
import * as controllerHelper from '../../helpers/controllerHelper';

const searchLike = ['name', 'brand'];
const populateOpts = [];
const uniqueOpts = [];
const sortOpts = '';

export const findOne = controllerHelper.createFindOneFunction(Model, populateOpts);
export const remove = controllerHelper.createRemoveFunction(Model);
export const create = controllerHelper.createCreateFunction(Model, Service, populateOpts, uniqueOpts);
export const update = controllerHelper.createUpdateByIdFunction(Model, Service, populateOpts, uniqueOpts);
export const getAll = controllerHelper.createGetAllFunction(Model, searchLike, populateOpts, sortOpts);

