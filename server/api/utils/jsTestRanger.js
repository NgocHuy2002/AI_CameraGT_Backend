function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  let R = 6371; // Radius of the earth in km
  let dLat = deg2rad(lat2 - lat1);  // deg2rad below
  let dLon = deg2rad(lon2 - lon1);
  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c; // Distance in km
  return d * 1000; // Distance in m
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

const ranger = 0.00045

// Điểm cực Bắc
const lat1 = 23.3891916
const lng1 = 105.3209159

// Điểm cực Nam
const lat2 = 8.6052448
const lng2 = 104.7389269

const a = getDistanceFromLatLonInKm(lat1, lng1, lat1 + ranger, lng1)
const b = getDistanceFromLatLonInKm(lat2, lng2, lat2 + ranger, lng2)
const c = getDistanceFromLatLonInKm(lat1, lng1, lat1, lng1 + ranger)
const d = getDistanceFromLatLonInKm(lat2, lng2, lat2, lng2 + ranger)
console.log('a', a);
console.log('b', b);
console.log('c', c);
console.log('d', d);
