import * as ValidatorHelper from '../../helpers/validatorHelper';
import REFRESH_TOKEN from './refreshToken.model';

const Joi = require('joi');
const objSchema = Joi.object({});

export async function create(data) {
  const { error, value } = validate(data);
  if (error) throw error;
  return REFRESH_TOKEN.create(value);
}

export async function deleteOne(data) {
  const { error, value } = validate(data);
  if (error) throw error;
  return REFRESH_TOKEN.deleteOne(value);
}

export async function deleteMany(data) {
  const { error, value } = validate(data);
  if (error) throw error;
  return REFRESH_TOKEN.deleteMany(value);
}

export function getAll(query) {
  return REFRESH_TOKEN.find(query).lean();
}

export const validate = (data, method) => {
  return ValidatorHelper.validate(objSchema, data, method);
};
