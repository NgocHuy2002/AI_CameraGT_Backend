import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { BLACKLIST } from "../../constant/dbCollections";
import { CAMERA } from "../../constant/dbCollections";

const schema = new Schema(
  {
    vehicle_type: { type: String },
    vehicle_color: { type: String },//Màu xe
    //   vehicle_type: { type: Schema.Types.ObjectId, ref: VEHICLE },
    license_plates: { type: String }, //Biển số xe
    license_plates_color: { type: String }, //Màu biển số xe
    // vehicle_image: { type: String }, // Hình ảnh xe
    // license_plates_image: { type: String }, // Hình ảnh biển số
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
export default mongoose.model(BLACKLIST, schema, BLACKLIST);
