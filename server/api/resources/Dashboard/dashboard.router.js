import express from 'express';
import passport from 'passport';
import * as Controller from './dashboard.controller';
import { loggerMiddleware } from '../../logs/middleware';

export const dashboardRouter = express.Router();
dashboardRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);

dashboardRouter
  .route('/black-percent')
  .get(Controller.getDataBlackListPercent);

dashboardRouter
  .route('/vehicle-percent')
  .get(Controller.getDataVehiclePercent);

dashboardRouter
  .route('/vehicle-quality')
  .get(Controller.getDataVehicleQuality);
