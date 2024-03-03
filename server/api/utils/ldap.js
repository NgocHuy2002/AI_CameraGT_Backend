import ActiveDirectory from 'activedirectory';
import { configLDAP } from '../constant/ldapConstants';
import { USER_NAME_ADDON } from '../constant/constant';

export async function findUserLDAP(username) {
  return new Promise(async function(resolve, reject) {
    try {
      let ad = new ActiveDirectory(configLDAP);
      ad.findUser(username, async (err, user) => {
        if (err) {
          resolve({ success: false });
        }
        if (!user) {
          resolve({ success: false });
        } else {
          resolve({ success: true, user });
        }
      });
    } catch (e) {
      console.log('e', e);
      resolve({ success: false });
    }
  });
}

export async function ldapAuthenticateAPI(adDn, password) {
  return new Promise(function(resolve, reject) {
    try {
      let ad = new ActiveDirectory(configLDAP);
      ad.authenticate(adDn, password, (err, auth) => {
        if (err) {
          resolve(false);
        }
        if (!auth) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } catch (e) {
      resolve(false);
    }
  });
}


export async function testUserLDAP(username) {
  return new Promise(async function(resolve, reject) {
    try {
      let ad = new ActiveDirectory(configLDAP);
      // const query = `sAMAccountName=*${username}*`;
      const query = `sAMAccountName=${username}`;
      console.log('query', query);
      ad.findUser(username, async (err, results) => {
        if (err) {
          resolve({ error: true });
        }
        if (!results) {
          resolve({ success: false });
        } else {
          resolve(JSON.parse(JSON.stringify(results)));
        }
      });
    } catch (e) {
      console.log('e', e);
      resolve({ success: false });
    }
  });
}
