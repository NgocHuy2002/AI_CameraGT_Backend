import userService from './user.service';
import User from './user.model';
import jwt from '../../helpers/jwt';
import * as responseHelper from '../../helpers/responseHelper';
import { sendEmail } from '../../utils/mailHelper';
import Setting from '../CaiDatHeThong/caiDatHeThong.model';

import { getConfig } from '../../../config/config';
import queryHelper from '../../helpers/queryHelper';
// import * as DonViService from '../DonVi/donVi.service';
import * as UnitService from '../Unit/unit.service';
import * as RoleService from '../Role/role.service';
import * as RefreshTokenService from '../RefreshToken/refreshToken.service';
import * as fileUtils from '../../utils/fileUtils';
import { deleteFile, getFilePath } from '../../utils/fileUtils';
import * as ImageUtils from '../../utils/ImageUtilsGM';
import { STORE_DIRS, USER_NAME_ADDON } from '../../constant/constant';
import * as permission from '../RBAC/permissionHelper';
import resources from '../RBAC/Resources';
import actions from '../RBAC/Actions';
import ROLE from '../Role/role.model';
import CommonError from '../../error/CommonError';
import { generateChangePasswordEmail } from '../../helpers/emailHelper';
import moment from 'moment';

const config = getConfig(process.env.NODE_ENV);
const sortOpts = { name: 1, full_name: 1, username: 1 };

async function getAllUsers(req, includeDeletedUnit = false) {
  let query = queryHelper.extractQueryParam(req, ['username', 'full_name', 'email', 'phone']);
  const criteria = query.criteria;
  criteria.is_system_admin = false;
  if (!req.user?.is_system_admin) {
    if (includeDeletedUnit) {
      criteria.unit_id = await UnitService.getDonViQueryIncludeDeleted(req, criteria.unit_id);
    } else {
      criteria.unit_id = await UnitService.getDonViQuery(req, criteria.unit_id);
    }
  }
  
  const options = query.options;
  options.select = '-password -is_deleted';
  options.populate = [
    { path: 'unit_id' },
    { path: 'role_id' },
  ];
  if (!options.sort) {
    options.sort = sortOpts;
  }
  const users = await User.paginate(criteria, options);
  users.docs.forEach(doc => {
    if (req.user.is_system_admin) {
      doc.allow_update = true;
    } else {
      let permissionsUpdate = Array.isArray(doc.permissions) ? doc.permissions : [];
      if (Array.isArray(doc.role_id)) {
        doc.role_id.forEach(role => {
          if (Array.isArray(role.permissions)) {
            permissionsUpdate = [...permissionsUpdate, ...role.permissions];
          }
        });
      }
    }
  });
  return users;
}

export default {

  async signupFree(req, res) {
    try {
      const { t } = req;
      const { value, error } = userService.validateSignup(req.body, 'POST');
      value.permissions = [];
      value.role = null;
      value.unit_id = null;
      value.is_system_admin = false;

      if (error) {
        console.log(error);
        return res.status(400).json(error.details);
      }

      const checkUsername = await User.findOne({ username: value.username });
      if (checkUsername) {
        return res.status(400).json({ success: false, message: t('error_user_account_is_registered') });
      }

      if (value.email) {
        const checkEmail = await User.findOne({ email: value.email });
        if (checkEmail) {
          return res.status(400).json({ success: false, message: t('error_user_email_was_registered') });
        }
      }

      if (value.phone) {
        const checkPhone = await User.findOne({ phone: value.phone });
        if (checkPhone) {
          return res.status(400).json({ success: false, message: t('error_user_phone_was_registered') });
        }
      }

      const user = await User.create(value);

      if (value.email) {
        let mailOptions = {
          from: `${t('email_user_create_from')} <${config.mail.auth.user}>`, // sender address
          to: value.email, // list of receivers
          subject: t('email_user_create_subject'), // Subject line
          //text: 'Pass moi la 123455', // plaintext body
          html: `<h2>${t('email_user_create_html1')}</h2>
              <div><strong>${t('email_user_create_html2')}</strong>${value.full_name}</div>
              <div><strong>${t('email_user_create_html3')}</strong>${value.username}</div>    
              <div><strong>${t('email_user_create_html4')}</strong>${value.phone}</div>
              <div><strong>${t('email_user_create_html5')}</strong>${value.email}</div>
              <div>${t('email_user_create_html6')}<a href="${config.host_admin}">Link</a></div>`, // html body
        };

        sendEmail(mailOptions, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
      return responseHelper.success(res, user);
    } catch (err) {
      console.error(err);
      return responseHelper.error(res, err);
    }
  },

  async signup(req, res) {
    try {
      const { t } = req;
      const { value, error } = userService.validateSignup(JSON.parse(req.body.json_data), 'POST');
      if (error) {
        console.log(error);
        return res.status(400).json(error.details);
      }
      value.username = value.username.toLowerCase();
      const checkUsername = await User.findOne({
        username: value.username,
      });
      if (checkUsername) {
        return res.status(400).json({ success: false, message: t('error_user_account_is_registered') });
      }

      if (value.email) {
        const checkEmail = await User.findOne({
          email: value.email,
        });
        if (checkEmail) {
          return res.status(400).json({ success: false, message: t('error_user_email_was_registered') });
        }
      }

      if (value.phone) {
        const checkPhone = await User.findOne({
          phone: value.phone,
        });
        if (checkPhone) {
          return res.status(400).json({ success: false, message: t('error_user_phone_was_registered') });
        }
      }

      if (!req.user.is_system_admin) {
        if (await handleCheckOverPermission(req.user._id, value)) {
          return responseHelper.error(res, { message: t('error_user_invalid_permission') });
        }
      }

      // update avatar
      if (req.files?.avatar?.path) {
        const avatar_id = fileUtils.createUniqueFileName(req.files.avatar.originalFilename);
        const avatarPath = await ImageUtils.rotate(avatar_id, req.files.avatar.path);
        await fileUtils.createByName(avatarPath, avatar_id);
        value.avatar = avatar_id;
      }

      const user = await User.create(value);

      if (value.email) {
        let mailOptions = {
          from: `${t('email_user_create_from')} <${config.mail.auth.user}>`, // sender address
          to: value.email, // list of receivers
          subject: t('email_user_create_subject'), // Subject line
          //text: 'Pass moi la 123455', // plaintext body
          html: `<h2>${t('email_user_create_html1')}</h2>
              <div><strong>${t('email_user_create_html2')}</strong>${value.full_name}</div>
              <div><strong>${t('email_user_create_html3')}</strong>${value.username}</div>
              <div><strong>${t('email_user_create_html4')}</strong>${value.phone}</div>
              <div><strong>${t('email_user_create_html5')}</strong>${value.email}</div>
              <div>${t('email_user_create_html6')}<a href="${config.host_admin}">Link</a></div>`, // html body
        };

        sendEmail(mailOptions, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
      return responseHelper.success(res, user);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  },
  async login(req, res) {
    try {
      const { t } = req;
      const { value, error } = userService.validateLogin(req.body);
      const originUserName = value.username;
      value.username = value.username?.toLowerCase();
      if (error) {
        return res.status(400).json(error);
      }
      const user = await User.findOne({
        username: { $in: [value.username, originUserName] },
        is_deleted: false,
      })
      .populate('role_id')
      .populate('unit_id')
      .lean();
      if (!user) {
        return res.status(401).json({ success: false, message: t('error_user_login_username_password_wrong') });
      }

      let authenticated;
      if (user?.password) {
        authenticated = userService.comparePassword(value.password, user.password);
      }

      if (!authenticated) {
        return res.status(401).json({ success: false, message: t('error_user_login_username_password_wrong') });
      }

      if (!user.active) {
        return res.status(401).json({
          success: false,
          message: t('error_user_login_account_locked'),
        });
      }
      const data = await Setting.findOne();
      const token = jwt.issue({ id: user._id, isUser: true }, '1h');

      let expRefreshToken = data.phien_dang_nhap || '7';
      const nowTimeStamp = new Date().getTime();
      let expTimeStamp = nowTimeStamp;

      if (data?.don_vi_dang_nhap === 'h') {
        expTimeStamp = expTimeStamp + expRefreshToken * 60 * 60 * 1000;
      } else {
        expTimeStamp = expTimeStamp + expRefreshToken * 24 * 60 * 60 * 1000;
      }

      const nextExpDay = moment(new Date(expTimeStamp)).add(1, 'days').format('YYYY-MM-DD 18:00:00');
      const expDay = moment(new Date(expTimeStamp)).format('YYYY-MM-DD 18:00:00');
      const nextExpDayTimeStamp = new Date(nextExpDay).getTime();
      const expDayTimeStamp = new Date(expDay).getTime();

      let expiresDateTime;
      if (expTimeStamp > expDayTimeStamp) {
        expRefreshToken = nextExpDayTimeStamp - nowTimeStamp;
        expiresDateTime = nextExpDay;
      } else {
        expRefreshToken = expDayTimeStamp - nowTimeStamp;
        expiresDateTime = expDay;
      }

      const refreshToken = jwt.issueRefresh({ id: user._id, isUser: true }, expRefreshToken / 1000 + 's');
      await RefreshTokenService.create({
        user_id: user._id,
        refresh_token: refreshToken,
        expires_date: expiresDateTime,
      });
      await userService.findAndRemoveDeviceToken(req.body.deviceToken);
      await userService.addOrUpdateDeviceToken(user, req.body.deviceToken);
      delete user.password;
      delete user.__v;
      return res.json({ token, refreshToken, user });
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  },
  async registerDevice(req, res) {
    try {
      const user = req.user;

      if (!user) {
        return responseHelper.error(res, 404, '');
      }

      await userService.addOrUpdateDeviceToken(user, req.body.device_token);

      responseHelper.success(res, req.body);
    } catch (err) {
      console.error(err);
      return responseHelper.error(res, err);
    }
  },
  async unregisterDevice(req, res) {
    try {
      await userService.findAndRemoveDeviceToken(req.body.device_token);
      // Remove old refresh token info to DB
      if (req.body?.refreshToken) await RefreshTokenService.deleteMany({ refresh_token: req.body.refreshToken });
      return responseHelper.success(res, req.body);
    } catch (err) {
      console.error(err);
      return responseHelper.error(res, err);
    }
  },

  async authenticate(req, res) {
    let userInfo = await req.user
      .populate('role_id')
      .populate('unit_id')
      .execPopulate();
    return res.status(200).json(userInfo);
  },

  async findAll(req, res) {
    try {
      const users = await getAllUsers(req);
      return responseHelper.success(res, users);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  },

  async findAllIncludeDeletedUnit(req, res) {
    try {
      const users = await getAllUsers(req, true);
      return responseHelper.success(res, users);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  },

  async findOne(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return responseHelper.error(res, null, 404);
      }
      return res.json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  },
  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!req.user.is_system_admin) {
        if (await handleCheckOverPermission(req.user._id, { _id: id })) {
          return responseHelper.error(res, { message: t('user_delete_insufficient_permissions') });
        }
      }
      const user = await User.findOneAndUpdate({ _id: id }, { is_deleted: true }, { new: true });
      if (!user) {
        return responseHelper.error(res, '', 404);
      }
      return responseHelper.success(res, user);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  },
  async update(req, res) {
    try {
      const { t } = req;
      const { id } = req.params;
      const currentData = await User.findById(id);
      if (!currentData) {
        return responseHelper.error(res, CommonError.NOT_FOUND);
      }
      const { value, error } = userService.validateSignup(JSON.parse(req.body.json_data), 'PUT');
      value.username = value.username.toLowerCase();

      delete value.password;
      delete value.is_system_admin;
      delete value.last_login;
      delete value.is_deleted;

      if (error && error.details) {
        return responseHelper.error(res, error.details[0], 400);
      }
      const queryUnique = [{ email: value.email }];
      if (value.phone) {
        queryUnique.push({ phone: value.phone });
      }
      let userInfo = await User.findOne({
        $and: [
          { _id: { $ne: id } },
          { $or: queryUnique },
        ],
      });

      if (userInfo) {
        if (value.username === userInfo.username) {
          return res.status(400).json({ success: false, message: t('error_user_account_is_registered') });
        }
        if (value.phone && value.phone === userInfo.phone) {
          return res.status(400).json({ success: false, message: t('error_user_phone_was_registered') });
        }
        if (value.email === userInfo.email) {
          return res.status(400).json({ success: false, message: t('error_user_email_was_registered') });
        }
      }
      let user = await User.findById(id);
      if (!user) {
        return responseHelper.error(res, null, 404);
      }

      if (!req.user.is_system_admin) {
        if (await handleCheckOverPermission(req.user._id, { ...value, _id: id })) {
          return responseHelper.error(res, { message: t('user_update_insufficient_permissions') });
        }
      }

      // update avatar
      if (req.files?.avatar?.path) {
        if (user.avatar) {
          deleteFile(getFilePath(user.avatar));
        }
        const avatar_id = fileUtils.createUniqueFileName(req.files.avatar.originalFilename);
        const avatarPath = await ImageUtils.rotate(avatar_id, req.files.avatar.path);
        await fileUtils.createByName(avatarPath, avatar_id);
        value.avatar = avatar_id;
      }
      //
      user = await User.findOneAndUpdate({ _id: id }, value, { new: true })
        .populate('unit_id')
        .populate('role_id');
      if (user.email) {
        let mailOptions = {
          from: `${t('email_user_create_from')} <${config.mail.auth.user}>`, // sender address
          to: value.email, // list of receivers
          subject: t('email_user_update_subject'), // Subject line
          //text: 'Pass moi la 123455', // plaintext body
          html: `<h2>${t('email_user_update_html1')}</h2>
              <div><strong>${t('email_user_create_html2')}</strong>${value.full_name}</div>
              <div><strong>${t('email_user_create_html3')}</strong>${value.username}</div>
              <div><strong>${t('email_user_create_html4')}</strong>${value.phone}</div>
              <div><strong>${t('email_user_create_html5')}</strong>${value.email}</div>
              <div>${t('email_user_create_html6')}<a href="${config.host_admin}">Link</a></div>`, // html body
        };
        sendEmail(mailOptions, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }

      return responseHelper.success(res, user);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  },

  async changePassword(req, res) {
    const { t } = req;
    const user = await User.findOne({ is_deleted: false, _id: req.user._id });
    if (!user) {
      return responseHelper.error(res, null, 404);
    }

    const authenticated = userService.comparePassword(req.body.old_password, user.password);
    if (!authenticated) {
      return res.status(400).json({ success: false, message: t('error_old_password_wrong') });
    }

    const encryptedPass = userService.encryptPassword(req.body.new_password);

    let userUpdate = await User.findOneAndUpdate(
      { _id: req.user._id },
      { password: encryptedPass, never_login: false, last_change_password: new Date() },
      { new: true },
    ).lean();

    if (userUpdate) {
      await timeout(1000);
      // Create new access token
      const token = jwt.issue({ id: user?.id, isUser: user?.isUser }, '1h');
      userUpdate.token = token;
    }

    if (req.body.current_refresh_token) {
      // Ngoại trừ refreshtoken hiện tại thì xóa toàn bộ các refresh token khác của user hiện tại trong DB
      await RefreshTokenService.deleteMany({
        user_id: user?._id,
        refresh_token: { $ne: req.body.current_refresh_token },
      });
    } else {
      // Xóa toàn bộ các refresh token khác của user hiện tại trong DB
      await RefreshTokenService.deleteMany({ user_id: user?._id });
    }

    const emailContent = generateChangePasswordEmail(userUpdate.full_name, config.host_admin, t);

    let mailOptions = {
      from: `${t('email_user_create_from')} <${config.mail.auth.user}>`, // sender address
      to: userUpdate.email, // list of receivers
      subject: t('error_user_change_message_successful'), // Subject line
      //text: 'Pass moi la 123455', // plaintext body
      html: emailContent, // html body
    };

    sendEmail(mailOptions, (err) => {
      if (err) {
        console.log(err);
      }
    });
    return responseHelper.success(res, userUpdate);
  },

  async updateInfo(req, res) {
    try {
      const { t } = req;
      const id = req.user._id;
      const { value, error } = userService.validateSignup(JSON.parse(req.body.json_data), 'PUT');

      if (error && error.details) {
        return responseHelper.error(res, error.details[0], 400);
      }
      delete value.password;
      delete value.username;
      delete value.role;
      delete value.is_system_admin;
      delete value.permissions;
      // delete value.unit_id;
      delete value.bac_an_toan;
      delete value.active;
      delete value.last_login;
      delete value.is_deleted;

      // check unique email
      const checkMail = await User.findOne(
        {
          _id: { $ne: id },
          email: value.email,
        },
        { _id: 1 });
      if (checkMail) {
        return responseHelper.error(res, { message: t('user_email_has_registered') });
      }

      // update avatar
      if (req.files.avatar && req.files.avatar.path) {
        if (req.user.avatar) {
          deleteFile(getFilePath(req.user.avatar, STORE_DIRS.AVATAR));
        }
        const avatar_id = fileUtils.createUniqueFileName(req.files.avatar.originalFilename);
        const avatarPath = await ImageUtils.rotate(avatar_id, req.files.avatar.path);
        await fileUtils.createByName(avatarPath, avatar_id);
        value.avatar = avatar_id;
      }

      const user = await User.findOneAndUpdate({ _id: id }, value, { new: true })
        .populate({ path: 'role_id unit_id' });
      if (!user) {
        return responseHelper.error(res, null, 404);
      }

      if (user.email) {
        let mailOptions = {
          from: `Hệ thống Camera AI giám sát cảnh báo <${config.mail.auth.user}>`, // sender address
          to: value.email, // list of receivers
          subject: 'Cập nhật thông tin tài khoản thành công', // Subject line
          //text: 'Pass moi la 123455', // plaintext body
          html: `<h2>Bạn đã cập nhật tài khoản thành công, Thông tin tài khoản</h2>
              <div><strong>Họ tên: </strong>${user.full_name}</div>
              <div><strong>Tên tài khoản: </strong>${user.username}</div>             
              <div><strong>Số điện thoại: </strong>${user.phone || ''}</div>
              <div><strong>Email: </strong>${user.email}</div>
              <div>Vui lòng đăng nhập tại <a href="${config.host_admin}">Link</a></div>`, // html body
        };

        sendEmail(mailOptions, (err) => {
          if (err) {
            console.log(er);
          }
        });
      }
      return responseHelper.success(res, user);
    } catch (err) {
      console.error(err);
      responseHelper.error(res, err, 400);
    }
  },

  async forgotPasswordMail(req, res) {
    try {
      const { t } = req;
      let user = await User.findOne({
        is_deleted: false,
        email: req.body.email,
      });
      if (!user) {
        return responseHelper.error(res, { message: t('INVALID_EMAIL') }, 404);
      }
      const data = await Setting.findOne();
      const phienReset = data.phien_reset ? data.phien_reset + data.don_vi_reset : '';

      const token = jwt.issue({ id: user._id }, phienReset || '30m');

      let url = config.host_admin + '/reset-password?token=' + token;
      let mailOptions = {
        from: `Hệ thống Quản lý đường dây truyền tải điện <${config.mail.auth.user}>`, // sender address
        to: user.email, // list of receivers
        subject: `${t('email_subject_user_forgot_password')}`, // Subject line
        html: `<p>${t('email_html1_user_forgot_password')}</p>
              </br>
              <p>${t('email_html2_user_forgot_password')} : ${url} </p>`, // html body
      };

      sendEmail(mailOptions, (err) => {
        if (err) {
          console.log(err);
        }
      });
      responseHelper.success(res);
    } catch (err) {
      responseHelper.success(res);
    }
  },

  async resetPassword(req, res) {
    const { t } = req;
    const user = await User.findOne({ is_deleted: false, _id: req.user._id });
    if (!user) {
      return responseHelper.error(res, 404, '');
    }

    const encryptedPass = userService.encryptPassword(req.body.password);

    const userUpdate = await User.findOneAndUpdate({ _id: req.user._id }, { password: encryptedPass }, { new: true });

    let mailOptions = {
      from: `Hệ thống Quản lý đường dây truyền tải điện <${config.mail.auth.user}>`, // sender address
      to: userUpdate.email, // list of receivers
      subject: 'Đổi mật khẩu thành công', // Subject line
      html: generateChangePasswordEmail(userUpdate.full_name, config.host_admin, t),
    };

    sendEmail(mailOptions, (err) => {
      if (err) {
        console.log(err);
      }
    });
    return res.json({ success: true });
  },

  async activeAccount(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return responseHelper.error(res, null, 404);
      }
      const userUpdated = User.findByIdAndUpdate(id, { active: true });
      return responseHelper.success(res, userUpdated);
    } catch (err) {
      responseHelper.error(res, err, 400);
    }
  },

  async deactiveAccount(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return responseHelper.error(res, null, 404);
      }
      const userUpdated = await User.findByIdAndUpdate(id, { active: false });
      return responseHelper.success(res, userUpdated);
    } catch (err) {
      responseHelper.error(res, err, 400);
    }
  },

  async getAllDaXoa(req, res) {
    try {
      let query = queryHelper.extractQueryParam(req, ['username', 'full_name', 'email', 'phone']);
      const criteria = query.criteria;
      criteria.is_system_admin = false;
      criteria.unit_id = await UnitService.getDonViQueryIncludeDeleted(req, criteria.unit_id);
      if (!req.query.includeChildren && req.query.unit_id) {
        criteria.unit_id = req.query.unit_id;
      }

      // const allRole = await ROLE.find({}, { permissions: 1 }).lean();
      // const userReqPermissions = await getPermissionByUserId(req.user._id);
      // const userReqNotPermissions = await getNotPermissionByUserId(req.user._id);

      // let excludeIds = [];
      // allRole.forEach(role => {
      //   if (role.permissions.filter(n => !userReqPermissions.includes(n)).length) {
      //     excludeIds = [...excludeIds, role._id];
      //   }
      // });
      // criteria.role_id = { $nin: excludeIds };
      // criteria.permissions = { $nin: userReqNotPermissions };

      const options = query.options;
      criteria.is_deleted = true;
      options.select = '-password -is_deleted';
      options.populate = [
        { path: 'unit_id' },
        { path: 'role_id' },
      ];
      if (!options.sort) {
        options.sort = sortOpts;
      }
      const users = await User.paginate(criteria, options);
      return responseHelper.success(res, users);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  },

  async restoreAccount(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return responseHelper.error(res, null, 404);
      }
      const userUpdated = await User.findByIdAndUpdate(id, { is_deleted: false });
      return responseHelper.success(res, userUpdated);
    } catch (err) {
      responseHelper.error(res, err, 400);
    }
  },

  async refreshToken(req, res) {
    try {
      const { t } = req;
      const oldRefreshToken = Object.keys(req.body)[0];
      const checkExistRefreshToken = await RefreshTokenService.getAll({ refresh_token: oldRefreshToken });
      if (!checkExistRefreshToken || checkExistRefreshToken.length === 0) {
        return res.status(401).json({
          success: false,
          message: t('error_user_invalid_refresh_token'),
        });
      }

      // Verify refresh token
      const user = await jwt.verifyToken(oldRefreshToken);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: t('error_user_invalid_token'),
        });
      } else {
        // Create new access token
        const token = jwt.issue({ id: user?.id, isUser: user?.isUser }, '1h');

        // Create new refresh token
        const expDay = Math.abs(new Date(user?.exp * 1000) - new Date()) / 1000;
        const refreshToken = jwt.issueRefresh({ id: user?.id, isUser: user?.isUser }, expDay + 's');

        // Insert new refresh token info to DB
        await RefreshTokenService.create({
          user_id: user?.id,
          refresh_token: refreshToken,
          expires_date: moment(new Date(user?.exp * 1000)),
        });

        // Remove old refresh token info to DB
        await RefreshTokenService.deleteMany({ refresh_token: oldRefreshToken });

        return res.json({ token, refreshToken, user });
      }
    } catch (err) {
      return res.status(500).send(err);
    }
  },
};


async function timeout(delay) {
  return new Promise(res => setTimeout(res, delay));
};

async function handleCheckOverPermission(userReqId, dataRequest = {}) {
  const userReqPermissions = await getPermissionByUserId(userReqId);
  if (dataRequest._id) {
    const userUpdatePermissions = await getPermissionByUserId(dataRequest._id);
    return userUpdatePermissions.filter(n => !userReqPermissions.includes(n)).length;
  }
  if (dataRequest.role_id) {
    let permissionsUpdate = Array.isArray(dataRequest.permissions) ? dataRequest.permissions : [];
    const roleUpdate = await RoleService.getAll({ _id: dataRequest.role_id }, { permissions: 1 });
    roleUpdate.forEach(role => {
      if (Array.isArray(role.permissions)) {
        permissionsUpdate = [...permissionsUpdate, ...role.permissions];
      }
    });
    return permissionsUpdate.filter(n => !userReqPermissions.includes(n)).length;
  }
  return false;
}

export async function getPermissionByUserId(userId) {
  let userInfo = await User.findById(userId).populate('role_id').lean();
  return getPermissionByUserInfo(userInfo);
}

export async function getPermissionByUserInfo(userInfo) {
  let userPermissions = Array.isArray(userInfo.permissions) ? userInfo.permissions : [];
  userInfo.role_id?.forEach(per => {
    if (Array.isArray(per.permissions)) {
      userPermissions = [...userPermissions, ...per.permissions];
    }
  });
  if (Array.from(new Set(userPermissions))?.[0] === permission.createPermission(resources.ALL.code, actions.ALL.code)) {
    let allPermission = [];
    Object.values(resources).forEach(resource => {
      Object.values(actions).forEach(action => {
        allPermission = [...allPermission, permission.createPermission(resource.code, action.code)];
      });
    });
    return allPermission;
  }
  return Array.from(new Set(userPermissions));
}

export async function getNotPermissionByUserId(userId) {
  let userInfo = await User.findById(userId).populate('role_id').lean();
  let userPermissions = Array.isArray(userInfo.permissions) ? userInfo.permissions : [];
  userInfo.role_id?.forEach(per => {
    if (Array.isArray(per.permissions)) {
      userPermissions = [...userPermissions, ...per.permissions];
    }
  });

  let notPermission = [];
  Object.values(resources).forEach(resource => {
    Object.values(actions).forEach(action => {
      if (!userPermissions.includes(permission.createPermission(resource.code, action.code))) {
        notPermission = [...notPermission, permission.createPermission(resource.code, action.code)];
      }
    });
  });

  if (Array.from(new Set(userPermissions))?.[0] === permission.createPermission(resources.ALL.code, actions.ALL.code)) {
    return [];
  }
  return notPermission;
}
