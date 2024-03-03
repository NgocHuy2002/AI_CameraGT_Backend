import express from 'express';
import passport from 'passport';
import * as positionController from './position.controller';
import { authorizationMiddleware } from '../RBAC/middleware';
import PositionPermission from '../RBAC/permissions/PositionPermission';
import { loggerMiddleware } from '../../logs/middleware';

export const positionRouter = express.Router();
positionRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
positionRouter.post('*', authorizationMiddleware([PositionPermission.CREATE]));
positionRouter.get('*', authorizationMiddleware([PositionPermission.READ]));
positionRouter.put('*', authorizationMiddleware([PositionPermission.UPDATE]));
positionRouter.delete('*', authorizationMiddleware([PositionPermission.DELETE]));

positionRouter
  .route('/download-template')
  .get(positionController.downloadTemplate);

positionRouter
  .route('/')
  .get(positionController.getAll)
  .post(positionController.create);

positionRouter
  .route('/insert-many')
  .post(positionController.insertMany);

positionRouter
  .route('/:id')
  .get(positionController.findOne)
  .delete(positionController.remove)
  .put(positionController.update);
