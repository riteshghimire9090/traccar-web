import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import { Typography, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RouteIcon from '@mui/icons-material/Route';
import ExploreIcon from '@mui/icons-material/Explore';
import WifiIcon from '@mui/icons-material/Wifi';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useTranslation } from './LocalizationProvider';
import DeviceManageDialog from './DeviceManageDialog';
import PositionValue from './PositionValue';
import { useRestriction } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';
import { formatSpeed, formatStatus, getStatusColor } from '../util/formatter';
import fetchOrThrow from '../util/fetchOrThrow';

import CloseIcon from '../../resources/images/nav/close-x2.svg?react';
import ListBulletsIcon from '../../resources/images/nav/list-bullets.svg?react';
import NavigationArrowIcon from '../../resources/images/nav/navigation-arrow.svg?react';
import CodeBlockIcon from '../../resources/images/nav/code-block.svg?react';
import FenceIcon from '../../resources/images/nav/fence.svg?react';
import SpeedometerIcon from '../../resources/images/nav/speedometer.svg?react';
import BatteryHighIcon from '../../resources/images/nav/battery-high.svg?react';
import LightningIcon from '../../resources/images/nav/lightning.svg?react';
import PlayCircleIcon from '../../resources/images/nav/play-circle.svg?react';
import ChartBarIcon from '../../resources/images/nav/chart-bar.svg?react';
import PersonArmsSpreadIcon from '../../resources/images/nav/person-arms-spread.svg?react';
import ShareNetworkIcon from '../../resources/images/nav/share-network.svg?react';

dayjs.extend(relativeTime);

const attributeIcons = {
  speed: SpeedometerIcon,
  obdSpeed: SpeedometerIcon,
  totalDistance: RouteIcon,
  distance: RouteIcon,
  hours: RouteIcon,
  odometer: RouteIcon,
  course: ExploreIcon,
  ignition: VpnKeyIcon,
  batteryLevel: BatteryHighIcon,
  battery: LightningIcon,
  power: LightningIcon,
  network: WifiIcon,
};

const useStyles = makeStyles()((theme, { desktopPadding }) => ({
  card: {
    pointerEvents: 'auto',
    width: 420,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(3),
    borderRadius: 20,
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0px 0px 1px 0px rgba(0,0,0,0.12), 0px 2px 2px 0px rgba(0,0,0,0.08)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    cursor: 'move',
  },
  headerStart: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    minWidth: 0,
  },
  name: {
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  badge: {
    flexShrink: 0,
    padding: theme.spacing(0.5, 1),
    borderRadius: 3,
    fontSize: 14,
  },
  success: {
    backgroundColor: '#acffcf',
    color: theme.palette.success.dark,
  },
  error: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  },
  neutral: {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.secondary,
  },
  location: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    padding: theme.spacing(1),
    borderRadius: 6,
    backgroundColor: '#f5f5f7',
  },
  locationHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationLabel: {
    fontWeight: 500,
    fontSize: 14,
  },
  updated: {
    fontSize: 14,
    color: theme.palette.info.main,
  },
  address: {
    fontSize: 16,
    color: theme.palette.text.primary,
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  chip: {
    flex: '1 1 40%',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: 6,
    backgroundColor: '#f5f5f7',
    minWidth: 0,
  },
  chipIcon: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
  },
  chipIconTrue: {
    color: theme.palette.success.main,
  },
  chipIconFalse: {
    color: theme.palette.error.main,
  },
  chipText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  chipLabel: {
    fontSize: 11,
    lineHeight: 1.3,
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chipValue: {
    fontSize: 14,
    lineHeight: 1.3,
    color: theme.palette.text.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    gap: theme.spacing(0.75),
    padding: theme.spacing(0.5),
    borderRadius: 8,
    backgroundColor: theme.palette.primary.main,
  },
  action: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    color: theme.palette.common.white,
    '&:disabled': {
      opacity: 0.4,
      cursor: 'default',
    },
  },
  actionPrimary: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.primary.main,
  },
  root: {
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    [theme.breakpoints.up('md')]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(3)} + ${theme.dimensions.bottomBarHeight}px)`,
    },
    transform: 'translateX(-50%)',
  },
}));

const StatusCard = ({ deviceId, position, onClose, disableActions, desktopPadding = 0 }) => {
  const { classes, cx } = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const t = useTranslation();

  const readonly = useRestriction('readonly');

  const shareDisabled = useSelector((state) => state.session.server.attributes.disableShare);
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[deviceId]);

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference(
    'positionItems',
    'fixTime,speed,totalDistance,course,ignition,batteryLevel,network',
  );
  const speedUnit = useAttributePreference('speedUnit');

  const navigationAppLink = useAttributePreference('navigationAppLink');
  const navigationAppTitle = useAttributePreference('navigationAppTitle');

  const [mapsAnchorEl, setMapsAnchorEl] = useState(null);
  const [manageOpen, setManageOpen] = useState(false);

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t('sharedGeofence'),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetchOrThrow('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    const item = await response.json();
    await fetchOrThrow('/api/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: position.deviceId, geofenceId: item.id }),
    });
    navigate(`/settings/geofence/${item.id}`);
  }, [navigate, position, t]);

  const badge = () => {
    if (!device) return null;
    if (device.status !== 'online') {
      return { text: formatStatus(device.status, t), color: getStatusColor(device.status) };
    }
    if (position?.attributes?.motion) {
      return {
        text: `${t('statusMoving')} (${formatSpeed(position.speed, speedUnit, t)})`,
        color: 'success',
      };
    }
    return { text: t('statusStopped'), color: 'neutral' };
  };
  const statusBadge = badge();

  const otherItems = position
    ? positionItems
        .split(',')
        .filter((key) => key !== 'address')
        .filter((key) => position.hasOwnProperty(key) || position.attributes.hasOwnProperty(key))
    : [];

  return (
    <>
      <div className={classes.root}>
        {device && (
          <Rnd
            default={{ x: 0, y: 0, width: 'auto', height: 'auto' }}
            enableResizing={false}
            dragHandleClassName="draggable-header"
            style={{ position: 'relative' }}
          >
            <div className={classes.card}>
              <div className={cx('draggable-header', classes.header)}>
                <div className={classes.headerStart}>
                  <Typography className={classes.name}>{device.name}</Typography>
                  {statusBadge && (
                    <Typography
                      component="span"
                      className={cx(classes.badge, classes[statusBadge.color])}
                    >
                      {statusBadge.text}
                    </Typography>
                  )}
                </div>
                <IconButton size="small" onClick={onClose} onTouchStart={onClose}>
                  <CloseIcon width={20} height={20} />
                </IconButton>
              </div>
              {position && (
                <>
                  <div className={classes.location}>
                    <div className={classes.locationHeader}>
                      <Typography className={classes.locationLabel}>
                        {t('mapCurrentLocation')}
                      </Typography>
                      <Typography className={classes.updated}>
                        {dayjs(position.fixTime).fromNow()}
                      </Typography>
                    </div>
                    <Typography className={classes.address}>
                      <PositionValue position={position} property="address" />
                    </Typography>
                  </div>
                  {otherItems.length > 0 && (
                    <div className={classes.grid}>
                      {otherItems.map((key) => {
                        const Icon = attributeIcons[key] || AccessTimeIcon;
                        const rawValue = position.hasOwnProperty(key)
                          ? position[key]
                          : position.attributes[key];
                        const boolColor =
                          typeof rawValue === 'boolean'
                            ? rawValue
                              ? classes.chipIconTrue
                              : classes.chipIconFalse
                            : null;
                        return (
                          <div key={key} className={classes.chip}>
                            <Icon
                              className={cx(classes.chipIcon, boolColor)}
                              width={16}
                              height={16}
                            />
                            <div className={classes.chipText}>
                              <span className={classes.chipLabel}>
                                {positionAttributes[key]?.name || key}
                              </span>
                              <span className={classes.chipValue}>
                                <PositionValue
                                  position={position}
                                  property={position.hasOwnProperty(key) ? key : null}
                                  attribute={position.hasOwnProperty(key) ? null : key}
                                />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
              <div className={classes.actions}>
                <Tooltip title={t('sharedShowDetails')}>
                  <button
                    type="button"
                    className={cx(classes.action, classes.actionPrimary)}
                    onClick={() => navigate(`/position/${position.id}`)}
                    disabled={!position}
                  >
                    <ListBulletsIcon width={18} height={18} />
                  </button>
                </Tooltip>
                <Tooltip title={t('sharedCreateGeofence')}>
                  <button
                    type="button"
                    className={classes.action}
                    onClick={handleGeofence}
                    disabled={disableActions || !position || readonly}
                  >
                    <FenceIcon width={16} height={16} />
                  </button>
                </Tooltip>
                <Tooltip title={t('linkLiveVideo')}>
                  <button
                    type="button"
                    className={classes.action}
                    onClick={() => navigate(`/stream?deviceId=${deviceId}`)}
                    disabled={disableActions || !position || position.protocol !== 'jt808'}
                  >
                    <PlayCircleIcon width={18} height={18} />
                  </button>
                </Tooltip>
                <Tooltip title={t('commandTitle')}>
                  <button
                    type="button"
                    className={classes.action}
                    onClick={() => navigate(`/settings/device/${deviceId}/command`)}
                    disabled={disableActions}
                  >
                    <CodeBlockIcon width={18} height={18} />
                  </button>
                </Tooltip>
                <Tooltip title={t('reportReplay')}>
                  <button
                    type="button"
                    className={classes.action}
                    onClick={() => navigate(`/replay?deviceId=${deviceId}`)}
                    disabled={disableActions || !position}
                  >
                    <ChartBarIcon width={18} height={18} />
                  </button>
                </Tooltip>
                <Tooltip title={t('sharedExtra')}>
                  <button
                    type="button"
                    className={classes.action}
                    onClick={(e) => setMapsAnchorEl(e.currentTarget)}
                    disabled={!position}
                  >
                    <NavigationArrowIcon width={18} height={18} />
                  </button>
                </Tooltip>
                <Tooltip title={t('sharedShare')}>
                  <button
                    type="button"
                    className={classes.action}
                    onClick={() => navigate(`/settings/device/${deviceId}/share`)}
                    disabled={disableActions || shareDisabled || user.temporary}
                  >
                    <ShareNetworkIcon width={18} height={18} />
                  </button>
                </Tooltip>
                <Tooltip title={t('sharedManage')}>
                  <button
                    type="button"
                    className={classes.action}
                    onClick={() => setManageOpen(true)}
                    disabled={disableActions}
                  >
                    <PersonArmsSpreadIcon width={18} height={18} />
                  </button>
                </Tooltip>
              </div>
            </div>
          </Rnd>
        )}
      </div>
      {position && (
        <Menu
          anchorEl={mapsAnchorEl}
          open={Boolean(mapsAnchorEl)}
          onClose={() => setMapsAnchorEl(null)}
        >
          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}
          >
            {t('linkGoogleMaps')}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://maps.apple.com/?ll=${position.latitude},${position.longitude}`}
          >
            {t('linkAppleMaps')}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}
          >
            {t('linkStreetView')}
          </MenuItem>
          {navigationAppTitle && navigationAppLink && (
            <MenuItem
              component="a"
              target="_blank"
              href={navigationAppLink
                .replace('{latitude}', position.latitude)
                .replace('{longitude}', position.longitude)}
            >
              {navigationAppTitle}
            </MenuItem>
          )}
        </Menu>
      )}
      <DeviceManageDialog
        open={manageOpen}
        deviceId={deviceId}
        onClose={() => setManageOpen(false)}
      />
    </>
  );
};

export default StatusCard;
