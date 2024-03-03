import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { DISTRICT, PROVINCE } from '../../constant/dbCollections';

const schema = new Schema({
  name: { type: String },
  code: { type: Number },
  province_id: { type: Schema.Types.ObjectId, ref: PROVINCE },
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
export default mongoose.model(DISTRICT, schema, DISTRICT);

