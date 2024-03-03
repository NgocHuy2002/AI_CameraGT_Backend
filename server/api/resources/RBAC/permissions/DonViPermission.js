import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.ORG_UNIT, actions.CREATE),
  UPDATE: create(resources.ORG_UNIT, actions.UPDATE),
  READ: create(resources.ORG_UNIT, actions.READ),
  DELETE: create(resources.ORG_UNIT, actions.DELETE),
};
