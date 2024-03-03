import express from 'express';
import passport from 'passport';
import * as unitController from './unit.controller';
import { authorizationMiddleware } from '../RBAC/middleware';
import UnitPermission from '../RBAC/permissions/UnitPermission';
import { loggerMiddleware } from '../../logs/middleware';

export const unitRouter = express.Router();
unitRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
unitRouter.post('*', authorizationMiddleware([UnitPermission.CREATE]));
unitRouter.get('*', authorizationMiddleware([UnitPermission.READ]));
unitRouter.put('*', authorizationMiddleware([UnitPermission.UPDATE]));
unitRouter.delete('*', authorizationMiddleware([UnitPermission.DELETE]));

unitRouter
  .route('/')
  .get(unitController.getAll)
  .post(unitController.create);

unitRouter
  .route('/:id')
  .get(unitController.findOne)
  .delete(unitController.remove)
  .put(unitController.update);

// unitRouter
//   .route('/all')
//   .get(unitController.getAllOrgUnit);
