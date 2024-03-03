import * as ValidatorHelper from '../../helpers/validatorHelper';
import SERVER_LOG from './serverLog.model';
import moment from 'moment';
import { deleteFile, getFilePath } from '../../utils/fileUtils';
import { STORE_DIRS } from '../../constant/constant';
import { getPastDateFromToday } from '../../common/functionCommons';

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

export function getAll(query, projection = {}) {
  return SERVER_LOG.find(query, projection).lean();
}

export async function deleteLogData() {
  try {
    const oneWeekAgo = getPastDateFromToday(14);
    const apiRes = await SERVER_LOG.deleteMany({ created_at: { $lt: oneWeekAgo } });
    console.log('apiRes', apiRes);
  } catch (err) {
    return err;
  }
}

export function deleteFileLog() {
  try {
    const oneWeekAgo = getPastDateFromToday(7);
    const filePath = getFilePath(`${moment(oneWeekAgo).format('YYYY-MM-DD')}.txt`, STORE_DIRS.LOGGER_DATA);
    deleteFile(filePath);
  } catch (err) {
    return err;
  }
}
