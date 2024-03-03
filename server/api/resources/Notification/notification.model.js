import mongoose, { Schema } from 'mongoose';
import { NOTIFICATION, USER } from '../../constant/dbCollections';
import mongoosePaginate from 'mongoose-paginate-v2';

const schema = new Schema({
  title: String,
  content: { type: String },
  notify_type: { type: String },
  action: { type: String },
  user_id: { type: Schema.Types.ObjectId, ref: USER }, // User nhận thông báo
  user_id_receive: { type: Schema.Types.ObjectId, ref: USER }, // User gửi thông báo
  payload: Object,
  status: { type: String },
  is_deleted: { type: Boolean, default: false, select: false },
},
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    collation: { locale: 'vi' },
    versionKey: false,
  });
schema.plugin(mongoosePaginate);
export { schema as DocumentSchema };
export default mongoose.model(NOTIFICATION, schema, NOTIFICATION);
