import * as ValidatorHelper from '../../helpers/validatorHelper';
import ROLE from './role.model';

const Joi = require('joi');

const objSchema = Joi.object({});

export function validate(data, method) {
  let schema = ValidatorHelper.createValidatorSchema(objSchema, data, method);
  const { value, error } = schema.validate(data, { allowUnknown: true, abortEarly: true });
  if (error && error.details) {
    return { error };
  }
  return { value };
}

export function getAll(query, projection = {}) {
  return ROLE.find(query, projection).lean();
}
