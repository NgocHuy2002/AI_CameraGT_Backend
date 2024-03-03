import fs from 'fs';
import path from 'path';

import { getFilePath, getFullImagePath, getLicensePlatesPath, getVehiclePath, getWarningPath, getLivePath } from '../../utils/fileUtils';
import * as responseHelper from '../../helpers/responseHelper';
import CommonError from '../../error/CommonError';
import Model from '../CaiDatHeThong/caiDatHeThong.model';
import { STORE_DIRS } from '../../constant/constant';
import queryHelper from '../../helpers/queryHelper';
import zip from 'adm-zip';


let mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript',
};

export function previewFile(req, res) {
  const file = getFilePath(req.params.id);
  const type = mime[path.extname(file).slice(1)] || 'text/plain';
  const s = fs.createReadStream(file);
  s.on('open', function () {
    res.set('Content-Type', type);
    s.pipe(res);
  });
  s.on('error', function () {
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
}

export function previewWarningImage(req, res) {
  const file = getWarningPath(req.params.id);
  const type = mime[path.extname(file).slice(1)] || 'text/plain';
  const s = fs.createReadStream(file);
  s.on('open', function () {
    res.set('Content-Type', type);
    s.pipe(res);
  });
  s.on('error', function () {
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
}

export function viewFullImage(req, res) {
  const file = getFullImagePath(req.params.id);
  const type = mime[path.extname(file).slice(1)] || 'text/plain';
  const s = fs.createReadStream(file);
  s.on('open', function () {
    res.set('Content-Type', type);
    s.pipe(res);
  });
  s.on('error', function () {
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
}

export function viewVehicleImage(req, res) {
  const file = getVehiclePath(req.params.id);
  const type = mime[path.extname(file).slice(1)] || 'text/plain';
  const s = fs.createReadStream(file);
  s.on('open', function () {
    res.set('Content-Type', type);
    s.pipe(res);
  });
  s.on('error', function () {
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
}

export function viewLicensePlatesImage(req, res) {
  const file = getLicensePlatesPath(req.params.id);
  const type = mime[path.extname(file).slice(1)] || 'text/plain';
  const s = fs.createReadStream(file);
  s.on('open', function () {
    res.set('Content-Type', type);
    s.pipe(res);
  });
  s.on('error', function () {
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
}

export function getLive(req, res) {
  const file = getLivePath(req.params.name, req.params.file);
  const type = mime[path.extname(file).slice(1)] || 'text/plain';
  const s = fs.createReadStream(file);
  s.on('open', function () {
    res.set('Content-Type', type);
    s.pipe(res);
  });
  s.on('error', function () {
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
}

export function downloadFile(req, res) {
  const filePath = getFilePath(req.params.id);
  if (fs.existsSync(filePath)) {
    return res.download(filePath, req.query.fileName);
  }
  return responseHelper.error(res, null, 404, 'messagemessagemessage');
}

export function downloadWithFileName(req, res) {
  const query = queryHelper.extractQueryParam(req);
  const { criteria } = query;
  const filePath = getFilePath(criteria.id);
  if (fs.existsSync(filePath)) {
    return res.download(filePath, criteria.file_name);
  }
  return res.download(path.join('./server', './assets', './images', 'no-image.png'));
}

export async function downloadIosApp(req, res) {
  const data = await Model.findOne().lean();
  if (!data) {
    return responseHelper.error(res, CommonError.NOT_FOUND);
  }
  const filePath = `${STORE_DIRS.MOBILE_APP}/${data.ios_app}`;
  if (fs.existsSync(filePath)) {
    return res.download(filePath, data.ios_app);
  }
  return responseHelper.error(res, CommonError.NOT_FOUND);
}

export async function downloadAndroidApp(req, res) {
  const data = await Model.findOne().lean();
  if (!data) {
    return responseHelper.error(res, CommonError.NOT_FOUND);
  }
  const filePath = `${STORE_DIRS.MOBILE_APP}/${data.android_app}`;
  if (fs.existsSync(filePath)) {
    return res.download(filePath, data.android_app);
  }
  return responseHelper.error(res, CommonError.NOT_FOUND);
}

export async function downloadFlightControlApp(req, res) {
  const data = await Model.findOne().lean();
  if (!data) {
    return responseHelper.error(res, CommonError.NOT_FOUND);
  }
  const filePath = `${STORE_DIRS.MOBILE_APP}/${data.flight_control_app}`;
  if (fs.existsSync(filePath)) {
    return res.download(filePath, data.flight_control_app);
  }
  return responseHelper.error(res, CommonError.NOT_FOUND);
}

export function downloadImage(req, res) {
  const { fileName } = req.params;
  const filePath = getFilePath(fileName);
  if (fs.existsSync(filePath)) {
    return res.download(filePath);
  }
  return responseHelper.error(res, CommonError.NOT_FOUND, 404);
}

export function downloadMultiImages(req, res) {
  let { fileNames } = req.params;
  fileNames = fileNames.split(',');
  let notFound = '';
  if (fileNames.length) {
    var zipFile = new zip();
    fileNames.forEach((file) => {
      const filePath = getFilePath(file);
      if (fs.existsSync(filePath)) {
        zipFile.addLocalFile(filePath);
      }
      else {
        notFound = file;
      }
    });
    if (notFound) return responseHelper.error(res, CommonError.NOT_FOUND, 404);
    else {
      const data = zipFile.toBuffer();
      const file_after_download = 'images.zip';
      res.set('Content-Type', 'application/octet-stream');
      res.set('Content-Disposition', `attachment; filename=${file_after_download}`);
      res.send(data)
    }
  }
}
