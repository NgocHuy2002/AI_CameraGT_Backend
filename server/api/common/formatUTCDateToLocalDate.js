import momentTimezone from 'moment-timezone';

export function formatDateTime(date) {
  return date ? momentTimezone(date).tz('Etc/GMT-7').format('DD/MM/YYYY HH:mm') : '';
}

export function formatTimeDate(date) {
  return date ? momentTimezone(date).tz('Etc/GMT-7').format('HH:mm DD/MM/YYYY') : '';
}

export function formatDate(date) {
  return date ? momentTimezone(date).tz('Etc/GMT-7').format('DD/MM/YYYY') : '';
}

export function formatToDateDetail(date) {
  return {
    ngay: date ? momentTimezone(date).tz('Etc/GMT-7').format('DD') : '',
    thang: date ? momentTimezone(date).tz('Etc/GMT-7').format('MM') : '',
    nam: date ? momentTimezone(date).tz('Etc/GMT-7').format('YYYY') : '',
    gio: date ? momentTimezone(date).tz('Etc/GMT-7').format('HH') : '',
    phut: date ? momentTimezone(date).tz('Etc/GMT-7').format('mm') : '',
    date: date ? momentTimezone(date).tz('Etc/GMT-7').format('DD/MM/YYYY') : '',
    time: date ? momentTimezone(date).tz('Etc/GMT-7').format('HH giờ mm') : '',
  };
}

