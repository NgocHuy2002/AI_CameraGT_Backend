function createAction(code, description) {
  return {
    code: code,
    description: description,
  };
}

export default {
  ALL: createAction('ALL', 'Tất cả'),
  CREATE: createAction('CREATE', 'Thêm mới'),
  READ: createAction('READ', 'Xem'),
  UPDATE: createAction('UPDATE', 'Chỉnh sửa'),
  DELETE: createAction('DELETE', 'Xóa'),
};
