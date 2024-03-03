import express from 'express';
import passport from 'passport';
import * as mapsCameraController from './mapsCamera.controller';
import { authorizationMiddleware } from '../RBAC/middleware';
import MapsCameraPermission from '../RBAC/permissions/MapsCameraPermission';
import { loggerMiddleware } from '../../logs/middleware';

export const mapsCameraRouter = express.Router();

mapsCameraRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
mapsCameraRouter.get('*', authorizationMiddleware([MapsCameraPermission.READ]));

mapsCameraRouter
  .route('/marker')
  .get(mapsCameraController.getAllMarkerInUnit);

