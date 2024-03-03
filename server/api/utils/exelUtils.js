import * as XLSX from 'xlsx';

export default {
  transformFile: async (filePath) => {
    let rowObj = [];
    let sheetData = [];
    const wb = XLSX.readFile(filePath, { cellDates: true, raw: true});
    wb.SheetNames.forEach(function(sheetName) {
      let sheet = {
        name: sheetName,
        rows: XLSX.utils.sheet_to_json(wb.Sheets[sheetName]),
      };
      sheetData.push(sheet);
    });
    return sheetData;
  },
};
