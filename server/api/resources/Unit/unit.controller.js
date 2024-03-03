import * as Service from './unit.service';
import Model from './unit.model';
// import Model from './../DonVi/donVi.model';
import * as responseAction from '../../helpers/responseHelper';
import queryHelper from '../../helpers/queryHelper';
import * as controllerHelper from '../../helpers/controllerHelper';
import * as responseHelper from '../../helpers/responseHelper';

const searchLike = ['name'];
const populateOpts = [];
const uniqueOpts = [];
const sortOpts = '';

export const findOne = controllerHelper.createFindOneFunction(Model, populateOpts);
export const remove = controllerHelper.createRemoveFunction(Model);
export const create = controllerHelper.createCreateFunction(Model, Service, populateOpts, uniqueOpts);
export const update = controllerHelper.createUpdateByIdFunction(Model, Service, populateOpts, uniqueOpts);
// export const getAll = controllerHelper.createGetAllFunction(Model, searchLike, populateOpts, sortOpts);

export async function getAll(req, res) {
  try {
    const query = queryHelper.extractQueryParam(req, ['code', 'name']);
    const { criteria, options } = query;
    if (!req.user?.is_system_admin) {
      criteria._id = await Service.getDonViQuery(req, null);
    }

    options.populate = [
      { path: 'parent_id', select: 'name' },
    ];
    options.sort = { ordinal: 1, name: 1 };
    const data = await Model.paginate(criteria, options);
    responseAction.success(res, data);
  } catch (err) {
    console.log(err);
    responseAction.error(res, err);
  }
}

// export async function getAllOrgUnit(req, res) {
//   try {
//     const query = queryHelper.extractQueryParam(req);
//     const { criteria, options } = query;
//     if (populateOpts) {
//       options.populate = populateOpts;
//     }

//     let queryPromise = Model.find(criteria).collation({ locale: 'vi' });
//     queryPromise.lean = true;

//     if (populateOpts) {
//       populateOpts.forEach(populateOp => {
//         queryPromise.populate(populateOp);
//       });
//     }

//     const data = await queryPromise;
//     return responseHelper.success(res, data);
//   } catch (err) {
//     return responseHelper.error(res, err);
//   }
// };

