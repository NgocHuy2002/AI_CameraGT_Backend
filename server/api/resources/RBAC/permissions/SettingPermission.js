import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.SETTING, actions.CREATE),
  UPDATE: create(resources.SETTING, actions.UPDATE),
  READ: create(resources.SETTING, actions.READ),
  DELETE: create(resources.SETTING, actions.DELETE),
};
