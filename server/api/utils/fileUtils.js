import fs from 'fs';
import { FILE_MISSING } from '../constant/messageError';
import path from 'path';
import { getConfig } from '../../config/config';
import multipart from 'connect-multiparty';
import { STORE_DIRS } from '../constant/constant';
import moment from 'moment';

const config = getConfig(process.env.NODE_ENV);

export function deleteFile(filePath) {
  if (checkFileExist(filePath)) {
    fs.unlink(filePath, () => {
    });
  }
}

export function deleteFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    if (checkFileExist(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          resolve(false);
        } else {
          resolve(filePath);
        }
      });
    } else {
      resolve(filePath);
    }
  });
}

export function checkFileExist(filePath) {
  return fs.existsSync(filePath);
}

const osTempDir = require('os').tmpdir();
const tempDir = path.join(osTempDir, 'uploads');
const filesDir = path.resolve('./storage');

export const getDirPath = (dirName, rootPath = './storage') => {
  const dirPath = path.resolve(rootPath, dirName);
  createFolderIfNotExist(dirPath);
  return dirPath;
};

export function createFolderIfNotExist(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
}

function createIfNotExistFolders() {
  createFolderIfNotExist(tempDir);
  createFolderIfNotExist(filesDir);
  const filesTemplatesDir = getDirPath('templates');
  createFolderIfNotExist(filesTemplatesDir);
  Object.values(STORE_DIRS).forEach(dirPath => {
    createFolderIfNotExist(dirPath);
  });
}

const checkTempFolder = (req, res, next) => {
  createIfNotExistFolders();
  next();
};

const prepareTempFolder = () => {
  createIfNotExistFolders();
  clearFolder(tempDir);
};

const clearFolder = (tempDir) => {
  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.log(err);
      return;
    }
    for (const file of files) {
      fs.unlink(path.join(tempDir, file), err => {
        if (err) {
          console.log(file, err);
        }
      });
    }
  });
};

prepareTempFolder();

const getFileExtension = (filename) => {
  let ext = /^.+\.([^.]+)$/.exec(filename);
  return ext === null ? '' : ext[1];
};

const createByName = (filePath, fileName, dir) => {
  return new Promise((resolve, reject) => {
    let file = fs.createReadStream(filePath);
    file.on('error', (err) => {
      console.log(err);
      deleteFile(filePath);
      reject(FILE_MISSING);
    });
    copyFileToStorage(filePath, fileName, dir).then((newFilePath) => {
      deleteFile(filePath);
      resolve(newFilePath);
    }).catch(err => {
      console.log('Bucket is not exists or you dont have permission to access it.');
      console.log(err);
      deleteFile(filePath);
      reject(err);
    });
  });
};

const remove = (fileName) => {
  return new Promise((resolve, reject) => {
    try {
      deleteFile(getFilePath(fileName));
      resolve(fileName);
    } catch (e) {
      reject(e);
    }
  });
};
const getUrlFile = (fileName) => {
  return `${config.backend_base_url}/api/v1/image/${fileName}`;
};

export const getFilePath = (fileName = '', filesDir = './storage') => {
  if (!fileName) return null;
  return path.join(filesDir, fileName);
};

export const getWarningPath = (fileName = '', filesDir = './storage/image_warning') => {
  if (!fileName) return null;
  return path.join(filesDir, fileName);
};

export const getFullImagePath = (fileName = '', filesDir = './storage/full_image') => {
  if (!fileName) return null;
  return path.join(filesDir, fileName);
};

export const getVehiclePath = (fileName = '', filesDir = './storage/vehicle_image') => {
  if (!fileName) return null;
  return path.join(filesDir, fileName);
};

export const getLivePath = (name = '', fileName = '') => {
  if (!name) return null;
  let filesDir = `./storage/videos/${name}`
  return path.join(filesDir, fileName);
};

export const getLicensePlatesPath = (fileName = '', filesDir = './storage/license_plates_image') => {
  if (!fileName) return null;
  return path.join(filesDir, fileName);
};

export const getAndCheckImagePath = (fileName = '', filesDir = './storage') => {
  if (!fileName) return null;
  // if (!fileName) return path.join('./server', './assets', './images', 'no-image.png');
  const filePath = path.join(filesDir, fileName);
  return fs.existsSync(filePath) ? filePath : path.join('./server', './assets', './images', 'no-image.png');
};

export const getAndCheckExistFilePath = (fileName = '', filesDir = './storage') => {
  if (!fileName) return null;
  const filePath = path.join(filesDir, fileName);
  return fs.existsSync(filePath) ? filePath : null;
};

export const createFilePath = (fileName = '', filesDir = './storage') => {
  if (!fileName) return null;
  return fs.writeFile(path.join(filesDir, fileName), '', err => {
    if (err) {
      console.error(err);
      return null;
    }
  });
};

export const moveFile = (oldPath = '', newPath = '') => {
  if (oldPath && newPath && fs.existsSync(oldPath)) {
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.log("Error: Couldn't move", oldPath);
      }
    });
  }
}

export const getFilePipe = (fileName) => {
  const filePath = getFilePath(fileName);
  return fs.createReadStream(filePath);
};

function createUniqueFileName(filePath, outputExtension = null) {
  let fileName;
  if (filePath) {
    let fileExtension = getFileExtension(filePath);
    let name = path.parse(filePath).name;
    let timeStamp = (new Date()).toISOString();
    timeStamp = timeStamp.replace(/:/g, '-');
    fileName = fileExtension === '' ? `${name}_${timeStamp}` : `${name}_${timeStamp}.${outputExtension || fileExtension}`;
  }
  return fileName;
}

export function getName(filePath) {
  return path.parse(filePath).base;
}

const downloadFile = (async (url, path) => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(path);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on('error', (err) => {
      reject(err);
    });
    fileStream.on('finish', function() {
      resolve();
    });
  });
});

async function copyFileToStorage(srcPath, fileName, dir = filesDir) {
  dir = path.resolve(dir);
  const desPath = `${dir}/${fileName}`;
  return copyFile(srcPath, desPath);
}

async function copyFileToFolder(srcPath, desPath, fileName) {
  return copyFile(srcPath, desPath);
}

async function copyFile(srcPath, desPath) {
  return new Promise((resolve, reject) => {
    fs.copyFile(srcPath, desPath, (err) => {
      if (err) reject(err);
      resolve(desPath);
    });
  });
}

export const multipartMiddleware = multipart({
  uploadDir: tempDir,
  maxFilesSize: 250 * 1024 * 1024,
});

export function getFileDirByMonth(sub_folder_path) {
  const folderNameByMonth = moment().format('MM-YYYY').toString();
  const fileDirByMonth = path.join(sub_folder_path, folderNameByMonth);
  createFolderIfNotExist(fileDirByMonth);
  return fileDirByMonth;
}


export {
  createByName,
  remove,
  getUrlFile,
  getFileExtension,
  prepareTempFolder,
  createUniqueFileName,
  checkTempFolder,
  downloadFile,
  tempDir,
  filesDir,
};
