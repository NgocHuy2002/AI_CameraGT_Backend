import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.CAMERA_TYPE, actions.CREATE),
  UPDATE: create(resources.CAMERA_TYPE, actions.UPDATE),
  READ: create(resources.CAMERA_TYPE, actions.READ),
  DELETE: create(resources.CAMERA_TYPE, actions.DELETE),
};
