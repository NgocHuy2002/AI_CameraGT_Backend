import { config, createLogger, format, transports } from 'winston';
import { getFilePath } from '../utils/fileUtils';
import { STORE_DIRS } from '../constant/constant';
import 'winston-daily-rotate-file';
import 'winston-mongodb';
import moment from 'moment-timezone';
import ServerLogModel from '../resources/ServerLog/serverLog.model';

const { combine, timestamp, printf } = format;

export const usersLogger = createLogger({
  levels: config.syslog.levels,
  format: combine(
    format.errors({ stack: true }),
    timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    printf(info => formatDataLog(info)),
    format.metadata(),
    format.json(),
  ),

  transports: [
    new transports.DailyRotateFile({
      filename: getFilePath(`%DATE%.txt`, STORE_DIRS.LOGGER_DATA),
      format: format.combine(
        format.colorize({
          all: false,
        }),
      ),
    }),
  ],
});

const formatDataLog = (info) => {
  let strRes = '';
  for (let [key, value] of Object.entries(info)) {
    strRes += `${key}: ${value} ,`;
  }
  return strRes;
};

const loggerInfo = (req) => {
  usersLogger.info('Log Request',
    {
      req_user_id: `${req.user?._id}`,
      user_full_name: `${req.user?.full_name}`,
      req_unit_id: `${req.user?.unit_id}`,
      method: `${req.method}`,
      time_log: moment(),
      req_ref: `${req.headers?.referer}`,
      req_api: `${req.headers?.origin + req.originalUrl}`,
      token: `${req.headers?.authorization}`,
    },
  );
};

export function loggerMiddleware(req, res, next) {
  loggerInfo(req);
  next();
}

export async function loggerResponse(req) {
  const dataLog = {
    req_user_id: req.user?._id,
    req_unit_id: req.user?.unit_id,
    req_body: req.body,
    req_ref: req.headers.referer,
    req_api: req.headers.origin + req.originalUrl,
    token: req.headers.authorization,
    time_log: moment(),
    method: req.method,
    res_status_code: req.res.statusCode,
    res_status_message: req.res.statusMessage,
    client: req.headers['Client']
  };
  await ServerLogModel.create(dataLog);
}

export async function loggerError(req, messageErr) {
  const dataLog = {
    req_user_id: req.user?._id,
    req_unit_id: req.user?.unit_id,
    req_url: req.headers.referer,
    token: req.headers.authorization,
    time_log: moment(),
    method: req.method,
    res_status_code: req.res.statusCode,
    res_status_message: messageErr,
  };
  await ServerLogModel.create(dataLog);
}



