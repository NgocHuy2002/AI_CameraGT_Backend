import * as responseHelper from './responseHelper';
import queryHelper from './queryHelper';
import CommonError from '../error/CommonError';
// import * as DonViService from '../resources/Unit/unit.service';

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

export function createFindOneFunction(Model, populateOps = null) {
  return async function findOne(req, res) {
    try {
      const { id } = req.params;
      const data = await findOneById(Model, id, populateOps, true);
      if (!data) {
        return responseHelper.error(res, CommonError.NOT_FOUND);
      }
      return responseHelper.success(res, data);
    } catch (err) {
      responseHelper.error(res, err);
    }
  };
}

export function createRemoveFunction(Model, callback = null) {
  return async function remove(req, res) {
    try {
      const { id } = req.params;
      const data = await Model.findOneAndUpdate({ _id: id }, { is_deleted: true }, { new: true });
      if (!data) {
        return responseHelper.error(res, CommonError.NOT_FOUND);
      }
      if (callback) callback(data);
      return responseHelper.success(res, data);
    } catch (err) {
      responseHelper.error(res, err);
    }
  };
}

export function createUpdateByIdFunction(Model, Service, populateOps = null, uniqueOpts = [], callback = null) {
  return async function update(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = Service.validate(req.body);
      if (error) return responseHelper.error(res, error, 400);
      
      if (Array.isArray(uniqueOpts) && uniqueOpts.length) {
        for (let i = 0; i < uniqueOpts.length; i++) {
          const { field, message } = uniqueOpts[i];
          const checkUnique = await Model.findOne({ [field]: value[field], _id: { $ne: id }, is_deleted: false });
          if (checkUnique) {
            return responseHelper.error(res, { message: message + ' đã tồn tại, vui lòng kiểm tra và thử lại' }, 404);
          }
        }
      }

      // value.nguoi_chinh_sua = req.user._id;
      if (!value.updated_at) {
        value.updated_at = Date.now();
      }
      const data = await Model.findOneAndUpdate({ _id: id }, value, { new: true });
      if (!data) {
        return responseHelper.error(res, CommonError.NOT_FOUND);
      }
      const updatedData = await findOneById(Model, id, populateOps, true);
      if (callback) callback(updatedData);
      return responseHelper.success(res, updatedData);
    } catch (err) {
      responseHelper.error(res, err);
    }
  };
}

export function createCreateFunction(Model, Service, populateOps = null, uniqueOpts = [], callback = null) {
  return async function create(req, res) {
    try {
      const { error, value } = Service.validate(req.body);
      if (error) return responseHelper.error(res, error, 400);

      if (Array.isArray(uniqueOpts) && uniqueOpts.length) {
        for (let i = 0; i < uniqueOpts.length; i++) {
          const { field, message } = uniqueOpts[i];
          const checkUnique = await Model.findOne({ [field]: value[field], is_deleted: false });
          if (checkUnique) {
            return responseHelper.error(res, { message: message + ' đã tồn tại, vui lòng kiểm tra và thử lại' }, 404);
          }
        }
      }

      // value.nguoi_tao = req.user._id;
      // value.nguoi_chinh_sua = req.user._id;
      const data = await Model.create(value);
      const createdData = await findOneById(Model, data._id, populateOps, true);
      if (callback) callback(createdData);
      return responseHelper.success(res, createdData);
    } catch (err) {
      return responseHelper.error(res, err, 500);
    }
  };
}

export function createGetAllFunction(Model, searchLikes = null, populateOps = null, sortOpts = null, donViProperty = null) {
  return async function getAll(req, res) {
    try {
      const query = queryHelper.extractQueryParam(req, searchLikes, true, false);
      const { criteria, options } = query;
      // if (donViProperty) {
      //   criteria[donViProperty] = await DonViService.getDonViQuery(req, criteria[donViProperty]);
      // }
      if (populateOps) {
        options.populate = populateOps;
      }
      if (sortOpts) {
        options.sort = sortOpts;
      }
      if (req.query.all) {
        let queryPromise = Model.find(criteria).sort(sortOpts).collation({ locale: 'vi' });
        queryPromise.lean = true;
        if (populateOps) {
          populateOps.forEach(populateOp => {
            queryPromise.populate(populateOp);
          });
        }
        const data = await queryPromise;
        responseHelper.success(res, data);
      } else {
        const data = await Model.paginate(criteria, options);
        responseHelper.success(res, data);
      }
    } catch (err) {
      responseHelper.error(res, err);
    }
  };
}

export async function createOrUpdateChild(child = [], Service, parentField, parentId) {
  const childUpdate = child.filter(row => row._id);
  await Service.updateAll(childUpdate);
  let childCreate = child.filter(row => !row.hasOwnProperty('_id'));
  childCreate.forEach(row => row[parentField] = parentId);
  await Service.create(childCreate);
}

export async function createChild(child = [], Service, parentField, parentId) {
  child.forEach(row => {
    row[parentField] = parentId;
  });
  return Service.create(child);
}
