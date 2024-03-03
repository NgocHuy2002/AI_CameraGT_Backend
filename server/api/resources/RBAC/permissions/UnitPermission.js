import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.UNIT, actions.CREATE),
  UPDATE: create(resources.UNIT, actions.UPDATE),
  READ: create(resources.UNIT, actions.READ),
  DELETE: create(resources.UNIT, actions.DELETE),
};
