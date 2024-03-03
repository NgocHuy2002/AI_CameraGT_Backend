import queryToMongo from "query-to-mongo";
import adminUnitLevel from "../constant/adminUnitLevel";

function extractQueryParam(req, searchLikes, lean = true, isActive = true) {
  const queryParam = req.query
  const userInfo = req.userInfo
  const query = queryToMongo(queryParam, {
    ignore: ['page']
  })
  const criteria = query.criteria

  if (searchLikes && searchLikes.length > 0) {
    searchLikes.forEach(fieldName => {
      if (criteria[fieldName] !== undefined) {
        criteria[fieldName] = new RegExp(criteria[fieldName], 'i');
      }
    })
  }

  criteria.isActive = isActive

  const options = query.options
  options.page = queryParam.page || 1
  options.lean = lean
  return query
}

export default {
  extractQueryParam
}