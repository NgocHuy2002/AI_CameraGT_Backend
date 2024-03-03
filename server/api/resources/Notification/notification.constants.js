export const NOTIFICATION_TYPE = {
  USER_TO_USER: 'USER_TO_USER',
  SYSTEM_TO_USER: 'SYSTEM_TO_USER',
  UNIT_TO_USER: 'UNIT_TO_USER',
};

export const NOTIFICATION_ACTION = {
  XAC_NHAN_CANH_BAO: 'Yêu cầu xác nhận cảnh báo',
  KIEM_TRA_CANH_BAO: 'Yêu cầu kiểm tra cảnh báo',
  KIEM_TRA_CANH_BAO_DANH_SACH_DEN: 'Yêu cầu kiểm tra cảnh báo danh sách đen',
  XAC_NHAN_DANH_SACH_DEN: 'Biển số mới đã được thêm vào danh sách đen',
  KET_QUA_CANH_BAO: 'Báo cáo kết quả kiểm tra',
  HUY_KET_QUA_CANH_BAO: 'Huỷ kết quả kiểm tra',
  THONG_BAO_HET_HAN_4G: 'Sim 4G sắp hết hạn',
  UNG_DUNG_IOS: 'ứng dụng ios',
  CAP_NHAT_VERSION_MOI: 'Cập nhật phiên bản mới',
  THONG_BAO_HET_HAN_JETSON: 'Máy tính nhúng sắp hết hạn',
};

export const NOTIFICATION_STATUS = {
  VIEWED: 'VIEWED',
  SENT: 'SENT',
  RECEIVED: 'RECEIVED',
};
