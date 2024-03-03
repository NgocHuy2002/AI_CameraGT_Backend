import queryToMongo from 'query-to-mongo';

function formatRegexString(str) {
  const arrStr = str?.toString()?.split('');
  if (!Array.isArray(arrStr)) return '';
  arrStr.forEach((char, index) => {
    switch (char) {
      case '(':
        arrStr[index] = '\\\(';
        break;
      case ')':
        arrStr[index] = '\\\)';
        break;
      case '\\':
        arrStr[index] = '\\\\';
        break;
      default:
        break;
    }
  });
  return arrStr.join('');
}

function extractQueryParam(req, searchLikes = null, lean = true) {
  const queryParam = req.query;
  const query = queryToMongo(queryParam, {
    ignore: ['page', 'token', 'include_children', 'all', 'include_parent', 'populate', 'is_phieu_giao'],
  });
  const criteria = query.criteria;

  if (searchLikes && searchLikes.length > 0) {
    searchLikes.forEach(fieldName => {
      if (criteria[fieldName] !== undefined) {
        criteria[fieldName] = new RegExp(formatRegexString(criteria[fieldName]), 'i');
      }
    });
  }
  if (criteria.is_deleted) {
    delete criteria.is_deleted;
  } else {
    criteria.is_deleted = false;
  }
  const options = query.options;
  if (queryParam.populate) {
    options.populate = queryParam.populate.split(',');
  }
  options.collation = { locale: 'vi' };
  options.lean = lean;
  if (queryParam.limit && queryParam.limit === '0') {
    options.pagination = false;
  }
  if (queryParam.limit === undefined) {
    options.limit = 10;
  }
  options.page = queryParam.page || 1;
  return query;
}

export default {
  extractQueryParam,
};
