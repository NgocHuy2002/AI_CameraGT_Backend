import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.USER, actions.CREATE),
  UPDATE: create(resources.USER, actions.UPDATE),
  READ: create(resources.USER, actions.READ),
  DELETE: create(resources.USER, actions.DELETE),
};
