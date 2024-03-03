import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.VAI_TRO, actions.CREATE),
  UPDATE: create(resources.VAI_TRO, actions.UPDATE),
  READ: create(resources.VAI_TRO, actions.READ),
  DELETE: create(resources.VAI_TRO, actions.DELETE),
};
