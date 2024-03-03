import express from 'express';
import passport from 'passport';
import * as Controller from './obejctDetection.controller';
import { checkTempFolder, multipartMiddleware } from '../../utils/fileUtils';

export const objectDetectionRouter = express.Router();
objectDetectionRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
objectDetectionRouter.route('/')
  .get(Controller.getAll)
  .post(checkTempFolder, multipartMiddleware, Controller.create)
  .delete(Controller.removeMulti);

objectDetectionRouter
  .route('/:id')
  .get(Controller.findOne)
  .delete(Controller.remove)
  .put(Controller.update);
