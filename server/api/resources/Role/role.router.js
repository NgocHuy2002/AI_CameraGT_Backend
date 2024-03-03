import { Router } from 'express';
import * as RoleCtr from './role.controller';
import passport from 'passport';
import { authorizationMiddleware } from '../RBAC/middleware';
import VaiTroPermission from '../RBAC/permissions/VaiTroPermission';
import { loggerMiddleware } from '../../logs/middleware';

export const roleRouter = Router();
roleRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
roleRouter.post('*', authorizationMiddleware([VaiTroPermission.CREATE]));
roleRouter.put('*', authorizationMiddleware([VaiTroPermission.UPDATE]));
roleRouter.delete('*', authorizationMiddleware([VaiTroPermission.DELETE]));

roleRouter.route('/')
  .post(RoleCtr.create)
  .delete(RoleCtr.deleteALl)
  .get(RoleCtr.getAll);

roleRouter.route('/:id')
  .get(RoleCtr.getById)
  .delete(RoleCtr.deleteById)
  .put(RoleCtr.update);

