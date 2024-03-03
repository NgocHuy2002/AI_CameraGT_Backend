import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.VEHICLE, actions.CREATE),
  UPDATE: create(resources.VEHICLE, actions.UPDATE),
  READ: create(resources.VEHICLE, actions.READ),
  DELETE: create(resources.VEHICLE, actions.DELETE),
};
