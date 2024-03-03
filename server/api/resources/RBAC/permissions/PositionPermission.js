import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.POSITION, actions.CREATE),
  UPDATE: create(resources.POSITION, actions.UPDATE),
  READ: create(resources.POSITION, actions.READ),
  DELETE: create(resources.POSITION, actions.DELETE),
};
