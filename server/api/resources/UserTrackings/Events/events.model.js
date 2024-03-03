import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { PAGES, EVENTS, MAY_DO, USER, DEVICES, REFERRERS } from '../../../constant/dbCollections';

const schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: USER },
  page_id: { type: Schema.Types.ObjectId, ref: PAGES },
  device_id: { type: Schema.Types.ObjectId, ref: DEVICES },
  referrer_id: { type: Schema.Types.ObjectId, ref: REFERRERS },
  event_type: String, // click, download, videoview, preview
  event_name: String,
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

export default mongoose.model(EVENTS, schema, EVENTS);
