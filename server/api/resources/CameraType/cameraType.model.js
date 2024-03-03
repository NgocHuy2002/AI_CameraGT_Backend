import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { CAMERA_TYPE } from '../../constant/dbCollections';

const schema = new Schema({
  // name: { type: String },
  brand: { type: String },
  description: { type: String },
  format_rtsp: { type: String },
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
export default mongoose.model(CAMERA_TYPE, schema, CAMERA_TYPE);

