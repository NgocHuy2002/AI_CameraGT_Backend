import express from 'express';
import passport from 'passport';
import * as Controller from './notification.controller';
import { loggerMiddleware } from '../../logs/middleware';

export const notificationRouter = express.Router();
notificationRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
notificationRouter.route('/')
  .get(Controller.getAll)
  .post(Controller.create);

notificationRouter.route('/sent')
  .get(Controller.getAllSent);

notificationRouter
  .route('/:id')
  .get(Controller.findOne)
  .delete(Controller.remove)
  .put(Controller.update);
