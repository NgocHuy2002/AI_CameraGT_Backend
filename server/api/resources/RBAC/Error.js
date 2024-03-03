import { createError } from '../../common/errorHelper';

export default {
  INSUFFICIENT_PERMISSION: createError(403, 'Bạn cần cấp quyền để thực hiện hành động này'),
};
