import * as ValidatorHelper from '../../../helpers/validatorHelper';
import DEVICES from './devices.model';

const Joi = require('joi');

const objSchema = Joi.object({});

export async function deviceFindOneOrCreate(data) {
  const { device_type, device_branch, device_model } = data;
  if (!device_type) return null;
  const existOne = await DEVICES.findOne({ device_type, device_model });
  if (existOne) return existOne;
  return await DEVICES.create(data);
}

export function validate(data, method) {
  let schema = ValidatorHelper.createValidatorSchema(objSchema, data, method);
  const { value, error } = schema.validate(data, { allowUnknown: true, abortEarly: true });
  if (error && error.details) {
    return { error };
  }
  return { value };
}
