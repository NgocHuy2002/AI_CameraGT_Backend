import { authorizePermission } from '../resources/RBAC/authorizationHelper';
import { error } from '../common/responseHelper';
import Error from '../resources/RBAC/Error';

export const bodyInjectionMiddleware = (req, res, next) => {
  if (req.body) {
    if (!req.body._id) {
      req.body.created_by = req.user._id;
    }
    req.body.updated_by = req.user._id;
  }
  next();
};
