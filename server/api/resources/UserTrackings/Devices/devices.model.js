import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { DEVICES, MAY_DO } from '../../../constant/dbCollections';

const schema = new Schema({
  device_type: { type: String }, // Desktop, Mobile, Tablet, Laptop
  device_branch: { type: String },
  device_model: { type: String },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collation: { locale: 'vi' },
  versionKey: false,
});

schema.plugin(mongoosePaginate);

export default mongoose.model(DEVICES, schema, DEVICES);
