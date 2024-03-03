import express from 'express';
import passport from 'passport';
import * as dmMayDoController from './mayDo.controller';
import { authorizationMiddleware } from '../../RBAC/middleware';
import Permission from '../../RBAC/permissions/DanhMucPermission';
import { loggerMiddleware } from '../../../logs/middleware';

export const pagesRouter = express.Router();
pagesRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
pagesRouter.post('*', authorizationMiddleware([Permission.CREATE]));
pagesRouter.put('*', authorizationMiddleware([Permission.UPDATE]));
pagesRouter.delete('*', authorizationMiddleware([Permission.DELETE]));
pagesRouter.route('/')
  .get(dmMayDoController.getAll)
  .post(dmMayDoController.create);

pagesRouter
  .route('/:id')
  .get(dmMayDoController.findOne)
  .delete(dmMayDoController.remove)
  .put(dmMayDoController.update);
