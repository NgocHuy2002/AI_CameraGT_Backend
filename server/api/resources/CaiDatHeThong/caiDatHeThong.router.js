import express from 'express';
import passport from 'passport';
import * as caiDatHeThongController from './caiDatHeThong.controller';
import { authorizationMiddleware } from '../RBAC/middleware';
import SettingPermission from '../RBAC/permissions/SettingPermission';
import { multipartMiddleware } from '../../utils/fileUtils';
import { loggerMiddleware } from '../../logs/middleware';

export const caiDatHeThongRouter = express.Router();

caiDatHeThongRouter
  .route('/linkandroidapp')
  .put(multipartMiddleware, caiDatHeThongController.updateLinkAndroid);

caiDatHeThongRouter
  .route('/androidapp')
  .put(multipartMiddleware, caiDatHeThongController.updateAppAndroid);

caiDatHeThongRouter
  .route('/iosapp')
  .put(multipartMiddleware, caiDatHeThongController.updateAppIos);

caiDatHeThongRouter
  .route('/flightcontrolapp')
  .put(multipartMiddleware, caiDatHeThongController.flightControlApp);

caiDatHeThongRouter
  .route('/modelai')
  .put(multipartMiddleware, caiDatHeThongController.uploadModelAi);

caiDatHeThongRouter
  .route('/serverlog')
  .put(multipartMiddleware, caiDatHeThongController.serverLog);

caiDatHeThongRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
caiDatHeThongRouter.post('*', authorizationMiddleware([SettingPermission.CREATE]));
caiDatHeThongRouter.put('*', authorizationMiddleware([SettingPermission.UPDATE]));
caiDatHeThongRouter.delete('*', authorizationMiddleware([SettingPermission.DELETE]));
caiDatHeThongRouter
  .route('/')
  .get(caiDatHeThongController.findOne)
  .put(caiDatHeThongController.update)
  .post(caiDatHeThongController.notificationCapNhatVersion);

caiDatHeThongRouter
  .route('/:id')
  .get(caiDatHeThongController.findOne);
