import express from 'express';
import passport from 'passport';
import * as blackListController from './blackList.controller';
// import { authorizationMiddleware } from '../RBAC/middleware';
// import VehiclePermission from '../RBAC/permissions/VehiclePermission';
import { loggerMiddleware } from '../../logs/middleware';
import { multipartMiddleware } from '../../utils/fileUtils';

export const blackListRouter = express.Router();
blackListRouter.use(loggerMiddleware);
// blackListRouter.post('*', authorizationMiddleware([VehiclePermission.CREATE]));
// blackListRouter.get('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.READ]));
// blackListRouter.put('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.UPDATE]));
// blackListRouter.delete('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.DELETE]));

blackListRouter
    .route('/')
    .get(passport.authenticate('jwt', { session: false }), blackListController.getAll)
    .post(multipartMiddleware, blackListController.create)

blackListRouter
    .route('/:license_plates')
    .get(blackListController.findOne)
    .delete(blackListController.remove)
    // .get(blackListController.findByLicensePlates)
    .put(blackListController.updateByLicensePlates);
