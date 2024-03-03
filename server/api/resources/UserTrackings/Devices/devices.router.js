import express from 'express';
import passport from 'passport';
import * as dmMayDoController from './mayDo.controller';
import { authorizationMiddleware } from '../../RBAC/middleware';
import Permission from '../../RBAC/permissions/DanhMucPermission';
import { loggerMiddleware } from '../../../logs/middleware';

export const devicesRouter = express.Router();
devicesRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
devicesRouter.post('*', authorizationMiddleware([Permission.CREATE]));
devicesRouter.put('*', authorizationMiddleware([Permission.UPDATE]));
devicesRouter.delete('*', authorizationMiddleware([Permission.DELETE]));
devicesRouter.route('/')
  .get(dmMayDoController.getAll)
  .post(dmMayDoController.create);

devicesRouter
  .route('/:id')
  .get(dmMayDoController.findOne)
  .delete(dmMayDoController.remove)
  .put(dmMayDoController.update);
