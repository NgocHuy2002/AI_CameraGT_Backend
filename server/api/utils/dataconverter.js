import { Types } from 'mongoose';

export function extractIds(listData = []) {
  return listData.map(element => element?._id?.toString());
}

export function extractObjectIds(listData = []) {
  return listData.map(element => element?._id);
}

export function extractKeys(listData = [], key) {
  return listData.map(element => element[key]?.toString());
}
export function extractKeyObjectIds(listData = [], key) {
  return listData.map(element => element[key]);
}

export function groupBy(list, key) {
  return list.reduce(function(grouped, element) {
    (grouped[element[key]] = grouped[element[key]] || []).push(element);
    return grouped;
  }, {});
}

export function convertObject(list, key) {
  return list.reduce(function(prevValue, currentValue) {
    prevValue[currentValue?.[key]] = currentValue;
    return prevValue;
  }, {});
}

export function formatArrayUnique(list, key) {
  if (!list?.length) return [];
  if (!key) return list;
  let keyUnique = [], arrayUnique = [];
  list.forEach(item => {
    if (!keyUnique.includes(item[key])) {
      keyUnique.push(item[key]);
      arrayUnique.push(item);
    }
  });
  return arrayUnique;
}

export function formatTimeCriteria(criteria, timeField = '', fromField = '', toField = '') {
  if (criteria[fromField] || criteria[toField]) {
    criteria[timeField] ||= {};
    if (criteria[fromField]) {
      criteria[timeField].$gte = criteria[fromField];
      delete criteria[fromField];
    }
    if (criteria[toField]) {
      criteria[timeField].$lte = criteria[toField];
      delete criteria[toField];
    }
  }
}

export function convertInt(x, base) {
  const parsed = parseInt(x, base);
  if (isNaN(parsed)) return 0;
  return parsed;
}

export function removeSpace(strA) {
  return strA.replace(/\s/g, '');
}

export function changeObjKey(obj = {}, oldKey, newKey) {
  obj[newKey] = obj[oldKey];
  delete obj[oldKey];
}
