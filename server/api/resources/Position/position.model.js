import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { WARD, DISTRICT, PROVINCE, POSITION, UNIT } from '../../constant/dbCollections';

const schema = new Schema({
  name: { type: String },
  unit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: UNIT,
  },
  // ward_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: WARD,
  // },
  // district_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: DISTRICT,
  // },
  // province_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: PROVINCE,
  // },
  lat: { type: Number }, // Vĩ độ
  long: { type: Number }, // Kinh độ
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
export default mongoose.model(POSITION, schema, POSITION);

