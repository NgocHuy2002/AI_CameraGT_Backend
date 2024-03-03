import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.WARD, actions.CREATE),
  UPDATE: create(resources.WARD, actions.UPDATE),
  READ: create(resources.WARD, actions.READ),
  DELETE: create(resources.WARD, actions.DELETE),
};
