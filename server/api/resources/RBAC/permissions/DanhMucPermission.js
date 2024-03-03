import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.DANH_MUC, actions.CREATE),
  UPDATE: create(resources.DANH_MUC, actions.UPDATE),
  READ: create(resources.DANH_MUC, actions.READ),
  DELETE: create(resources.DANH_MUC, actions.DELETE),
};
