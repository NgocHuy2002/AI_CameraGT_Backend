import Model from './serverLog.model';
import queryHelper from '../../helpers/queryHelper';
import * as responseHelper from '../../helpers/responseHelper';
import { getFilePath } from '../../utils/fileUtils';
import moment from 'moment';
import { STORE_DIRS } from '../../constant/constant';
import * as controllerHelper from '../../helpers/controllerHelper';

const populateOpts = [
  { path: 'req_user_id', select: 'full_name' },
  { path: 'req_unit_id', select: 'name' },
];
const sortOpts = { created_at: -1 };
const searchLike = [];

export const getAll = controllerHelper.createGetAllFunction(Model, searchLike, populateOpts, sortOpts);

export async function downloadFileLog(req, res) {
  try {
    const query = queryHelper.extractQueryParam(req);
    const { criteria } = query;
    const fileName = `${moment(criteria.date_log).format('YYYY-MM-DD')}.txt`;
    const filePath = getFilePath(fileName, STORE_DIRS.LOGGER_DATA);
    res.download(filePath, fileName);
  } catch (err) {
    responseHelper.error(res, err);
  }
}
