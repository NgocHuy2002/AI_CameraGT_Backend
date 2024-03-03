import * as ValidatorHelper from '../../helpers/validatorHelper';
import WARD from './ward.model';

export function getAll(query) {
  return WARD.find(query).lean();
}

const Joi = require('joi');

const objSchema = Joi.object({
  name: Joi.string().required().messages(ValidatorHelper.messageDefine('Tên huyện')),
  code: Joi.string().required().messages(ValidatorHelper.messageDefine('Mã huyện')),
});

export function validate(data, method) {
  let schema = ValidatorHelper.createValidatorSchema(objSchema, data, method);
  const { value, error } = schema.validate(data, { allowUnknown: true, abortEarly: true });
  if (error && error.details) {
    return { error };
  }
  return { value };
}
