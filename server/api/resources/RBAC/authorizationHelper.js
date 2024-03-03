import * as permission from './permissionHelper';
import resources from './Resources';
import actions from './Actions';

function authorizePermission(permissionGranted, requiredPermissions) {
  for (let i = 0; i < requiredPermissions.length; i++) {
    const resource = requiredPermissions[i].split('#')[0]; // resource cần cấp quyền
    const action = requiredPermissions[i].split('#')[1]; // action cần cấp quyền
    const resourceAllPermission = permission.createPermission(resource, actions.ALL.code); // quyền cao nhất với resource
    const actionPermission = permission.createPermission(resources.ALL.code, action); // quyền cao nhất với action
    const highestPermission = permission.createPermission(resources.ALL.code, actions.ALL.code); // quyền cao nhất với tất cả resource

    if (!permissionGranted.includes(requiredPermissions[i])
      && !permissionGranted.includes(resourceAllPermission)
      && !permissionGranted.includes(actionPermission)
      && !permissionGranted.includes(highestPermission)) { // không thỏa mãn quyền
      return false;
    }
  }
  return true;
}

export { authorizePermission };
