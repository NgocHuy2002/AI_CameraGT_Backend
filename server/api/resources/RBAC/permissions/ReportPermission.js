import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.REPORT, actions.CREATE),
  UPDATE: create(resources.REPORT, actions.UPDATE),
  READ: create(resources.REPORT, actions.READ),
  DELETE: create(resources.REPORT, actions.DELETE),
};
