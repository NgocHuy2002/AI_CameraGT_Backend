import express from 'express';
import passport from 'passport';
import * as visitsController from './visits.controller';
import { authorizationMiddleware } from '../../RBAC/middleware';
import Permission from '../../RBAC/permissions/DanhMucPermission';
import { loggerMiddleware } from '../../../logs/middleware';
import SettingPermission from '../../RBAC/permissions/SettingPermission';

export const visitsRouter = express.Router();
visitsRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
visitsRouter.delete('*', authorizationMiddleware([SettingPermission.DELETE]));
visitsRouter.route('/')
  .get(visitsController.getAll)
  .post(visitsController.create);

visitsRouter
  .route('/:id')
  .get(visitsController.findOne)
  .delete(visitsController.remove)
  .put(visitsController.update);
