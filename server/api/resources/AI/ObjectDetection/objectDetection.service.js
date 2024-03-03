// import * as ValidatorHelper from '../../../helpers/validatorHelper';
// import { getFilePath } from '../../../utils/fileUtils';
// import { postFile } from '../../../helpers/requestHelper';
// import * as ThietBiService from '../../DanhMuc/DmThietBi/dmThietBi.service';
// import * as TinhTrangKBTService from '../../DanhMuc/DmThietBi/TinhTrangKBT/tinhTrangKBT.service';
// import * as ThietBiPhatHienService from '../../QuanLyVanHanh/ThietBiPhatHien/thietBiPhatHien.service';
// import * as BatThuongPhatHienService from '../../QuanLyVanHanh/BatThuongPhatHien/batThuongPhatHien.service';
// import * as AnhViTriService from '../../AnhViTri/anhViTri.service';
// import { ANH_VI_TRI } from '../../../constant/dbCollections';
// import { getImageMetadata } from '../../../utils/ImageUtilsGM';
// import { getOne } from '../../CaiDatAi/caiDatAi.service';
// import { extractIds, extractObjectIds } from '../../../utils/dataconverter';
// import { AI_STATUS } from '../../QuanLyVanHanh/BatThuongPhatHien/batThuongPhatHien.model';

// const queue = [];
// let queueIsExecuting = false;

// function enqueue(item) {
//   queue.push(item);
// }

// function checkQueue() {
//   return queue.length > 0;
// }

// function dequeue() {
//   return queue.shift();
// }

// async function executeQueue() {
//   if (queueIsExecuting) return;
//   while (checkQueue()) {
//     queueIsExecuting = true;
//     const { promise, callback } = dequeue();
//     try {
//       const taskResult = await promise;
//       callback(taskResult);
//     } catch (e) {
//       console.log(e);
//       callback(null);
//     }
//   }
//   queueIsExecuting = false;
// }

// async function getObjectDetection(imagePath) {
//   const aiSetting = await getOne();
//   const response = await postFile(aiSetting.api_phan_tich_hinh_anh, imagePath); // gọi AI đến server AI lấy response về
//   if (!response.success || response.success === 'False') {
//     throw Error('Không thể thực hiện được');
//   }
//   if (!response.classified || response.classified.length === 0) return [];
//   return response.classified;
// }

// function promiseObjectDetection(imagePath) {
//   return new Promise((resolve, reject) => {
//     enqueue({
//       promise: getObjectDetection(imagePath),
//       callback: (result) => {
//         if (result) {
//           resolve(result);
//         } else {
//           reject(Error('Không thể thực hiện được'));
//         }
//       },
//     });
//     executeQueue();
//   });
// }

// export async function processImage(image) {
//   async function deleteCurrentAiData() {
//     if (!image._id) return;

//     const thietBiAiCurrent = await ThietBiPhatHienService.getAll(
//       { anh_vi_tri_id: image._id, is_deleted: false, from_ai: true },
//       { _id: 1, ai_status: 1 },
//     );

//     const batThuongAiCurrent = await BatThuongPhatHienService.getAll(
//       {
//         anh_vi_tri_id: image._id,
//         $or: [
//           { from_ai: true },
//           { thiet_bi_phat_hien_id: extractObjectIds(thietBiAiCurrent) },
//         ],
//         is_deleted: false,
//       },
//       { _id: 1, ai_status: 1, thiet_bi_phat_hien_id: 1 },
//     );

//     const thietBiDelete = thietBiAiCurrent.filter(thietBi => thietBi.ai_status === AI_STATUS.CHUA_XAC_NHAN);
//     const batThuongDelete = batThuongAiCurrent.filter(batThuong => {
//       return batThuong.ai_status === AI_STATUS.CHUA_XAC_NHAN || extractIds(thietBiDelete).includes(batThuong.thiet_bi_phat_hien_id?.toString());
//     });
//     await ThietBiPhatHienService.deleteAll(thietBiDelete);
//     await BatThuongPhatHienService.deleteAll(batThuongDelete);
//   }


//   try {
//     await AnhViTriService.processing(image);
//     // delete thiet bi chua xac nhan
//     await deleteCurrentAiData();

//     const imagePath = getFilePath(image.image_id);
//     const metadata = await getImageMetadata(imagePath);
//     const classifieds = await promiseObjectDetection(imagePath);
//     if (classifieds.length === 0) {
//       await AnhViTriService.processSucess(image);
//       return;
//     }
//     const allThietBi = await ThietBiService.getAll({ is_deleted: false });
//     const allThietBiIdMap = {};
//     allThietBi.forEach(thietBi => {
//       allThietBiIdMap[thietBi.ma_thiet_bi] = thietBi;
//     });

//     const allKBT = await TinhTrangKBTService.getAll({ is_deleted: false });
//     const allKBTIdMap = {};
//     allKBT.forEach(kbt => {
//       allKBTIdMap[kbt.ma_tinh_trang] = kbt;
//     });

//     const objectDetections = classifieds.filter(item => {
//       return allThietBiIdMap[item.label];
//     });
//     const defectDetections = classifieds.filter(item => {
//       return allKBTIdMap[item.label];
//     });

//     const thietBiConverted = objectDetections.map(object => convertObjectToThietBi(image._id, metadata, object, allThietBiIdMap));

//     // check exist
//     let thietBiPhatHienCreate = [];
//     let thietBiPhatHienExist = [];
//     for (let i = 0; i < thietBiConverted.length; i++) {
//       const checkThietBi = await ThietBiPhatHienService.getOne({
//         dm_thiet_bi_id: thietBiConverted[i].dm_thiet_bi_id,
//         anh_vi_tri_id: thietBiConverted[i].anh_vi_tri_id,
//         height: thietBiConverted[i].height,
//         width: thietBiConverted[i].width,
//         x: thietBiConverted[i].x,
//         y: thietBiConverted[i].y,
//         from_ai: true,
//         is_deleted: false,
//       });
//       if (!checkThietBi) {
//         thietBiPhatHienCreate.push(thietBiConverted[i]);
//       } else {
//         thietBiPhatHienExist.push(checkThietBi);
//       }
//     }


//     if ([...thietBiPhatHienCreate, ...thietBiPhatHienExist].length > 0) {
//       const thietBiPhatHien = await ThietBiPhatHienService.create(thietBiPhatHienCreate);
//       const thietBiList = [...thietBiPhatHien, ...thietBiPhatHienExist]
//       const batThuongPhatHienCreate = defectDetections.map(defect => convertDefectToBatThuong(thietBiList, metadata, defect, allKBTIdMap));
//       if (batThuongPhatHienCreate) {
//         for (let eachBatThuong of batThuongPhatHienCreate) {
//           // check exist
//           const checkBatThuong = await BatThuongPhatHienService.getOne({
//             dm_thiet_bi_id: eachBatThuong.dm_thiet_bi_id,
//             anh_vi_tri_id: eachBatThuong.anh_vi_tri_id,
//             height: eachBatThuong.height,
//             width: eachBatThuong.width,
//             x: eachBatThuong.x,
//             y: eachBatThuong.y,
//             from_ai: true,
//             is_deleted: false,
//             // ai_status: AI_STATUS.AI_TU_CHOI,
//           });

//           if (!checkBatThuong) {
//             await BatThuongPhatHienService.create(eachBatThuong);
//           }
//         }
//       }
//     }
//     await AnhViTriService.processSucess(image);
//   } catch (e) {
//     console.log(e);
//     await AnhViTriService.processFail(image);
//   }
// }

// function convertDefectToBatThuong(thietBiPhatHien, metadata, defect, allKBTIdMap) {
//   const x = defect.xmin / metadata.width;
//   const y = defect.ymin / metadata.height;
//   const width = (defect.xmax - defect.xmin) / metadata.width;
//   const height = (defect.ymax - defect.ymin) / metadata.height;

//   let thiet_bi_phat_hien_id = null;
//   let dm_thiet_bi_id = null;
//   let anh_vi_tri_id = null;

//   const thietBi = thietBiPhatHien.find((thietBi) => {
//     if (thietBi.x > x) return false;
//     if (thietBi.y > y) return false;
//     if (thietBi.width + thietBi.x < x + width) return false;
//     if (thietBi.height + thietBi.y < y + height) return false;
//     return true;
//   });

//   if (thietBi) {
//     thiet_bi_phat_hien_id = thietBi._id;
//     dm_thiet_bi_id = thietBi.dm_thiet_bi_id;
//     anh_vi_tri_id = thietBi.anh_vi_tri_id;
//   }

//   return {
//     thiet_bi_phat_hien_id: thiet_bi_phat_hien_id,
//     tinh_trang_kbt_id: allKBTIdMap[defect.label]?._id,
//     dm_thiet_bi_id: dm_thiet_bi_id,
//     anh_vi_tri_id: anh_vi_tri_id,
//     height: height,
//     width: width,
//     x: x,
//     y: y,
//     from_ai: true,
//   };
// }

// function convertObjectToThietBi(imageId, metadata, object, allThietBiIdMap) {

//   const x = object.xmin;
//   const y = object.ymin;
//   const width = object.xmax - object.xmin;
//   const height = object.ymax - object.ymin;

//   return {
//     dm_thiet_bi_id: allThietBiIdMap[object.label]?._id,
//     anh_vi_tri_id: imageId,
//     ghi_chu: null,
//     height: height / metadata.height,
//     width: width / metadata.width,
//     x: x / metadata.width,
//     y: y / metadata.height,
//     from_ai: true,
//   };
// }

// const Joi = require('joi');

// const objSchema = Joi.object({});

// export async function create(data) {
//   const { error, value } = validate(data);
//   if (error) throw error;
//   return ANH_VI_TRI.create(value);
// }

// export function getAll(query) {
//   return ANH_VI_TRI.find(query).lean();
// }

// export async function updateAll(chitietUpdate) {
//   for (const row of chitietUpdate) {
//     const { error, value } = validate(row);
//     if (error) throw error;
//     await ANH_VI_TRI.findByIdAndUpdate(value._id, value);
//   }
// }

// export const validate = (data, method) => {
//   return ValidatorHelper.validate(objSchema, data, method);
// };
