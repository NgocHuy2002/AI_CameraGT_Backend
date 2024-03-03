import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { CAMERA, CAMERA_TYPE, UNIT, POSITION } from '../../constant/dbCollections';

const schema = new Schema({
  name: { type: String },
  type_id: { type: Schema.Types.ObjectId, ref: CAMERA_TYPE },
  domain: { type: String },
  username: { type: String },
  password: { type: String },
  port: { type: String },
  rtsp_url: { type: String },
  status: { type: Boolean },
  unit_id: { type: Schema.Types.ObjectId, ref: UNIT },
  position_id: { type: Schema.Types.ObjectId, ref: POSITION },
  cam_width: { type: Number },
  cam_height: { type: Number },
  identification_time: { type: Number },
  
  detect_point: [[Number]],
  detect_point_geo: {
    type: { type: String },
    coordinates: [{ type: Object }]
  },
  img_sample_url: { type: String },
  time_send_frame: { type: String },
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
export default mongoose.model(CAMERA, schema, CAMERA);

