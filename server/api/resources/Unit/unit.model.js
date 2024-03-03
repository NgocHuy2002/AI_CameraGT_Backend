import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { UNIT } from '../../constant/dbCollections';
import { UNIT_LEVEL } from '../../constant/constant';

const schema = new Schema({
  // name: { type: String },
  // address: { type: String },
  // unit_phone: { type: String },
  // unit_email: { type: String },
  // is_deleted: { type: Boolean, default: false, select: false }, 
  name: { type: String, required: true, validate: /\S+/ },
  code: { type: String, required: true, validate: /\S+/, unique: true },
  phone: { type: String, required: false },
  email: { type: String, required: false },
  // fax: { type: String, required: false },
  address: { type: String, required: false },
  level: {
    type: String,
    enum: Object.values(UNIT_LEVEL),
    required: true,
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: UNIT,
  },
  ordinal: { type: Number },
  is_root: { type: Boolean, default: false, select: false },
  is_deleted: { type: Boolean, default: false },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collation: { locale: 'vi' },
  versionKey: false,
});
schema.index({ name: 1 });
schema.index({ level: 1 });
schema.index({ parent_id: 1 });
schema.plugin(mongoosePaginate);

schema.plugin(mongoosePaginate);
export default mongoose.model(UNIT, schema, UNIT);

