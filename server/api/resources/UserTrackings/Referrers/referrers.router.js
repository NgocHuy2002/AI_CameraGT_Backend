import express from 'express';
import passport from 'passport';
import * as dmMayDoController from './mayDo.controller';
import { authorizationMiddleware } from '../../RBAC/middleware';
import Permission from '../../RBAC/permissions/DanhMucPermission';
import { loggerMiddleware } from '../../../logs/middleware';

export const referrersRouter = express.Router();
referrersRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
referrersRouter.post('*', authorizationMiddleware([Permission.CREATE]));
referrersRouter.put('*', authorizationMiddleware([Permission.UPDATE]));
referrersRouter.delete('*', authorizationMiddleware([Permission.DELETE]));
referrersRouter.route('/')
  .get(dmMayDoController.getAll)
  .post(dmMayDoController.create);

referrersRouter
  .route('/:id')
  .get(dmMayDoController.findOne)
  .delete(dmMayDoController.remove)
  .put(dmMayDoController.update);
