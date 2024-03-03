import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.WARNING, actions.CREATE),
  UPDATE: create(resources.WARNING, actions.UPDATE),
  READ: create(resources.WARNING, actions.READ),
  DELETE: create(resources.WARNING, actions.DELETE),
};
