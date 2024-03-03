import * as ValidatorHelper from '../../../helpers/validatorHelper';

const Joi = require('joi');

const objSchema = Joi.object({
  ten_may_do: Joi.string().messages(ValidatorHelper.messageDefine('đơn vị')),
  loai_may_do: Joi.string(),
  ma_may: Joi.string(),
  do_chinh_xac: Joi.number(),
  thoi_gian_hoi_dap: Joi.number(),
  ghi_chu: Joi.string(),
});

export function validate(data, method) {
  let schema = ValidatorHelper.createValidatorSchema(objSchema, data, method);
  const { value, error } = schema.validate(data, { allowUnknown: true, abortEarly: true });
  if (error && error.details) {
    return { error };
  }
  return { value };
}
