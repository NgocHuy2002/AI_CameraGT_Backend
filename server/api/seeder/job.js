import cron from 'node-cron';
import * as CaiDatHeThongService from '../resources/CaiDatHeThong/caiDatHeThong.service';
import * as RefreshTokenService from '../resources/RefreshToken/refreshToken.service';
import * as ServerLogService from '../resources/ServerLog/serverLog.service';
import { getConfig } from '../../config/config';
import { extractIds } from '../utils/dataconverter';


const config = getConfig(process.env.NODE_ENV);

// async function jobDeleteImage() {
//   const cronTime = '30 1 * * *'; // every 1h 30 am
//   // const cronTime = '*/1 * * * *'; // every 1m : use to test
//   //Get số ngày tự động xóa ảnh trong config cài đặt
//   const configSystem = await CaiDatHeThongService.getAll();
//   const kichHoatAutoXoaAnh = configSystem[0].kich_hoat_auto_xoa_anh;
//   const configTime = configSystem[0].phien_auto_xoa_anh;
//   // const unitTime = configSystem[0].don_vi_xoa_anh == 'd' ? 'days' : '';
//   if (!configTime || configTime == 0 || !kichHoatAutoXoaAnh) return;

//   cron.schedule(cronTime, autoDeleteImage, { scheduled: true });
// }

async function jobAutoDeleteRefreshToken() {
  const cronTime = '20 0 * * *'; // every 0h 20 am
  // const cronTime = '*/1 * * * *'; // every 1m : use to test

  async function autoDeleteRefreshToken() {
    await RefreshTokenService.deleteMany({ expires_date: { $lte: new Date() } });
  }

  cron.schedule(cronTime, autoDeleteRefreshToken, { scheduled: true });
}

async function jobDeleteLog() {
  const cronTime = '0 1 * * *'; // every 0h am
  cron.schedule(cronTime, await ServerLogService.deleteLogData, { scheduled: true });
  cron.schedule(cronTime, await ServerLogService.deleteFileLog, { scheduled: true });
}

export async function onlyOneWorkerJobs() { // chỉ 1 Worker run Job này
  await jobDeleteLog();
  // await jobDeleteImage();
  await jobAutoDeleteRefreshToken();
}

export async function allWorkerJobs() { // Mọi Worder đều run job này

}
