import express from 'express';
import passport from 'passport';
import * as cameraTypeController from './cameraType.controller';
import { authorizationMiddleware } from '../RBAC/middleware';
import CameraTypePermission from '../RBAC/permissions/CameraTypePermission';
import { loggerMiddleware } from '../../logs/middleware';

export const cameraTypeRouter = express.Router();
cameraTypeRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
cameraTypeRouter.post('*', authorizationMiddleware([CameraTypePermission.CREATE]));
cameraTypeRouter.get('*', authorizationMiddleware([CameraTypePermission.READ]));
cameraTypeRouter.put('*', authorizationMiddleware([CameraTypePermission.UPDATE]));
cameraTypeRouter.delete('*', authorizationMiddleware([CameraTypePermission.DELETE]));

cameraTypeRouter
  .route('/')
  .get(cameraTypeController.getAll)
  .post(cameraTypeController.create);

cameraTypeRouter
  .route('/:id')
  .get(cameraTypeController.findOne)
  .delete(cameraTypeController.remove)
  .put(cameraTypeController.update);
