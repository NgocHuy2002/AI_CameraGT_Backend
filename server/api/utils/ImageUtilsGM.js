import * as FileUtil from './fileUtils';
import { getFileExtension } from './fileUtils';
import path from 'path';
import { xml2js } from 'xml-js';
import exif from 'exif-reader';

const gm = require('gm');

export async function createThumbnail(fileName, filePath) {
  let thumbnailName = getThumbnailName(fileName);
  let thumbnailPath = path.join(FileUtil.tempDir, thumbnailName);

  // await sharp(filePath).resize(512, 512, {
  //   fit: sharp.fit.cover,
  //   withoutEnlargement: true,
  // }).toFile(thumbnailPath);
  return new Promise((resolve, reject) => {
    gm(filePath)
      .resize(512, 512, '!')
      // .noProfile()
      .write(thumbnailPath, function(err) {
        if (!err) {
          resolve(thumbnailPath);
        } else {
          reject(null);
        }
      });
  });
}

function imageOptimizeOptions(sharpInstance, extension) {
  if (extension === 'jpg' || extension === 'jpeg') {
    sharpInstance.jpeg({ mozjpeg: true });
  }

  if (extension === 'png') {
    sharpInstance.png({ quality: 80 });
  }

  return sharpInstance;
}

export async function rotate(rotatedFileName, filePath, outputDirPath) {
  let rotatedFilePath = path.join(outputDirPath || FileUtil.tempDir, rotatedFileName);
  // let sharpExecute = sharp(filePath)
  //   .withMetadata()
  //   .rotate();
  // sharpExecute = imageOptimizeOptions(sharpExecute, getFileExtension(rotatedFileName).toLowerCase());
  // await sharpExecute.toFile(rotatedFilePath);

  return new Promise(((resolve, reject) => {
    gm(filePath)
      // .autoOrient() theo issues #2919
      .quality(80)
      .write(rotatedFilePath, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(rotatedFilePath);
        }
      });
  }));

  // return rotatedFilePath;
}

export function getThumbnailName(filePath) {
  let fileName = path.parse(filePath).base;
  return `thumbnail_${fileName}`;
}

export async function getImageMetadata(filePath) {
  return new Promise((resolve, reject) => {
    // obtain the size of an image
    gm(filePath)
      .size(function(err, size) {
        if (!err) {
          resolve(size);
        } else {
          reject(err);
        }
      });
  });
}


export async function getExif(filePath) {

  function convertDMSToDD(coordinates, direction) {
    if (isNaN(coordinates?.degrees) || isNaN(coordinates?.minutes) || isNaN(coordinates?.seconds)) return null;
    const { degrees, minutes, seconds } = coordinates;

    let dd = degrees + minutes / 60 + seconds / (60 * 60);
    if (direction === 'S' || direction === 'W') {
      dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
  }

  function convertStringToDMS(gpsString) {
    if (!gpsString) return null;

    function division(divisionInput) {
      const divisionArr = divisionInput.toString().split('/');
      return parseInt(divisionArr[0]) / parseInt(divisionArr[1]);
    }

    const gpsArr = gpsString.toString().split(',');
    const degrees = division(gpsArr[0]);
    const minutes = division(gpsArr[1]);
    const seconds = division(gpsArr[2]);
    return { degrees, minutes, seconds };
  }

  const exifData = await exifReader(filePath);
  if (!exifData) return null;
  const latGps = exifData['GPS Latitude'];
  const lngGps = exifData['GPS Longitude'];
  const latRef = exifData['GPS Latitude Ref'];
  const lngRef = exifData['GPS Longitude Ref'];
  if (!latGps || !latRef || !lngGps || !lngRef) return {};
  return {
    lat: convertDMSToDD(convertStringToDMS(latGps), latRef),
    lng: convertDMSToDD(convertStringToDMS(lngGps), lngRef),
  };
}

async function exifReader(filePath) {
  try {
    return new Promise((resolve, reject) => {
      gm(filePath)
        .identify(function(err, data) {
          if (err) return reject(null);
          const exifData = data['Profile-EXIF'];
          resolve(exifData);
        });
    });
  } catch (e) {
    return null;
    // console.log('err', e);
  }
}

async function xmp(xmpBuffer) {
  try {
    return xml2js(xmpBuffer.toString(), { compact: true, spaces: 2 });
  } catch (e) {
    // console.log('err', e);
  }
}
