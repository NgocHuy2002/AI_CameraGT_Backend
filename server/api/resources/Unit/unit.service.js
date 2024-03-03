import * as ValidatorHelper from '../../helpers/validatorHelper';
import UNIT from './unit.model';
import { Types } from 'mongoose';

export function getAll(query) {
  return UNIT.find(query).lean();
}

const Joi = require('joi');

const objSchema = Joi.object({
  name: Joi.string().required().messages(ValidatorHelper.messageDefine('Tên đơn vị')),
  code: Joi.string().required().messages(ValidatorHelper.messageDefine('Mã đơn vị')),
});

export function validate(data, method) {
  let schema = ValidatorHelper.createValidatorSchema(objSchema, data, method);
  const { value, error } = schema.validate(data, { allowUnknown: true, abortEarly: true });
  if (error && error.details) {
    return { error };
  }
  return { value };
}

export async function getDonViQuery(req, querryDonViId = null, keepIdObject) {
  const availableDonViIds = await getDonViInScope(req.user?.unit_id);
  let donViQuery = [];
  if (querryDonViId) {
    if (availableDonViIds.includes(querryDonViId)) {
      donViQuery = await getDonViInScope(querryDonViId);
    } else {
      donViQuery = [Types.ObjectId()];
    }
  } else {
    donViQuery = availableDonViIds;
  }
  if (keepIdObject) {
    donViQuery = donViQuery.map(id => Types.ObjectId(id));
  }
  return { $in: donViQuery };
}

export async function getDonViQueryIncludeDeleted(req, querryDonViId = null, keepIdObject) {
  const availableDonViIds = await getDonViInScope(req.user?.unit_id, true);
  let donViQuery = [];
  if (querryDonViId) {
    if (availableDonViIds.includes(querryDonViId)) {
      donViQuery = await getDonViInScope(querryDonViId, true);
    } else {
      donViQuery = [Types.ObjectId()];
    }
  } else {
    donViQuery = availableDonViIds;
  }
  if (keepIdObject) {
    donViQuery = donViQuery.map(id => Types.ObjectId(id));
  }
  return { $in: donViQuery };
}

export async function getDonViInScope(currentDonViId, includeDeletedUnit = false) {
  const currentDonVi = await UNIT.findById(currentDonViId);
  if (!currentDonVi) return [];
  let parentIs = [currentDonVi._id.toString()];
  let donViSet = new Set([...parentIs]);
  while (parentIs.length) {
    if(includeDeletedUnit){
      const children = await UNIT.find({ parent_id: { $in: parentIs } }).lean();
      parentIs = children.map(child => child._id.toString());
    } else {
      const children = await UNIT.find({ is_deleted: false, parent_id: { $in: parentIs } }).lean();
      parentIs = children.map(child => child._id.toString());
    }
    donViSet = new Set([...donViSet, ...parentIs]);
  }
  return [...donViSet.values()];
}
