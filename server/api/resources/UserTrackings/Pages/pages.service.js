import * as ValidatorHelper from '../../../helpers/validatorHelper';
import PAGES from './pages.model';

const Joi = require('joi');

const objSchema = Joi.object({});

export async function pageFindOneOrCreate(data) {
  const { page_url, page_title } = data;
  if (!page_url) return null
  const existPage = await PAGES.findOne({ url: page_url })
  if(existPage) return existPage
  return await PAGES.create({ url: page_url, title: page_title })
}

export function validate(data, method) {
  let schema = ValidatorHelper.createValidatorSchema(objSchema, data, method);
  const { value, error } = schema.validate(data, { allowUnknown: true, abortEarly: true });
  if (error && error.details) {
    return { error };
  }
  return { value };
}
