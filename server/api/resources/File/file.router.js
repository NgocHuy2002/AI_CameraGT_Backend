import express from 'express';
import * as Controller from './file.controller';
import { downloadFileWithoutId, downloadFlightControlApp } from './file.controller';

export const fileRouter = express.Router();

fileRouter
  .route('/')
  .get(Controller.downloadWithFileName);

fileRouter
  .route('/preview/:id')
  .get(Controller.previewFile);

fileRouter
  .route('/previewWarningImage/:id')
  .get(Controller.previewWarningImage);

fileRouter
  .route('/iosapp')
  .get(Controller.downloadIosApp);


fileRouter
  .route('/androidapp')
  .get(Controller.downloadAndroidApp);

fileRouter.route('/flightcontrolapp').get(Controller.downloadFlightControlApp);

fileRouter
  .route('/:id')
  .get(Controller.downloadFile);

fileRouter
  .route('/image/:fileName')
  .get(Controller.downloadImage);

fileRouter
  .route('/images/:fileNames')
  .get(Controller.downloadMultiImages);

// Vehicle router
  fileRouter
  .route('/viewFullImage/:id')
  .get(Controller.viewFullImage);

  fileRouter
  .route('/viewVehicleImage/:id')
  .get(Controller.viewVehicleImage);

  fileRouter
  .route('/viewLicensePlatesImage/:id')
  .get(Controller.viewLicensePlatesImage);

  fileRouter
  .route('/getLive/:name/:file')
  .get(Controller.getLive);


