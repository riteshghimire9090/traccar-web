import { useEffect } from 'react';
import { map } from './core/MapView';
import { toMapCoordinates } from './core/mapUtil';

const MapFollowCamera = ({ latitude, longitude }) => {
  useEffect(() => {
    if (latitude != null && longitude != null) {
      map.panTo(toMapCoordinates(longitude, latitude), { duration: 300 });
    }
  }, [latitude, longitude]);

  return null;
};

export default MapFollowCamera;
