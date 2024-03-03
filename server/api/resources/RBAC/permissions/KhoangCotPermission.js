import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  CREATE: create(resources.KHOANG_COT, actions.CREATE),
  UPDATE: create(resources.KHOANG_COT, actions.UPDATE),
  READ: create(resources.KHOANG_COT, actions.READ),
  DELETE: create(resources.KHOANG_COT, actions.DELETE),
};
