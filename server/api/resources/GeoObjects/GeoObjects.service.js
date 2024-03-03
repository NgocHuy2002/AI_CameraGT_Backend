import { POINT } from './GeoObjects.constants';

export function convertToPointObject(longitude, latitude) {
  if(!longitude || !latitude) return undefined
  return {
    type: POINT,
    coordinates: [
      longitude,
      latitude,
    ],
  };
}
