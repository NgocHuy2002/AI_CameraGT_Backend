import * as Service from './mayDo.service';
import Model from './mayDo.model';
import * as controllerHelper from '../../../helpers/controllerHelper';


const populateOpts = [];
const uniqueOpts = [{ field: 'ma_may', message: 'Mã máy đo' }];

export const remove = controllerHelper.createRemoveFunction(Model);
export const findOne = controllerHelper.createFindOneFunction(Model);
export const create = controllerHelper.createCreateFunction(Model, Service, populateOpts, uniqueOpts);
export const update = controllerHelper.createUpdateByIdFunction(Model, Service, populateOpts, uniqueOpts);
export const getAll = controllerHelper.createGetAllFunction(Model, ['ten_may', 'loai_may', 'ma_may']);
