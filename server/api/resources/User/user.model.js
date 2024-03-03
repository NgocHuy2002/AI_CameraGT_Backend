import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { UNIT, ROLE, USER } from '../../constant/dbCollections';
import userService from './user.service';

const { Schema } = mongoose;
const userSchema = new Schema({
  full_name: { type: String, required: true },
  name: { type: String },
  email: { type: String, required: true },
  username: { type: String, unique: true },
  password: { type: String },
  gender: { type: String },
  phone: { type: String },
  avatar: { type: String },
  alias: { type: String },
  is_deleted: { type: Boolean, default: false, select: false },
  role_id: [{ type: Schema.Types.ObjectId, ref: ROLE }],
  permissions: [{ type: String }],
  unit_id: { type: Schema.Types.ObjectId, ref: UNIT },
  is_system_admin: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  never_login: { type: Boolean, default: true },
  last_login: { type: Date },
  last_change_password: { type: Date, default: new Date() },
  device_tokens: [],
  chuc_vu: String,
}, {
  timestamps: {
    createdAt: 'created_at', updatedAt: 'updated_at',
  }, collation: { locale: 'vi' }, versionKey: false,
});

userSchema.pre('save', function(next) {
  let user = this;
  user = formatName(user);
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  user.password = userService.encryptPassword(user.password);
  next();
});

userSchema.pre('findOneAndUpdate', function(next) {
  this._update = formatName(this._update);
  next();
});

function formatName(dataInput) {
  const nameArr = dataInput.full_name?.split(' ');
  if (Array.isArray(nameArr) && nameArr.length) {
    dataInput.name = nameArr[nameArr.length - 1];
  }
  return dataInput;
}

userSchema.plugin(mongoosePaginate);

export default mongoose.model(USER, userSchema, USER);
