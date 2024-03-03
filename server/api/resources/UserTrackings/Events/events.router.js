import express from 'express';
import passport from 'passport';
import * as eventsController from './events.controller';
import { authorizationMiddleware } from '../../RBAC/middleware';
import Permission from '../../RBAC/permissions/DanhMucPermission';
import { loggerMiddleware } from '../../../logs/middleware';

export const eventsRouter = express.Router();
eventsRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
eventsRouter.post('*', authorizationMiddleware([Permission.CREATE]));
eventsRouter.put('*', authorizationMiddleware([Permission.UPDATE]));
eventsRouter.delete('*', authorizationMiddleware([Permission.DELETE]));
eventsRouter.route('/')
  .get(eventsController.getAll)
  .post(eventsController.create);

eventsRouter
  .route('/:id')
  .get(eventsController.findOne)
  .delete(eventsController.remove)
  .put(eventsController.update);
