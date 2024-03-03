// import { convertObject, extractIds, extractKeys, groupBy } from '../../utils/dataconverter';
// import { cloneObj, isFloat } from '../../common/functionCommons';
// import DIEU_KIEN_AN_TOAN_CONG_VIEC from '../QuanLyVanHanh/DieuKienAnToanCongViec/dieuKienAnToanCongViec.model';
// import i18next from 'i18next';
// import PHIEU_GIAO_VIEC from '../QuanLyVanHanh/PhieuGiaoViec/phieuGiaoViec.model';
// import * as DonViService from '../DonVi/donVi.service';
// import * as DuongDayService from '../TongKe/DuongDay/duongDay.service';
// import * as KhoangCotService from '../TongKe/KhoangCot/khoangCot.service';
// import { getCache, setCache } from '../../cache';

// async function getLinked(dataInput) {
//   const currentData1 = cloneObj(dataInput);
//   const currentData2 = cloneObj(dataInput);

//   let linkedData = cloneObj([currentData1[0]]);
//   let check = true;
//   while (check) {
//     const lastItem = linkedData[linkedData.length - 1];
//     const nextItem = currentData1.findIndex(x => x.vi_tri_bat_dau_id?._id === lastItem?.vi_tri_ket_thuc_id?._id);
//     if (nextItem !== -1) {
//       linkedData.push(currentData1[nextItem]);
//       currentData1.splice(nextItem, 1);
//     } else {
//       check = false;
//     }
//   }

//   check = true;
//   while (check) {
//     const firstItem = linkedData[0];
//     const nextItem = currentData2.findIndex(x => x.vi_tri_ket_thuc_id._id === firstItem?.vi_tri_bat_dau_id?._id);
//     if (nextItem !== -1) {
//       linkedData.unshift(currentData2[nextItem]);
//       currentData2.splice(nextItem, 1);
//     } else {
//       check = false;
//     }
//   }

//   const linkedDataId = Array.from(new Set(extractIds(linkedData)));
//   if (linkedDataId.length !== linkedData.length) {
//     linkedData = linkedDataId.map(dataId => {
//       return linkedData.find(linkedItem => linkedItem._id?.toString() === dataId.toString());
//     });
//   }

//   const keys = extractKeys(linkedData, '_id');
//   const remainingData = dataInput.filter(x => !keys.includes(x._id?.toString()));
//   return { linkedData, remainingData };
// }

// export async function handleDataKhoangCot(khoangCotData) {
//   if (!Array.isArray(khoangCotData) || !khoangCotData.length) return [];
//   const dataReturn = [];
//   let processedData = await getLinked(khoangCotData);
//   dataReturn[0] = processedData.linkedData;
//   while (processedData.remainingData.length) {
//     processedData = await getLinked(processedData.remainingData);
//     dataReturn[dataReturn.length] = processedData.linkedData;
//   }
//   return dataReturn;
// }


// export async function thongKeDieuKienAnToanCongViec(queryAggregate) {

//   const dieuKienAggregate = await DIEU_KIEN_AN_TOAN_CONG_VIEC.aggregate([
//     { $match: queryAggregate },
//     {
//       $group: {
//         _id: {
//           dieu_kien_an_toan_id: '$dieu_kien_an_toan_id',
//         },
//         soluong: {
//           $sum: 1.0,
//         },
//       },
//     },
//     {
//       $set: {
//         dieu_kien_an_toan_id: '$_id.dieu_kien_an_toan_id',
//       },
//     },
//     {
//       $lookup: {
//         from: 'DieuKienAnToan',
//         localField: 'dieu_kien_an_toan_id',
//         foreignField: '_id',
//         as: 'dieukienantoans',
//       },
//     },
//     {
//       $set: {
//         loai_dieu_kien: '$dieukienantoans.loai_dieu_kien',
//       },
//     },
//     {
//       $unwind: {
//         path: '$loai_dieu_kien',
//       },
//     },
//     {
//       $group: {
//         _id: {
//           loai_dieu_kien: '$loai_dieu_kien',
//         },
//         soluong: {
//           $sum: '$soluong',
//         },
//       },
//     },
//     {
//       $set: {
//         name: '$_id.loai_dieu_kien',
//       },
//     },
//     {
//       $project: {
//         name: 1, soluong: 1, _id: 0,
//       },
//     },
//     { $sort: { name: 1 } },
//   ]);

//   dieuKienAggregate.forEach(dieukien => {
//     dieukien.name = i18next.t(dieukien.name);
//   });

//   return dieuKienAggregate;
// }

// export async function thongKePhieuCoDieuKienAnToan(allPhieuGiaoViecIds) {

//   const dieuKienAnToan = await DIEU_KIEN_AN_TOAN_CONG_VIEC.find({
//     phieu_giao_viec_id: { $in: allPhieuGiaoViecIds },
//     is_deleted: false,
//   }).populate('dieu_kien_an_toan_id', 'loai_dieu_kien ten_dieu_kien_an_toan')
//     .select('dieu_kien_an_toan_id phieu_giao_viec_id')
//     .lean();

//   const allPhieuGiaoViec = await PHIEU_GIAO_VIEC.find({
//     _id: { $in: extractKeys(dieuKienAnToan, 'phieu_giao_viec_id') },
//     is_deleted: false,
//   }).select('so_phieu loai_cong_viec ')
//     .sort({ created_at: -1 })
//     .lean();

//   const groupDieuKienByPhieuId = groupBy(dieuKienAnToan, 'phieu_giao_viec_id');
//   allPhieuGiaoViec.forEach(phieu => {
//     phieu.dieu_kien = groupDieuKienByPhieuId[phieu._id];
//   });
//   return allPhieuGiaoViec;
// }

// const populateOpts = [
//   {
//     path: 'vi_tri_bat_dau_id vi_tri_ket_thuc_id', select: 'ten_vi_tri unit_id kinh_do vi_do',
//     populate: { path: 'unit_id', select: 'name' },
//   },
//   { path: 'duong_day_id', select: 'ten_duong_day' },
// ];

// export async function getAllBanDoLuoi() {
//   const allDonVi = await DonViService.getAll({ is_deleted: false }, { _id: 1, is_deleted: 1 });
//   const allDuongDay = await DuongDayService.getAll(
//     { is_deleted: false, unit_id: extractIds(allDonVi) },
//     {
//       ten_duong_day: 1, loai_duong_day_id: 1,
//       i: 1, p: 1, q: 1, u: 1,
//       thoi_gian_dong_bo: 1,
//       thoi_diem_thong_so: 1,
//     })
//     .populate([
//       { path: 'loai_duong_day_id', select: 'color' },
//       { path: 'unit_id', select: 'name' },
//     ]);
//   const allDuongDayId = extractIds(allDuongDay);
//   const allKhoangCot = await KhoangCotService.getAll({
//     vi_tri_bat_dau_id: { $exists: true },
//     vi_tri_ket_thuc_id: { $exists: true },
//     '$or': allDuongDayId.map(duongDayId => ({ duong_day_id: duongDayId })),
//     is_deleted: false,
//   }, { ten_khoang_cot: 1 })
//     .populate(populateOpts);

//   const khoangCotGroupDuongDay = allKhoangCot.reduce((prevValue, currentValue) => {
//     const { duong_day_id, ...value } = currentValue;
//     const { vi_tri_bat_dau_id, vi_tri_ket_thuc_id } = value;
//     const startLng = vi_tri_bat_dau_id?.kinh_do / 1;
//     const startLat = vi_tri_bat_dau_id?.vi_do / 1;
//     const endLng = vi_tri_ket_thuc_id?.kinh_do / 1;
//     const endLat = vi_tri_ket_thuc_id?.vi_do / 1;
//     if (!isNaN(startLng) && !isNaN(startLat) && !isNaN(endLng) && !isNaN(endLat) &&
//       isFloat(startLng) && isFloat(startLat) && isFloat(endLng) && isFloat(endLat)) {
//       duong_day_id?.forEach(duongDay => {
//         prevValue[duongDay._id] ||= [];
//         prevValue[duongDay._id].push(value);
//       });
//     }
//     return prevValue;
//   }, {});

//   for (let i = 0; i < allDuongDay.length; i++) {
//     allDuongDay[i].khoang_cot_id = await handleDataKhoangCot(khoangCotGroupDuongDay[allDuongDay[i]._id]);
//   }
//   return allDuongDay;
// }
// export let BAN_DO_LUOI_CACHE = "BAN_DO_LUOI_CACHE";

// export async function getCacheBanDoLuoi(){
//   return await getCache(BAN_DO_LUOI_CACHE)
// }

// export async function setCacheBanDoLuoi(banDoLuoi) {
//   try {
//     console.log("cacheBanDoLuoi", process.pid);
//     await setCache(BAN_DO_LUOI_CACHE, banDoLuoi, 60)
//   } catch (e) {
//     console.log(e);
//   }
// }
