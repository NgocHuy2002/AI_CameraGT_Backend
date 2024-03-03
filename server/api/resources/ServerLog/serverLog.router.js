import { Router } from 'express';
import passport from 'passport';
import * as ServerLogsController from './serverLog.controller';

export const serverLogRouter = Router();
serverLogRouter.use(passport.authenticate('jwt', { session: false }));

serverLogRouter.route('/')
  .get(ServerLogsController.getAll);

serverLogRouter.route('/downloadlog')
  .get(ServerLogsController.downloadFileLog);

