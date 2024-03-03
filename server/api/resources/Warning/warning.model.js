import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { WARNING, CAMERA, USER } from '../../constant/dbCollections';

const schema = new Schema({
  content: { type: String },
  camera_id: { type: Schema.Types.ObjectId, ref: CAMERA },
  confirm_status: { type: String },
  check_status: { type: Boolean, default: false },
  check_result: { type: String },
  dectect_time: { type: Date, default: new Date() },
  assign_users: [{ type: String }],
  image_id: { type: String },
  object: { type: String },
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
export default mongoose.model(WARNING, schema, WARNING);


