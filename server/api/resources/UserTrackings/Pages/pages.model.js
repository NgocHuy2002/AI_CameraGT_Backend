import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { MAY_DO, PAGES } from '../../../constant/dbCollections';

const schema = new Schema({
  url: String,
  title: String,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collation: { locale: 'vi' },
  versionKey: false,
});

schema.plugin(mongoosePaginate);

export default mongoose.model(PAGES, schema, PAGES);
