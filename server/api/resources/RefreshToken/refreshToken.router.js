import express from 'express';
import passport from 'passport';
import { loggerMiddleware } from '../../logs/middleware';
import refreshTokenController from './refreshToken.controller';

const refreshTokenRouter = express.Router();
refreshTokenRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
refreshTokenRouter.post('/', refreshTokenController.getByRefreshToken);
refreshTokenRouter.delete('/', refreshTokenController.deleteByRefreshToken);

export default refreshTokenRouter;