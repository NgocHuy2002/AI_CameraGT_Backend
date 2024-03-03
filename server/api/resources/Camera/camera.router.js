import express from 'express';
import passport from 'passport';
import * as cameraController from './camera.controller';
import { authorizationMiddleware } from '../RBAC/middleware';
import CameraPermission from '../RBAC/permissions/CameraPermission';
import { loggerMiddleware } from '../../logs/middleware';

export const cameraRouter = express.Router();
cameraRouter.use(loggerMiddleware);
// cameraRouter.post('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([CameraPermission.CREATE]));
// cameraRouter.get('*', authorizationMiddleware([CameraPermission.READ]));
cameraRouter.put('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([CameraPermission.UPDATE]));
cameraRouter.delete('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([CameraPermission.DELETE]));

cameraRouter
  .route('/all-marker')
  .get(cameraController.getAllMerkerCamera);

cameraRouter
  .route('/all-navigation-map')
  .get(cameraController.getAllNavigationMap);

cameraRouter
  .route('/get-all-camera-ai')
  .get(cameraController.getAllCameraToAi);

cameraRouter
  .route('/')
  .get(passport.authenticate('jwt', { session: false }), authorizationMiddleware([CameraPermission.READ]), cameraController.getAll)
  .post(cameraController.create);

cameraRouter
  .route('/:id')
  .get(passport.authenticate('jwt', { session: false }), authorizationMiddleware([CameraPermission.READ]), cameraController.findOne)
  .delete(cameraController.remove)
  .put(cameraController.update);
  

