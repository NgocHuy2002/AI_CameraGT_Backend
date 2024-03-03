import Joi from 'joi';
import bcrypt from 'bcryptjs';
import USER from './user.model';

const messageDefine = (key) => {
  return {
    'string.base': `${key} không đúng`,
    'number.base': `${key} không đúng`,
    'array.base': `${key} không đúng`,
    'string.empty': `${key} là không được bỏ trống`,
    'any.required': `${key} là không được thiếu`,
  };
};

export function getAll(query, projection = {}) {
  return USER.find(query, projection).lean();
}

export function count(query){
  return USER.count(query);
}

function getById(id, projection = {}) {
  return USER.findById(id, projection).lean();
}

export default {
  getAll,
  getById,
  encryptPassword(palinText) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(palinText, salt);
  },
  comparePassword(plainText, encrypedPassword) {
    return bcrypt.compareSync(plainText, encrypedPassword);
  },
  validateSignup(body, method) {

    let objSchema = {
      full_name: Joi.string().required().messages(messageDefine('Tên nhân viên')),
      // username: Joi.string().required().messages(messageDefine('Tài khoản')),
      gender: Joi.string().allow(''),
      phone: Joi.string().allow('').allow(null).messages(messageDefine('Điện thoại')),
      birthday: Joi.string().allow('').allow(null),
      email: Joi.string().required().allow('').allow(null),
    };

    let newSchema = {};
    if (method === 'POST') {
      newSchema = Object.assign({}, objSchema);
    } else {
      for (let key in objSchema) {
        if (objSchema.hasOwnProperty(key) && body.hasOwnProperty(key)) {
          newSchema[key] = objSchema[key];
        }
      }
    }

    let schema = Joi.object().keys(newSchema);
    const { value, error } = schema.validate(body, { allowUnknown: true, abortEarly: true });
    if (error && error.details) {
      return { error };
    }
    return { value };
  },
  validateLogin(body) {
    const schema = Joi.object().keys({
      username: Joi.string().required().messages(messageDefine('Tài khoản')),
      password: Joi.string().required().messages(messageDefine('Mật khẩu')),
      deviceToken: Joi.string().messages(messageDefine('Token')),
    });
    const { value, error } = schema.validate(body);
    if (error && error.details) {
      return { error };
    }
    return { value };
  },

  async addOrUpdateDeviceToken(userInfo, deviceToken) {

    if (userInfo && deviceToken) {
      let deviceTokens = userInfo.device_tokens ? userInfo.device_tokens : [];
      let deviceIndex = deviceTokens.indexOf(deviceToken);

      if (deviceIndex === -1) {
        deviceTokens.push(deviceToken);
        await USER.findByIdAndUpdate(userInfo._id, { device_tokens: deviceTokens }, { new: true });
      }
    }
  },
  async findAndRemoveDeviceTokenOfUser(userInfo, deviceToken) {
    if (userInfo && deviceToken) {
      let deviceTokens = userInfo.device_tokens ? userInfo.device_tokens : [];
      let deviceIndex = deviceTokens.indexOf(deviceToken);
      if (deviceIndex !== -1) {
        deviceTokens.splice(deviceIndex, 1);
        await USER.findByIdAndUpdate(userInfo._id, { device_tokens: deviceTokens }, { new: true });
      }
    }
  },
  async findAndRemoveDeviceToken(deviceToken) {
    if (deviceToken) {
      let userHasToken = await USER.findOne({ device_tokens: deviceToken });
      if (userHasToken) {
        userHasToken.device_tokens = userHasToken.device_tokens.filter(element => element !== deviceToken);
        await userHasToken.save();
      }
    }
  },

  async getTokens(userId) {
    const user = await USER.findById(userId);
    if (user && !user.is_deleted && user.device_tokens) {
      return user.device_tokens;
    } else {
      return [];
    }
  },

};
