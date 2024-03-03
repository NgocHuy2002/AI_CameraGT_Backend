import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { CAI_DAT_HE_THONG } from '../../constant/dbCollections';

export const APP_ANDROID_TYPE = { FILE: 'FILE', LINK: 'LINK' };

const schema = new Schema({
  don_vi_dang_nhap: { type: String, validate: /\S+/ },
  don_vi_reset: { type: String, validate: /\S+/ },
  don_vi_doi_mat_khau: { type: String, validate: /\S+/ },
  don_vi_xoa_anh: { type: String, validate: /\S+/ },
  phien_dang_nhap: { type: Number, validate: /\S+/ },
  phien_reset: { type: Number, validate: /\S+/ },
  phien_doi_mat_khau: { type: Number, validate: /\S+/ },
  phien_auto_xoa_anh: { type: Number, validate: /\S+/ },
  canh_bao_het_han_jetson: { type: Number, validate: /\S+/ },
  kich_hoat_auto_xoa_anh: { type: Boolean, default: false },
  don_vi_xoa_anh: { type: String, validate: /\S+/ },
  link_android_app: { type: String },
  link_ios_app: { type: String },
  send_email: { type: Boolean, default: true },
  model_ai: { type: String },
  is_deleted: { type: Boolean, default: false, select: false },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collation: { locale: 'vi' },
  versionKey: false,
});

schema.plugin(mongoosePaginate);
export { schema as DocumentSchema };
export default mongoose.model(CAI_DAT_HE_THONG, schema, CAI_DAT_HE_THONG);
