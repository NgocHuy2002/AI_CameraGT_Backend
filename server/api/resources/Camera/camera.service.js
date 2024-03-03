import * as ValidatorHelper from '../../helpers/validatorHelper';
import CAMERA from './camera.model';

export function getAll(query) {
  return CAMERA.find(query).lean();
}

const Joi = require('joi');

const objSchema = Joi.object({
  name: Joi.string().required().messages(ValidatorHelper.messageDefine('Tên loại camera')),
  brand: Joi.string().required().messages(ValidatorHelper.messageDefine('Hãng camera')),
});

export function validate(data, method) {
  let schema = ValidatorHelper.createValidatorSchema(objSchema, data, method);
  const { value, error } = schema.validate(data, { allowUnknown: true, abortEarly: true });
  if (error && error.details) {
    return { error };
  }
  return { value };
}
