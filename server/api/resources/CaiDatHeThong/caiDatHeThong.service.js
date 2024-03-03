import * as ValidatorHelper from '../../helpers/validatorHelper';
import CAI_DAT_HE_THONG from './caiDatHeThong.model';

export function getAll(query) {
  return CAI_DAT_HE_THONG.find(query).lean();
}

export function getOne(query, projection = {}) {
  return CAI_DAT_HE_THONG.findOne(query, projection).lean();
}


const Joi = require('joi');

const objSchema = Joi.object({
  don_vi_reset: Joi.string().messages(ValidatorHelper.messageDefine('đơn vị')),
  don_vi_dang_nhap: Joi.string().messages(ValidatorHelper.messageDefine('đơn vị')),
  phien_dang_nhap: Joi.number().messages(ValidatorHelper.messageDefine('Thời gian hết phiên đăng nhập')),
  phien_reset: Joi.number().messages(ValidatorHelper.messageDefine('Thời gian hết phiên reset')),
});

export function validate(data, method) {
  let schema = ValidatorHelper.createValidatorSchema(objSchema, data, method);
  const { value, error } = schema.validate(data, { allowUnknown: true, abortEarly: true });
  if (error && error.details) {
    return { error };
  }
  return { value };
}
