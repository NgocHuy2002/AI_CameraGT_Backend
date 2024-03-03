import carbone from 'carbone';
import * as Service from './position.service';
import Model from './position.model';
import * as controllerHelper from '../../helpers/controllerHelper';
import * as UnitService from '../Unit/unit.service';
import queryHelper from '../../helpers/queryHelper';
import * as responseAction from '../../helpers/responseHelper';
import { getDirPath, getFilePath } from '../../utils/fileUtils';
import { log } from 'winston';

const searchLike = ['name'];
// const populateOpts = ['ward_id', 'district_id', 'province_id'];
const populateOpts = ['unit_id'];
const uniqueOpts = [];
const sortOpts = '';

export const findOne = controllerHelper.createFindOneFunction(Model, populateOpts);
export const remove = controllerHelper.createRemoveFunction(Model);
export const create = controllerHelper.createCreateFunction(Model, Service, populateOpts, uniqueOpts);
export const update = controllerHelper.createUpdateByIdFunction(Model, Service, populateOpts, uniqueOpts);
// export const getAll = controllerHelper.createGetAllFunction(Model, searchLike, populateOpts, sortOpts);

export async function getAll(req, res) {
  try {
    const query = queryHelper.extractQueryParam(req, searchLike);
    const { criteria, options } = query;

    if (criteria.unit_id) {
      criteria.unit_id = await UnitService.getDonViQuery(req, criteria.unit_id);
    }
    else {
      if (!req.user?.is_system_admin) {
        criteria.unit_id = await UnitService.getDonViQuery(req, null);
      }
    }
    options.populate = populateOpts;
    const data = await Model.paginate(criteria, options);
    responseAction.success(res, data);
  } catch (err) {
    console.log(err);
    responseAction.error(res, err);
  }
}

export async function insertMany(req, res) {
  try {
    var mongoose = require('mongoose');
    const value = req.body;
    const data = value.map( e => {
      return {
        name: e.name,
        unit_id: mongoose.Types.ObjectId(e.unit_id),
        lat: e.lat,
        long: e.long,
        is_deleted: false,
      }
    })
    const insertData = await Model.collection.insertMany(data)
    responseAction.success(res, insertData);
    
  } catch (err) {
    console.log(err);
    responseAction.error(res, err);
  }
}

export async function downloadTemplate(req, res) {
  const fileName = 'Mau_upload_position.xlsx';

  let opt = {
    renderPrefix: 'mau_upload_position',
    reportName: 'Mẫu upload position',
    timezone: 'Asia/Saigon',
  };

  const templateFilePath = getFilePath(fileName, getDirPath('templates', './server'));
  carbone.render(templateFilePath, {}, opt, function(err, resultFilePath) {
    try {
      res.download(resultFilePath);
    } catch (err) {
      console.log('Không tải được tập tin!');
      responseAction.error(res, { message: 'Không thể tải được tập tin!' }, 400);
    }
  });
}

