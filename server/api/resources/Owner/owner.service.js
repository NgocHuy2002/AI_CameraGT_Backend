import * as ValidatorHelper from '../../helpers/validatorHelper';
import owner from './owner.model';

export function getAll(query) {
  return owner.find(query).lean();
}

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
