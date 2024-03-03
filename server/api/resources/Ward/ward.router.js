import express from 'express';
import passport from 'passport';
import * as wardController from './ward.controller';
import { authorizationMiddleware } from '../RBAC/middleware';
import WardPermission from '../RBAC/permissions/WardPermission';
import { loggerMiddleware } from '../../logs/middleware';

export const wardRouter = express.Router();
wardRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
wardRouter.post('*', authorizationMiddleware([WardPermission.CREATE]));
wardRouter.get('*', authorizationMiddleware([WardPermission.READ]));
wardRouter.put('*', authorizationMiddleware([WardPermission.UPDATE]));
wardRouter.delete('*', authorizationMiddleware([WardPermission.DELETE]));

wardRouter
  .route('/')
  .get(wardController.getAll)
  .post(wardController.create);

wardRouter
  .route('/:id')
  .get(wardController.findOne)
  .delete(wardController.remove)
  .put(wardController.update);