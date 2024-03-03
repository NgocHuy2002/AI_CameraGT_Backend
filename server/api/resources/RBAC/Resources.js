function createResources(code, description) {
  return {
    code: code,
    description: description,
  };
}

export default {
  ALL: createResources('ALL', 'Tất cả'),
  USER: createResources('USER', 'Người dùng'),
  VAI_TRO: createResources('VAI_TRO', 'Vai trò'),
  ORG_UNIT: createResources('ORG_UNIT', 'Đơn vị'),
  REPORT: createResources('REPORT', 'Báo cáo, dashboard'),
  SETTING: createResources('SETTING', 'Cài đặt'),
  DANH_MUC: createResources('DANH_MUC', 'Danh mục'),

  CAMERA: createResources('CAMERA', 'Camera'),
  CAMERA_TYPE: createResources('CAMERA_TYPE', 'Loại Camera'),
  UNIT: createResources('UNIT', 'Đơn vị'),
  POSITION: createResources('POSITION', 'Vị trí'),
  WARNING: createResources('WARNING', 'Cảnh báo'),
  MAPS_CAMERA: createResources('MAPS_CAMERA', 'Bản đồ camera'),
  VEHICLE: createResources('VEHICLE', 'Phương tiện'),
  WARD: createResources('WARD', 'Quận huyện'),
};
