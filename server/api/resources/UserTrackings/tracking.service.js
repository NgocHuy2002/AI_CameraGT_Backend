import * as ValidatorHelper from '../../helpers/validatorHelper';
import VISITS from './Visits/visits.model';
import queryHelper from '../../helpers/queryHelper';
import User from '../User/user.model';
import { extractObjectIds } from '../../utils/dataconverter';
import { groupBy } from '../../common/functionCommons';
import * as DonViService from '../DonVi/donVi.service';

const Joi = require('joi');

const objSchema = Joi.object({});

export async function reportVisitByUsers(req){
  const query = queryHelper.extractQueryParam(req, ['full_name']);
  const criteria = query.criteria;

  if ((!req.query.include_children || req.query.include_children === 'false') && req.query.unit_id) {
    criteria.unit_id = req.query.unit_id;
  } else {
    criteria.unit_id = await DonViService.getDonViQuery(req, criteria.unit_id);
  }
  const {created_at, ...criteriaUser} =criteria;
  const users = await User.find(criteriaUser).select('-password').populate('unit_id').lean();
  const usersId = extractObjectIds(users);
  const visitQuery = {
    'user_id': { '$in': usersId },
  };
  if (created_at) {
    visitQuery.created_at = created_at;
    Object.keys(visitQuery.created_at).forEach(key => {
      visitQuery.created_at[key] = new Date(visitQuery.created_at[key]);
    });
  }
  const arrayData = await reportTotalVisitByUser(visitQuery);
  const visitMap = groupBy(arrayData, 'user_id');
  users.forEach(user => {
    if(visitMap[user._id] && visitMap[user._id].length > 0){
      const reportItem = visitMap[user._id][0]
      user.so_lan_truy_cap = reportItem.visitNumber
      user.so_ngay_truy_cap = reportItem.visitDaysNumber
    } else {
      user.so_lan_truy_cap = 0
      user.so_ngay_truy_cap = 0
    }
  });
  return users
}

export async function reportTotalVisitByUser(query) {
  return VISITS.aggregate([
    {
      '$match': query
    },
    {
      '$project': {
        'created_at': {
          '$dateToString': {
            'date': '$created_at',
            'format': '%Y-%m-%d',
            'timezone': '+07:00',
          },
        },
        'user_id': 1.0,
      },
    },
    {
      '$group': {
        '_id': '$user_id',
        'visitNumber': {
          '$sum': 1.0,
        },
        'visitDays': {
          '$addToSet': '$created_at',
        },
      },
    },
    {
      '$project': {
        'user_id': '$_id',
        'visitNumber': 1.0,
        'visitDaysNumber': {
          '$function': {
            'body': 'function(days) {return days.length}',
            'args': [
              '$visitDays',
            ],
            'lang': 'js',
          },
        },
      },
    },
    {
      '$lookup': {
        'from': 'User',
        'localField': 'user_id',
        'foreignField': '_id',
        'as': 'user',
      },
    },
    {
      '$unwind': {
        'path': '$user',
      },
    },
    {
      '$lookup': {
        'from': 'DonVi',
        'localField': 'user.unit_id',
        'foreignField': '_id',
        'as': 'don_vi',
      },
    },
    {
      '$unwind': {
        'path': '$don_vi',
      },
    },
    {
      '$unset': [
        'user.permissions',
        'user.password',
        'user.device_tokens',
      ]
    },
  ]).option({
    'allowDiskUse': true,
  })
}

export function validate(data, method) {
  let schema = ValidatorHelper.createValidatorSchema(objSchema, data, method);
  const { value, error } = schema.validate(data, { allowUnknown: true, abortEarly: true });
  if (error && error.details) {
    return { error };
  }
  return { value };
}
