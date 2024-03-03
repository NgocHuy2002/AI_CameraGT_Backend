import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.MAPS_CAMERA, actions.CREATE),
  UPDATE: create(resources.MAPS_CAMERA, actions.UPDATE),
  READ: create(resources.MAPS_CAMERA, actions.READ),
  DELETE: create(resources.MAPS_CAMERA, actions.DELETE),
};
