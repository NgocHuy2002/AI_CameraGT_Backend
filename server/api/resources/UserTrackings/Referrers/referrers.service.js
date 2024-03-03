import * as ValidatorHelper from '../../../helpers/validatorHelper';
import REFERRERS from './referrers.model';

const Joi = require('joi');

const objSchema = Joi.object({

});

export async function referrerFindOneOrCreate(data) {
  const { referrer } = data;
  if (!referrer) return null;
  const existOne = await REFERRERS.findOne({ source:referrer });
  if (existOne) return existOne;
  return await REFERRERS.create(data);
}

export function validate(data, method) {
  let schema = ValidatorHelper.createValidatorSchema(objSchema, data, method);
  const { value, error } = schema.validate(data, { allowUnknown: true, abortEarly: true });
  if (error && error.details) {
    return { error };
  }
  return { value };
}
