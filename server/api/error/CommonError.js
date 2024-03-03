import { createError } from '../helpers/errorHelper';

export default {
  UNEXPECTED_ERROR: () => createError(500, 'Lỗi không mong muốn'),
  VALIDATION_ERROR: () => createError(400, 'Lỗi dữ liệu tải lên'),
  INVALID_REQUEST_ERROR: () => createError(400, 'Lỗi truy vấn dữ liệu'),
  NOT_FOUND: () => createError(404, 'Không tìm thấy dữ liệu'),
  403: () => createError(403, 'Lỗi ký điện tử'),
  402: () => createError(402, 'Không thể kết nối đến server ký điện tử. Vui lòng kiểm tra đường dẫn ký điện tử!'),
  108: () => createError(108, 'App code không đúng hoặc không có'),
  102: () => createError(102, 'App code không có hoặc không tồn tại'),
  109: () => createError(109, 'Mật khẩu không đúng hoặc không có'),
  100: () => createError(100, 'Có lỗi'),
};
