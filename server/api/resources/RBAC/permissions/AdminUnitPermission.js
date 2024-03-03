import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.ADMIN_UNIT, actions.CREATE),
  UPDATE: create(resources.ADMIN_UNIT, actions.UPDATE),
  READ: create(resources.ADMIN_UNIT, actions.READ),
  DELETE: create(resources.ADMIN_UNIT, actions.DELETE),
};
