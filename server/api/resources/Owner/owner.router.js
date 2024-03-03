import express from 'express';
// import passport from 'passport';
import * as ownerController from './owner.controller';
// import { authorizationMiddleware } from '../RBAC/middleware';
// import VehiclePermission from '../RBAC/permissions/VehiclePermission';
import { loggerMiddleware } from '../../logs/middleware';
import { multipartMiddleware } from '../../utils/fileUtils';

export const ownerRouter = express.Router();
ownerRouter.use(loggerMiddleware);
// ownerRouter.post('*', authorizationMiddleware([VehiclePermission.CREATE]));
// ownerRouter.get('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.READ]));
// ownerRouter.put('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.UPDATE]));
// ownerRouter.delete('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.DELETE]));

ownerRouter
    .route('/')
    // .get(ownerController.getAll)
    .post(multipartMiddleware, ownerController.create)

ownerRouter
    .route('/:license_plates')
    // .get(ownerController.findOne)
    .delete(ownerController.remove)
    .get(ownerController.findByLicensePlates)
    .put(ownerController.update);
