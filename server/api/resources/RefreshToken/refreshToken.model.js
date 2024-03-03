import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { REFRESH_TOKEN, USER } from '../../constant/dbCollections';

const schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: USER },
  refresh_token: { type: String, required: true },
  expires_date:{ type: Date, required: true },
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
export default mongoose.model(REFRESH_TOKEN, schema, REFRESH_TOKEN);
