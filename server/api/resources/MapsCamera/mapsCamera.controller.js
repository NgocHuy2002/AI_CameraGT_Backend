const mongoose = require('mongoose');
import Model from "../Camera/camera.model";
import ModelUnit from "../Unit/unit.model";
import * as responseAction from "../../helpers/responseHelper";

const populateOpts = ['type_id', 'unit_id', 'position_id'];

export async function getAllMarkerInUnit(req, res) {
  try {
    const { unit } = req.query;

    let arrMarker = []
    let query = {is_deleted: false}

    if(unit){
      const unitId = await ModelUnit.find({ parent_id: mongoose.Types.ObjectId(unit), is_deleted: false })
        .distinct("_id")
        .lean();

      query.unit_id = {$in: [unit, ...unitId]}
    }

    const data = await Model.find(query)
      .populate(populateOpts)
      .lean();

    if(data && data.length){
      data.map(item => {
        if(item.position_id && item.position_id.lat && item.position_id.long){
          arrMarker.push({
            latitude: Number(item.position_id.lat),
            longitude: Number(item.position_id.long),
            data: item
          })
        }
      })
    }

    responseAction.success(res, arrMarker);
  } catch (err) {
    console.log(err);
    responseAction.error(res, err);
  }
}
