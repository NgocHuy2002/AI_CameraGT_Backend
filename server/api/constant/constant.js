export const USER_CODES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
};

export const ROLE_CODES = {
  CODE_SYSTEM_ADMIN: 'CODE_SYSTEM_ADMIN',
};

export const UNIT_LEVEL = {
  CAP_TINH: 'CAP_TINH',
  CAP_HUYEN: 'CAP_HUYEN',
  CAP_XA: 'CAP_XA',
};

export const TYPE_DON_VI = {
  TRIAL: 'TRIAL',
  STANDARD: 'STANDARD',
  PRO: 'PRO',
};


export const STORE_DIRS = {
  AVATAR: './storage/avatars',
  IMAGE_WARNING: './storage/image_warning',
  MOBILE_APP: './storage/mobile_app',
  LOGGER_DATA: './storage/logs',
  MODEL_AI: './storage/model_ai',
  
  FULL_IMAGE: './storage/full_image',
  VEHICLE_IMAGE: './storage/vehicle_image',
  LICENSE_PLATES_IMAGE: './storage/license_plates_image',
};

export const TEMPLATES_DIRS = {
  TEMPLATES: './server/templates',
  BIEU_MAU: './server/templates/bieumau',
  REPORT: './server/templates/reports',
  CONG_TRINH_XAY_DUNG: './server/templates/congtrinhxaydung',
  DIGITAL_SIGN: './server/templates/digitalSignFile',
  FILE_IMPORT_SAMPLE: './server/templates/fileImportSample',
  OUTPUT_FILE: './server/templates/outputFile',
  PHIEU_DO_THONG_SO: './server/templates/phieudothongso',
  PDF: './server/templates/pdf',
  TONG_KE: './server/templates/tongke',
  LY_LICH_VAN_HANH: './server/templates/lylichvanhanh',
  KHOILUONGQUANLY: './server/templates/khoiluongquanly',
  PHIEUGIAOVIEC: './server/templates/phieugiaoviec',
};

export const CAP_HO_SO = {
  CAP_1: 'CAP_1',
  CAP_2: 'CAP_2',
  CAP_3: 'CAP_3',
};

export const TEXT_TO_FIND = {
  PHIEU_GIAO_VIEC: 'ký, ghi rõ họ và tên',
  PHIEU_KT_KH: 'ký và ghi rõ họ tên',
  PHIEU_CONG_TAC: 'chữ ký',
};

export const TINH_TRANG_PHIEU = {
  DANG_GIAO_CHAM: { code: 'DANG_GIAO_CHAM', label: 'Đang giao chậm' },
  DA_GIAO_CHAM: { code: 'DA_GIAO_CHAM', label: 'Đã giao chậm' },
  DANG_TIEP_NHAN_CHAM: { code: 'DANG_TIEP_NHAN_CHAM', label: 'Đang tiếp nhận chậm' },
  DA_TIEP_NHAN_CHAM: { code: 'DA_TIEP_NHAN_CHAM', label: 'Đã tiếp nhận chậm' },
  DANG_THUC_HIEN_CHAM: { code: 'DANG_THUC_HIEN_CHAM', label: 'Đang thực hiện chậm' },
  DA_THUC_HIEN_CHAM: { code: 'DA_THUC_HIEN_CHAM', label: 'Đã thực hiện chậm' },
  DANG_XAC_NHAN_KHOA_CHAM: { code: 'DANG_XAC_NHAN_KHOA_CHAM', label: 'Đang xác nhận khóa chậm' },
  DA_XAC_NHAN_KHOA_CHAM: { code: 'DA_XAC_NHAN_KHOA_CHAM', label: 'Đã xác nhận khóa chậm' },
};


export const KET_LUAN_OPTIONS = {
  DAT: { label: 'Đạt', value: 'DAT' },
  KHONG_DAT: { label: 'Không đạt', value: 'KHONG_DAT' },
};

export const HUONG_DO = {
  PHIA_NHO: 'Phía cột thứ tự nhỏ',
  PHIA_LON: 'Phía cột thứ tự lớn',
};

export const PDF_WIDTH = 595.273;
export const PDF_HEIGHT = 841.886;

export const EXTENSION_FILE = {
  DOCX: 'docx',
  PDF: 'pdf',
  XLSX: 'xlsx',
};

export const LOAI_DAY = {
  DAY_CAP_QUANG: { label: 'Dây cáp quang', code: 'DAY_CAP_QUANG' },
  DAY_CHONG_SET: { label: 'Dây chống sét', code: 'DAY_CHONG_SET' },
};

export const USER_NAME_ADDON = '1npt\\';

export const GENDER_OPTIONS = {
  MALE: { label: 'Nam', value: 'MALE' },
  FEMALE: { label: 'Nữ', value: 'FEMALE' },
  OTHER: { label: 'Khác', value: 'OTHER' },
};

export const LOAI_DIEU_KIEN_AN_TOAN = {
  CO_LAP_DUONG_DAY: { code: 'CO_LAP_DUONG_DAY', label: 'Cô lập đường dây' },
  KHONG_CO_LAP_DUONG_DAY: { code: 'KHONG_CO_LAP_DUONG_DAY', label: 'Không cô lập đường dây' },
};
