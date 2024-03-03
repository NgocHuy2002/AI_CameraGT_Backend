import { authorizePermission } from './authorizationHelper';
import { error } from '../../common/responseHelper';
import Error from './Error';

const defaultPermissionExtractor = (req) => {
  const userInfo = req.user;
  const roles = userInfo?.role_id;
  let permissions = userInfo?.permissions || [];
  if (roles && roles.length > 0) {
    roles.forEach(role => {
      permissions = [...permissions, ...role.permissions];
    });
  }
  return permissions;
};

function authorizationMiddleware(requiredPermissions, permissionExtractor = defaultPermissionExtractor) {
  return (req, res, next) => {
    const permissionGranted = permissionExtractor(req);
    if (permissionGranted && authorizePermission(permissionGranted, requiredPermissions)) {
      next();
    } else {
      error(res, Error.INSUFFICIENT_PERMISSION);
    }
  };
}

function authorizationMiddlewareMultiRequired(requiredPermissions, permissionExtractor = defaultPermissionExtractor) {
  return (req, res, next) => {
    const permissionGranted = permissionExtractor(req);
    if (permissionGranted) {
      let isAuthorized = false;
      for (let i = 0; i < requiredPermissions.length; i++) {
        if (authorizePermission(permissionGranted, requiredPermissions[i])) {
          isAuthorized = true;
          break;
        }
      }
      if (isAuthorized) return next();
    }
    error(res, Error.INSUFFICIENT_PERMISSION);
  };
}

export { defaultPermissionExtractor, authorizationMiddleware, authorizationMiddlewareMultiRequired };
