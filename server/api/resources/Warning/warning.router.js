import express from 'express';
import passport from 'passport';
import * as warningController from './warning.controller';
import { authorizationMiddleware } from '../RBAC/middleware';
import WarningPermission from '../RBAC/permissions/WarningPermission';
import { loggerMiddleware } from '../../logs/middleware';
import { multipartMiddleware } from '../../utils/fileUtils';

export const warningRouter = express.Router();
warningRouter.use(loggerMiddleware);
// warningRouter.post('*', authorizationMiddleware([WarningPermission.CREATE]));
warningRouter.get('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([WarningPermission.READ]));
warningRouter.put('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([WarningPermission.UPDATE]));
warningRouter.delete('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([WarningPermission.DELETE]));

warningRouter
  .route('/')
  .get(warningController.getAll)
  .post(multipartMiddleware, warningController.create);

warningRouter
  .route('/:id')
  .get(warningController.findOne)
  .delete(warningController.remove)
  .put(warningController.update);
