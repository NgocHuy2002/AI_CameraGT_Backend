import moment from 'moment';
import * as fileUtils from '../utils/fileUtils';
import * as imageUtils from '../utils/ImageUtilsGM';
import { getExif } from '../utils/ImageUtilsGM';

const fs = require('fs');

export function cloneObj(input = {}) {
  return JSON.parse(JSON.stringify(input));
}

export function isFloat(n) {
  return Number(n) === n && n % 1 !== 0;
}

export function groupBy(listData, key) {
  return listData.reduce(function(grouped, element) {
    (grouped[element[key]] = grouped[element[key]] || []).push(element);
    return grouped;
  }, {});
}


export function convertDate(data) {
  try {
    return moment(data, 'DD/MM/YYYY').isValid() ? moment(data, 'DD/MM/YYYY') : null;
  } catch (e) {
    return null;
  }
}

export function removeDuplicateObject(listData, objKey) {
  let listDataResult = [];
  let objectTemp = {};
  listData = listData?.filter(item => !!item);
  for (let i = 0; i < listData?.length; i++) {
    if (listData[i][objKey]) {
      objectTemp[listData[i][objKey]] = listData[i];
    }
  }
  Object.values(objectTemp).forEach(item => listDataResult.push(item));
  return listDataResult;
}

export function removeDuplicateByKeyLv2(listData, keyLv1, keyLv2) {
  let listDataResult = [];
  let objectTemp = {};
  listData = listData?.filter(item => !!item);
  for (let i = 0; i < listData?.length; i++) {
    if (listData[i][keyLv1][keyLv2]) {
      objectTemp[listData[i][keyLv1][keyLv2]] = listData[i];
    }
  }
  Object.values(objectTemp).forEach(item => listDataResult.push(item));
  return listDataResult;
}

export function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}

export function cutTail(duongDayName) {
  return duongDayName?.split('(')[0]?.replace('ĐD', '')?.replace('220kV', '')?.replace('500kV', '')?.replace(' ', '').replace(/ /g, '')?.trim();
}

export function addIndexToListData(listData = []) {
  return listData?.map((element, index) => {
    element.stt = index + 1;
    return element;
  });
}

export async function generateImage(req, readExif = false) {
  const fileImg = req.files?.avatar || req.files?.image;
  let exif;
  if (readExif) {
    exif = await getExif(fileImg.path);
  }
  const imageId = fileUtils.createUniqueFileName(fileImg.originalFilename);
  const imagePath = await imageUtils.rotate(imageId, fileImg.path);
  const thumbnailPath = await imageUtils.createThumbnail(imageId, imagePath);
  const thumbnailId = fileUtils.getName(thumbnailPath);
  await fileUtils.createByName(imagePath, imageId);
  await fileUtils.createByName(thumbnailPath, thumbnailId);
  return { imageId, thumbnailId, ...exif };
}

export function insertObjToArr(listData, element, index) {
  if (index === listData.length) return [...listData, element];
  return listData.reduce(function(listResult, item, idx) {
    idx === index ? listResult.push(element, item) : listResult.push(item);
    return listResult;
  }, []);
}

export function trim(value) {
  return value?.toString()?.trim();
}

export function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}

export function trimData(dataInput) {
  if (!Array.isArray(dataInput?.rows)) return dataInput;
  dataInput.rows.forEach(row => {
    Object.entries(row).forEach(([key, value]) => {
      row[key] = (!!value && typeof value === 'string') ? value.trim() : value;
    });
  });
  return dataInput;
}

export function removeAccents(str) {
  const AccentsMap = [
    'aàảãáạăằẳẵắặâầẩẫấậ',
    'AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ',
    'dđ', 'DĐ',
    'eèẻẽéẹêềểễếệ',
    'EÈẺẼÉẸÊỀỂỄẾỆ',
    'iìỉĩíị',
    'IÌỈĨÍỊ',
    'oòỏõóọôồổỗốộơờởỡớợ',
    'OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ',
    'uùủũúụưừửữứự',
    'UÙỦŨÚỤƯỪỬỮỨỰ',
    'yỳỷỹýỵ',
    'YỲỶỸÝỴ',
  ];

  for (let i = 0; i < AccentsMap.length; i++) {
    const re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
    const char = AccentsMap[i][0];
    str = str.replace(re, char);
  }
  return str;
}

export function randomKey() {
  return Math.floor(Math.random() * 100000000000);
}

export function base64Encode(file) {
  if (!file) return;
  const bitmap = fs.readFileSync(file);
  return new Buffer(bitmap).toString('base64');
}

export function base64Decode(base64str, file) {
  if (!base64str || !file) return;
  const bitmap = new Buffer(base64str, 'base64');
  fs.writeFileSync(file, bitmap);
}

export function convertParam(queryObj, firstCharacter = '?') {
  if (typeof queryObj !== 'object') return '';
  let query = '';
  Object.entries(queryObj).forEach(([key, value]) => {
    // if (value) {
    query += query ? '&' : firstCharacter;
    query += `${key}=${value}`;
    // }
  });
  return query;
}

export function formatUnique(arr) {
  if (!arr || !Array.isArray(arr)) return [];
  return Array.from(new Set(arr));
}


export function getPastDateFromToday(numberOfDay = 0) {
  try {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() - numberOfDay);
  } catch (e) {
    return null;
  }
}

export function getFileSizeInBytes(filename) {
  let stats = fs.statSync(filename);
  return stats.size;
}

export function downlineData(curentData, addOnData) {
  return curentData ? [curentData, addOnData].join('\n') : addOnData;
}


function replaceCommaToDot(input) {
  if (!input) return input;
  const stringInput = input.toString();
  return stringInput.replace(',', '.');
}

export function getDistanceFromLatLonInKm(p1, p2) {
  p1.latitude = p1.vi_do || p1.latitude || p1.lat;
  p1.longitude = p1.kinh_do || p1.longitude || p1.lng;
  p2.latitude = p2.vi_do || p2.latitude || p2.lat;
  p2.longitude = p2.kinh_do || p2.longitude || p2.lng;

  const point1 = {
    latitude: replaceCommaToDot(p1.latitude),
    longitude: replaceCommaToDot(p1.longitude),
  };

  const point2 = {
    latitude: replaceCommaToDot(p2.latitude),
    longitude: replaceCommaToDot(p2.longitude),
  };

  let R = 6371; // Radius of the earth in km
  let dLat = deg2rad(point2.latitude - point1.latitude); // deg2rad below
  let dLon = deg2rad(point2.longitude - point1.longitude);
  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.latitude)) * Math.cos(deg2rad(point2.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c * 1000; // Distance in m
  return parseFloat(d.toFixed(3));
}

export function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export function joinArrayString(arrayString, characterJoin) {
  let stringResult = '';
  arrayString.forEach(el => {
    !stringResult ? stringResult = el : stringResult = [stringResult, el].join(characterJoin);
  });
  return stringResult;
}
