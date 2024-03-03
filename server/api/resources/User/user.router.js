import express from 'express';
import userController from './user.controller';
import passport from 'passport';
import { authorizationMiddleware } from '../RBAC/middleware';
import UserPermission from '../RBAC/permissions/UserPermission';
import { multipartMiddleware } from '../../utils/fileUtils';
import { loggerMiddleware } from '../../logs/middleware';

const userRouter = express.Router();
userRouter.post('/login', userController.login);
userRouter.post('/forgot-password-mail', userController.forgotPasswordMail);
userRouter.post('/unregister-device', userController.unregisterDevice);
userRouter.post('/signup', userController.signupFree);
userRouter.post('/refreshToken', userController.refreshToken);

userRouter.use(passport.authenticate('jwt', { session: false }), loggerMiddleware);
userRouter.post('/register-device', userController.registerDevice);

userRouter.get('/me', userController.authenticate);
userRouter.put('/info', multipartMiddleware, userController.updateInfo);
userRouter.put('/reset-password', userController.resetPassword);
userRouter.put('/change-password', userController.changePassword);
userRouter.get('/', userController.findAll);
userRouter.get('/listall', userController.findAllIncludeDeletedUnit);

userRouter.post('*', authorizationMiddleware([UserPermission.CREATE]));
userRouter.put('*', authorizationMiddleware([UserPermission.UPDATE]));
userRouter.delete('*', authorizationMiddleware([UserPermission.DELETE]));
userRouter.post('/', multipartMiddleware, userController.signup);

userRouter.get('/daxoa', userController.getAllDaXoa);
userRouter.post('/daxoa/:id', userController.restoreAccount);

userRouter
  .route('/:id/active')
  .put(userController.activeAccount);
userRouter
  .route('/:id/deactive')
  .put(userController.deactiveAccount);

userRouter
  .route('/:id')
  .get(userController.findOne)
  .delete(userController.delete)
  .put(multipartMiddleware, userController.update);

export default userRouter;


