import Role from './role.model';
import Model from './role.model';
import * as responseAction from '../../helpers/responseHelper';
import queryHelper from '../../helpers/queryHelper';
import * as controllerHelper from '../../helpers/controllerHelper';
import { ROLE_CODES } from '../../constant/constant';
import { getPermissionByUserId, handleCheckOverPermission } from '../User/user.controller';
import * as Service from './role.service';

function deleteALl(req, res) {
  Role.remove({}, err => {
    if (err) {
      res.json(err);
    } else {
      res.json('Delete all rolse success');
    }
  });
}

async function getAll(req, res) {
  try {
    const query = queryHelper.extractQueryParam(req, ['code', 'name']);
    const { criteria, options } = query;
    options.sort = { name: 1 };
    // if (!criteria.code) {
    //   criteria.code = { $ne: ROLE_CODES.CODE_SYSTEM_ADMIN };
    // } else if (criteria.code === ROLE_CODES.CODE_SYSTEM_ADMIN) {
    //   criteria.code = undefined;
    // }
    // if (!req.user.is_system_admin) {
    //   const allData = await Model.find(criteria, { permissions: 1 }).lean();
    //   const userReqPermissions = await getPermissionByUserId(req.user._id);
    //   let excludeIds = [];
    //   allData.forEach(role => {
    //     if (role.permissions.filter(n => !userReqPermissions.includes(n)).length) {
    //       excludeIds = [...excludeIds, role._id];
    //     }
    //   });
    //   criteria._id = { $nin: excludeIds };
    // }
    const data = await Model.paginate(criteria, options);
    return responseAction.success(res, data);
  } catch (err) {
    console.error(err);
    return responseAction.error(res, err, 500);
  }
}

const uniqueOpts = [{ field: 'code', message: 'Mã vai trò' }];
export const update = controllerHelper.createUpdateByIdFunction(Model, Service, null, uniqueOpts);
export const create = controllerHelper.createCreateFunction(Model, Service, null, uniqueOpts);

function deleteById(req, res) {
  let idDelete = req.params.id;
  Role.deleteOne({ _id: idDelete })
    .exec()
    .then(docs => responseAction.success(res, { _id: idDelete }))
    .catch(err => responseAction.error(res, err));
}

function getById(req, res) {
  Role.findById(req.params.id).exec()
    .then(docs => responseAction.success(res, docs))
    .catch(err => responseAction.error(res, err));
}

export { deleteALl, getAll, deleteById, getById };
