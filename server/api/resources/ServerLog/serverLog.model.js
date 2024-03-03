import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { DON_VI, SERVER_LOG, USER } from '../../constant/dbCollections';

const schema = new Schema({
  time_log: { type: Date },
  message: { type: String },
  req_user_id: { type: Schema.Types.ObjectId, ref: USER },
  req_unit_id: { type: Schema.Types.ObjectId, ref: DON_VI },
  req_body: { type: Object },
  req_ref: { type: String },
  req_api: { type: String },
  method: { type: String },
  res_status_code: Number,
  res_status_message: String,
  client: String,

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
export default mongoose.model(SERVER_LOG, schema, SERVER_LOG);
