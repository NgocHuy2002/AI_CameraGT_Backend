import Role from '../resources/Role/role.model';
import User from '../resources/User/user.model';
import Setting from '../resources/CaiDatHeThong/caiDatHeThong.model';
import Unit from '../resources/Unit/unit.model';

import actions from '../resources/RBAC/Actions';
import resources from '../resources/RBAC/Resources';
import CommonSetting from './initdata/CommonSetting';
import RootUnit from './initdata/RootUnit';

import { job } from './job';
import { UNIT_LEVEL, ROLE_CODES, USER_CODES } from '../constant/constant';

import * as ModelNames from '../constant/dbCollections';
import * as permission from '../resources/RBAC/permissionHelper';

async function initData() {

  async function initSetting() {
    const count = await Setting.countDocuments();
    if (count) return;
    await Setting.create(CommonSetting);
  }

  await initSetting();

  async function initRoles() {
    const countRole = await Role.countDocuments({ code: { $in: [ROLE_CODES.CODE_SYSTEM_ADMIN] } });
    if (countRole) return;
    const roleSystemAdmin = {
      code: ROLE_CODES.CODE_SYSTEM_ADMIN,
      name: 'System Admin',
      order: 0,
      is_system_admin: true,
      permissions: [
        permission.create(resources.ALL, actions.ALL),
      ],
    };
    await Role.create(roleSystemAdmin);
  }

  await initRoles();

  async function initRootUnit() {
    const count = await Unit.countDocuments({ level: UNIT_LEVEL.CAP_TINH });
    if (count) return;
    await Unit.create(RootUnit);
  }

  await initRootUnit();

  async function initSystemAdmin() {
    const rootUnit = await Unit.findOne({ level: UNIT_LEVEL.CAP_TINH });
    const systemAdminRole = await Role.findOne({ code: ROLE_CODES.CODE_SYSTEM_ADMIN });
    const count = await User.countDocuments({ username: 'sysadmin' });
    if (count) return;
    const systemAdmin = {
      code: USER_CODES.SYSTEM_ADMIN,
      email: 'system.tcamera@gmail.com',
      username: 'sysadmin',
      password: 'thinklabs@36',
      full_name: 'System Admin',
      is_system_admin: true,
      unit_id: rootUnit?._id,
      role_id: [systemAdminRole?._id],
    };
    await User.create(systemAdmin);
  }

  await initSystemAdmin();
  console.log('Init data done');
}

export async function allWorkerInitData(){

}

export async function onlyOneWorkerInitData(){
  try {
    await initData();
  } catch (e) {
    console.log(e);
  }
}

