import { create } from '../permissionHelper';
import resources from '../Resources';
import actions from '../Actions';

export default {
  ALL_ALL: create(resources.ALL, actions.ALL),
};
