import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { OWNER } from "../../constant/dbCollections";

const schema = new Schema(
  {
    name: {type: String},
    cccd: {type: String},
    address: {type: String},
    license_plates: {type: String},
    status: {type: String},
    is_deleted: { type: Boolean, default: false, select: false }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    },
    collation: { locale: "vi" },
    versionKey: false
  }
);

schema.plugin(mongoosePaginate);
export default mongoose.model(OWNER, schema, OWNER);
