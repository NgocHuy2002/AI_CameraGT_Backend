import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { DEVICES, PAGES, REFERRERS, USER, VISITS } from '../../../constant/dbCollections';

const schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: USER },
  page_id: { type: Schema.Types.ObjectId, ref: PAGES },
  referrer_id: { type: Schema.Types.ObjectId, ref: REFERRERS },
  device_id: { type: Schema.Types.ObjectId, ref: DEVICES },
  ip_address: String,
  browser: String,
  operating_system: String,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collation: { locale: 'vi' },
  versionKey: false,
});

schema.plugin(mongoosePaginate);

export default mongoose.model(VISITS, schema, VISITS);
