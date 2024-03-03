import express from 'express';
import passport from 'passport';
import * as rtspController from './rtsp.controller';
import { authorizationMiddleware } from '../RBAC/middleware';
import VehiclePermission from '../RBAC/permissions/VehiclePermission';
import { loggerMiddleware } from '../../logs/middleware';
import { multipartMiddleware } from '../../utils/fileUtils';

export const rtspRouter = express.Router();
rtspRouter.use(loggerMiddleware);
// rtspRouter.post('*', authorizationMiddleware([VehiclePermission.CREATE]));
// rtspRouter.get('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.READ]));
// rtspRouter.put('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.UPDATE]));
// rtspRouter.delete('*', passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.DELETE]));

rtspRouter
    .route('/')
    // .get(phuongTienController.getAll)
    // .get(passport.authenticate('jwt', { session: false }), authorizationMiddleware([VehiclePermission.READ]), phuongTienController.getAll)
    .post(multipartMiddleware, rtspController.stream)
    .get(rtspController.stop_stream)


// rtspRouter
//     .route('/stream/stream')
//     .get(phuongTienController.stream)