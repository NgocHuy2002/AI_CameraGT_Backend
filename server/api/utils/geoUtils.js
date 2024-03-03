function getEquationLine(a1, b1, c1, a2, b2, c2) {
  if (a1 === a2) {
    return { a: a1, b: 0 };
  }
  let d = a1 * b2 - a2 * b1;
  let dx = c1 * b2 - c2 * b1;
  let dy = a1 * c2 - a2 * c1;

  if (d !== 0) {
    let a = parseFloat(dx / d);
    let b = parseFloat(dy / d);
    return { a, b };
  }

  return null;
}

function getPerpendicularLine(line, point) {
  if (line.a === 0) {
    return { a: point.longitude, b: 0 };
  }
  if (line.b === 0) {
    return { a: 0, b: point.latitude };
  }
  let a = line.a ? -1 / line.a : 0;
  let b = point.latitude - a * point.longitude;
  return { a, b };
}

function solveEquation(x, y, z) {
  let x1, x2;
  let delta = (y * y - 4 * x * z);
  if (delta === 0) {
    x1 = -y / (2 * x);
    x2 = -y / (2 * x);
  } else if (delta > 0) {
    x1 = (-y - Math.sqrt(delta)) / (2 * x);
    x2 = (-y + Math.sqrt(delta)) / (2 * x);
  }

  return { x1, x2 };
}


function twoPoint(point, perpendicular, range) {
  if (perpendicular.a === 0) {
    return [
      { longitude: point.longitude - range, latitude: point.latitude },
      { longitude: point.longitude + range, latitude: point.latitude },
    ];
  } else if (perpendicular.b === 0) {
    return [
      { longitude: point.longitude, latitude: point.latitude - range },
      { longitude: point.longitude, latitude: point.latitude + range },
    ];
  }

  let a = (perpendicular.a * perpendicular.a) + 1;
  let b = 2 * (perpendicular.a * (perpendicular.b - point.latitude) - point.longitude);
  let c = point.longitude * point.longitude + (perpendicular.b - point.latitude) * (perpendicular.b - point.latitude) - (range * range);
  let X = solveEquation(a, b, c);
  let { x1, x2 } = X;
  let y1 = perpendicular.a * x1 + perpendicular.b;
  let y2 = perpendicular.a * x2 + perpendicular.b;
  return [{ longitude: x1, latitude: y1 }, { longitude: x2, latitude: y2 }];
}


function checkPointInsideObject(point, polygon) {
  let polygon1 = [polygon[0], polygon[1], polygon[2], polygon[3]];
  let polygon2 = [polygon[0], polygon[1], polygon[3], polygon[2]];
  let x = point.longitude, y = point.latitude;
  let inside1 = false, inside2 = false;
  for (let i = 0, j = polygon1.length - 1; i < polygon1.length; j = i++) {
    let xi = polygon1[i].longitude, yi = polygon1[i].latitude;
    let xj = polygon1[j].longitude, yj = polygon1[j].latitude;
    let intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside1 = !inside1;
  }

  for (let i = 0, j = polygon2.length - 1; i < polygon2.length; j = i++) {
    let xi = polygon2[i].longitude, yi = polygon2[i].latitude;
    let xj = polygon2[j].longitude, yj = polygon2[j].latitude;
    let intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside2 = !inside2;
  }
  return inside1 || inside2;
}

function findFourPoint(stationA, stationB, ranger = 1) {
  const equationLine = getEquationLine(
    stationA.longitude, 1, stationA.latitude,
    stationB.longitude, 1, stationB.latitude);
  const perpendicular1 = getPerpendicularLine(equationLine, stationA);
  const perpendicular2 = getPerpendicularLine(equationLine, stationB);

  const twoPointStationA = twoPoint(stationA, perpendicular1, ranger);
  const twoPointStationB = twoPoint(stationB, perpendicular2, ranger);
  return [...twoPointStationA, ...twoPointStationB];
}

export function findPositionOfPhoto(corridor, photo, ranger = 0.0007) {

  const stationA = corridor.nodes[0];
  const stationB = corridor.nodes[1];

  const polygon = findFourPoint(stationA, stationB, ranger);

  const fourPointStationA = findFourPoint(polygon[0], polygon[1], 0.0003);
  const fourPointStationB = findFourPoint(polygon[2], polygon[3], 0.0003);

  const insideAB = checkPointInsideObject(photo, polygon);
  const insideA = checkPointInsideObject(photo, fourPointStationA);
  const insideB = checkPointInsideObject(photo, fourPointStationB);

  if (insideA) {
    return stationA;
  } else if (insideB) {
    return stationB;
  } else if (insideAB) {
    return corridor;
  }

  return null;
}

export function findCorridorOfPhoto(corridor, photo, ranger = 0.0007) {
  // ranger = 0.0007 : 71.5m - 77.8m
  // ranger = 0.00045 : 45.9m - 50m
  // ranger = 0.00061 : 60m - 65m
  if (!corridor.nodes || !corridor.nodes[0] || !corridor.nodes[1]) return null;

  const stationA = corridor.nodes[0];
  const stationB = corridor.nodes[1];

  const polygon = findFourPoint(stationA, stationB, ranger);
  const insideAB = checkPointInsideObject(photo, polygon);

  if (insideAB) {
    return corridor;
  }

  return null;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export function getDistanceFromLatLonInM(point1, point2) {
  let R = 6371; // Radius of the earth in km
  let dLat = deg2rad(point2.latitude - point1.latitude); // deg2rad below
  let dLon = deg2rad(point2.longitude - point1.longitude);
  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.latitude)) * Math.cos(deg2rad(point2.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c * 1000; // Distance in km
  return d.toFixed(3);
}

export function findViTriOfPhoto(viTri, photo, ranger = 50) {
  return getDistanceFromLatLonInM(viTri, photo) <= ranger;
}



