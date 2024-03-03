import * as ValidatorHelper from '../../helpers/validatorHelper';
import blackList from './blackList.model';

export function getAll(query) {
  return blackList.find(query).lean();
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
