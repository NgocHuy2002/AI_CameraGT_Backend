import express from 'express';
import passport from 'passport';
import * as phuongTienController from './vehicle.controller';
import { authorizationMiddleware } from '../RBAC/middleware';
import VehiclePermission from '../RBAC/permissions/VehiclePermission';
import { loggerMiddleware } from '../../logs/middleware';
import { multipartMiddleware } from '../../utils/fileUtils';

export const phuongTienRouter = express.Router();
phuongTienRouter.use(loggerMiddleware);
// phuongTienRouter.post('*', authorizationMiddleware([VehiclePermission.CREATE]));
// phuongTienRouter.get('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.READ]));
// phuongTienRouter.put('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.UPDATE]));
// phuongTienRouter.delete('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.DELETE]));

phuongTienRouter
    .route('/')
    // .get(phuongTienController.getAll)
    .get(passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.READ]), phuongTienController.getAll)
    .post(multipartMiddleware, phuongTienController.create);

phuongTienRouter
    .route('/:id')
    .get(phuongTienController.findOne)
    .put(phuongTienController.updateOne)
    .delete(phuongTienController.remove)
// .put(phuongTienController.update);

phuongTienRouter
    .route('/move-to-blacklist/:license_plates')
    .put(phuongTienController.update)

// phuongTienRouter
//     .route('/stream/stream')
//     .get(phuongTienController.stream)