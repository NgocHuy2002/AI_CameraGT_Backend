import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { VEHICLE_LIST } from "../../constant/dbCollections";
import { CAMERA } from "../../constant/dbCollections";

const schema = new Schema(
  {
    time_detect: { type: Date, default: new Date() },
    // camera_id: { type: String },
    camera_id: { type: Schema.Types.ObjectId, ref: CAMERA },
    content: { type: String },
    vehicle_type: { type: String },
    vehicle_color: { type: String },//Màu xe
    vehicle_brand: { type: String },  // Hãng xe
    vehicle_style: { type: String }, // Kiểu dáng xe
    //   vehicle_type: { type: Schema.Types.ObjectId, ref: VEHICLE },
    license_plates: { type: String }, //Biển số xe
    license_plates_color: { type: String }, //Màu biển số xe
    image: { type: String }, // Ảnh toàn cảnh
    vehicle_image: { type: String }, // Hình ảnh xe
    license_plates_image: { type: String }, // Hình ảnh biển số
    is_black_list: { type: Boolean, default: false, select: true },
    status: { type: String },
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
export default mongoose.model(VEHICLE_LIST, schema, VEHICLE_LIST);
