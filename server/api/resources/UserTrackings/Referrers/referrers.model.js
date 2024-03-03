import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { MAY_DO, REFERRERS } from '../../../constant/dbCollections';

const schema = new Schema({
  source: String,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collation: { locale: 'vi' },
  versionKey: false,
});

schema.plugin(mongoosePaginate);

export default mongoose.model(REFERRERS, schema, REFERRERS);
