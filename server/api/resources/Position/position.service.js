import * as ValidatorHelper from '../../helpers/validatorHelper';
import POSITION from './position.model';

export function getAll(query) {
  return POSITION.find(query).lean();
}

const Joi = require('joi');

const objSchema = Joi.object({
  name: Joi.string().required().messages(ValidatorHelper.messageDefine('Tên vị trí')),
});

export function validate(data, method) {
  let schema = ValidatorHelper.createValidatorSchema(objSchema, data, method);
  const { value, error } = schema.validate(data, { allowUnknown: true, abortEarly: true });
  if (error && error.details) {
    return { error };
  }
  return { value };
}
