import * as Service from './objectDetection.service';
import * as controllerHelper from '../../../helpers/controllerHelper';
import * as responseHelper from '../../../helpers/responseHelper';
import * as fileUtils from '../../../utils/fileUtils';
import * as ImageUtils from '../../../utils/ImageUtilsGM';
import { convertToPointObject } from '../../GeoObjects/GeoObjects.service';
import queryHelper from '../../../helpers/queryHelper';

const populateOpts = [
  { path: 'vi_tri_id' },
  { path: 'nguoi_chinh_sua', select: 'full_name username phone bac_an_toan' },
  { path: 'nguoi_tao', select: 'full_name username phone bac_an_toan' },
];

export const findOne = controllerHelper.createFindOneFunction(Model, populateOpts);
export const remove = controllerHelper.createRemoveFunction(Model);
export const update = controllerHelper.createUpdateByIdFunction(Model, Service, populateOpts);

export async function create(req, res) {
  try {
    const { error, value } = Service.validate(req.body);
    if (error) return responseHelper.error(res, error, 400);

    const image_id = fileUtils.createUniqueFileName(req.files.image.originalFilename);
    const imagePath = await ImageUtils.rotate(image_id, req.files.image.path);
    const thumbnailPath = await ImageUtils.createThumbnail(image_id, imagePath);
    const thumbnail_id = fileUtils.getName(thumbnailPath);
    await fileUtils.createByName(imagePath, image_id);
    await fileUtils.createByName(thumbnailPath, thumbnail_id);

    const body = req.body;
    body.image_id = image_id;
    body.thumbnail_id = thumbnail_id;
    if (req.body.longitude && req.body.latitude)
      body.location = convertToPointObject(req.body.longitude, req.body.latitude);
    body.nguoi_tao = req.user._id;
    body.nguoi_chinh_sua = req.user._id;
    const data = await Model.create(body);
    const createdData = await controllerHelper.findOneById(Model, data._id, populateOpts);
    return responseHelper.success(res, createdData);
  } catch (err) {
    return responseHelper.error(res, err, 500);
  }
}

export async function getAll(req, res) {
  try {
    const query = queryHelper.extractQueryParam(req);
    const { criteria } = query;
    const data = await Model.find(criteria)
      .populate('vi_tri_id');
    return responseHelper.success(res, data);
  } catch (err) {
    responseHelper.error(res, err);
  }
}

export async function removeMulti(req, res) {
  try {
    if (!Array.isArray(req.body)) {
      return responseHelper.error(res, 404, '');
    }

    const data = await Model.updateMany({ _id: { $in: req.body } }, { is_deleted: true }).lean();
    if (data.ok && data.n === data.nModified) {
      return responseHelper.success(res, { success: true });
    } else {
      return responseHelper.error(res, 404, '');
    }
  } catch (err) {
    responseHelper.error(res, err);
  }
}
