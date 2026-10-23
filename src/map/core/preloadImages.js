import { grey } from '@mui/material/colors';
import { createTheme } from '@mui/material';
import { loadImage, prepareIcon, prepareVehicleIcon } from './mapUtil';

import directionSvg from '../../resources/images/direction.svg';
import backgroundSvg from '../../resources/images/background.svg';
import startSvg from '@material-symbols/svg-600/outlined/play_circle.svg';
import finishSvg from '@material-symbols/svg-600/outlined/stop_circle.svg';
import personSvg from '@material-symbols/svg-600/outlined/person.svg';

import warningSvg from '@material-symbols/svg-600/outlined/warning.svg';
import taskAltSvg from '@material-symbols/svg-600/outlined/task_alt.svg';
import arrowCircleDownSvg from '@material-symbols/svg-600/outlined/arrow_circle_down.svg';
import arrowCircleUpSvg from '@material-symbols/svg-600/outlined/arrow_circle_up.svg';
import bedtimeSvg from '@material-symbols/svg-600/outlined/bedtime.svg';
import cloudOffSvg from '@material-symbols/svg-600/outlined/cloud_off.svg';
import cloudDoneSvg from '@material-symbols/svg-600/outlined/cloud_done.svg';
import speedSvg from '@material-symbols/svg-600/outlined/speed.svg';
import cloudAlertSvg from '@material-symbols/svg-600/outlined/cloud_alert.svg';
import distanceSvg from '@material-symbols/svg-600/outlined/distance.svg';
import powerOffSvg from '@material-symbols/svg-600/outlined/power_off.svg';
import powerSvg from '@material-symbols/svg-600/outlined/power.svg';
import buildSvg from '@material-symbols/svg-600/outlined/build.svg';
import imageSvg from '@material-symbols/svg-600/outlined/image.svg';
import connectWithoutContactSvg from '@material-symbols/svg-600/outlined/connect_without_contact.svg';
import smsSvg from '@material-symbols/svg-600/outlined/sms.svg';

import vehicle1 from '../../resources/images/vehicles/1.png';
import vehicle2 from '../../resources/images/vehicles/2.png';
import vehicle3 from '../../resources/images/vehicles/3.png';
import vehicle4 from '../../resources/images/vehicles/4.png';
import vehicle5 from '../../resources/images/vehicles/5.png';
import vehicle6 from '../../resources/images/vehicles/6.png';
import vehicle7 from '../../resources/images/vehicles/7.png';
import vehicle8 from '../../resources/images/vehicles/8.png';
import vehicle9 from '../../resources/images/vehicles/9.png';
import vehicle10 from '../../resources/images/vehicles/10.png';
import vehicle11 from '../../resources/images/vehicles/11.png';
import vehicle12 from '../../resources/images/vehicles/12.png';
import vehicle13 from '../../resources/images/vehicles/13.png';
import vehicle14 from '../../resources/images/vehicles/14.png';
import vehicle15 from '../../resources/images/vehicles/15.png';
import vehicle16 from '../../resources/images/vehicles/16.png';
import vehicle18 from '../../resources/images/vehicles/18.png';
import vehicle19 from '../../resources/images/vehicles/19.png';
import vehicle20 from '../../resources/images/vehicles/20.png';

// Mirrors the VehicleType.path mapping from the mobile app's vehicle icon set
// (assets/cars/<n>.png), including its reuse of the same picture for several
// categories (e.g. bicycle/scooter share one icon, tram/bike share another).
const vehicleIconByNumber = {
  1: vehicle1,
  2: vehicle2,
  3: vehicle3,
  4: vehicle4,
  5: vehicle5,
  6: vehicle6,
  7: vehicle7,
  8: vehicle8,
  9: vehicle9,
  10: vehicle10,
  11: vehicle11,
  12: vehicle12,
  13: vehicle13,
  14: vehicle14,
  15: vehicle15,
  16: vehicle16,
  18: vehicle18,
  19: vehicle19,
  20: vehicle20,
};

const vehicleCategoryNumber = {
  default: 1,
  van: 1,
  bicycle: 2,
  scooter: 2,
  animal: 3,
  boat: 4,
  bus: 5,
  car: 6,
  crane: 7,
  helicopter: 8,
  motorcycle: 9,
  offroad: 10,
  person: 11,
  pickup: 12,
  ship: 13,
  plane: 14,
  tractor: 15,
  train: 16,
  tram: 18,
  bike: 18,
  trolleybus: 19,
  truck: 20,
  // Not present in the mobile app's VehicleType enum; fall back to default.
  camper: 1,
  trailer: 1,
};

export const vehicleIcons = Object.fromEntries(
  Object.entries(vehicleCategoryNumber).map(([category, number]) => [
    category,
    vehicleIconByNumber[number],
  ]),
);

export const mapIcons = {
  ...vehicleIcons,
  start: startSvg,
  finish: finishSvg,
};

export const mapIconKey = (category) => (mapIcons.hasOwnProperty(category) ? category : 'default');

export const eventIcons = {
  alarm: warningSvg,
  commandResult: taskAltSvg,
  deviceFuelDrop: arrowCircleDownSvg,
  deviceFuelIncrease: arrowCircleUpSvg,
  deviceInactive: bedtimeSvg,
  deviceMoving: startSvg,
  deviceOffline: cloudOffSvg,
  deviceOnline: cloudDoneSvg,
  deviceOverspeed: speedSvg,
  deviceStopped: finishSvg,
  deviceUnknown: cloudAlertSvg,
  driverChanged: personSvg,
  geofenceCrossed: distanceSvg,
  geofenceEnter: distanceSvg,
  geofenceExit: distanceSvg,
  ignitionOff: powerOffSvg,
  ignitionOn: powerSvg,
  maintenance: buildSvg,
  media: imageSvg,
  proximityEnter: connectWithoutContactSvg,
  proximityExit: connectWithoutContactSvg,
  queuedCommandSent: taskAltSvg,
  textMessage: smsSvg,
  unaccompaniedMotion: connectWithoutContactSvg,
};

export const eventIconKey = (type) => (eventIcons.hasOwnProperty(type) ? type : 'alarm');

export const mapImages = {};

const theme = createTheme({
  palette: {
    neutral: { main: grey[500] },
  },
});

export default async () => {
  const background = await loadImage(backgroundSvg);
  mapImages.background = await prepareIcon(background);
  mapImages.direction = await prepareIcon(await loadImage(directionSvg));
  await Promise.all(
    Object.keys(vehicleIcons).map(async (key) => {
      const icon = await loadImage(vehicleIcons[key]);
      const prepared = prepareVehicleIcon(icon);
      ['info', 'success', 'error', 'neutral'].forEach((color) => {
        mapImages[`${key}-${color}`] = prepared;
      });
    }),
  );
  await Promise.all(
    ['start', 'finish'].map(async (key) => {
      const icon = await loadImage(mapIcons[key]);
      await Promise.all(
        ['info', 'success', 'error', 'neutral'].map(async (color) => {
          mapImages[`${key}-${color}`] = prepareIcon(background, icon, theme.palette[color].main);
        }),
      );
    }),
  );
  await Promise.all(
    Object.keys(eventIcons).map((key) =>
      loadImage(eventIcons[key]).then((icon) => {
        mapImages[key] = prepareIcon(background, icon, theme.palette.neutral.main);
      }),
    ),
  );
};
