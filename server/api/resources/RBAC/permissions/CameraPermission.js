import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.CAMERA, actions.CREATE),
  UPDATE: create(resources.CAMERA, actions.UPDATE),
  READ: create(resources.CAMERA, actions.READ),
  DELETE: create(resources.CAMERA, actions.DELETE),
};
