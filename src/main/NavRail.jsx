import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Badge } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { sessionActions } from '../store';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useRestriction } from '../common/util/permissions';
import { nativePostMessage } from '../common/components/NativeInterface';
import LogoImage from '../login/LogoImage';
import MapPinIcon from '../resources/images/nav/map-pin.svg?react';
import WebcamIcon from '../resources/images/nav/webcam.svg?react';
import ChartLineUpIcon from '../resources/images/nav/chart-line-up.svg?react';
import GearSixIcon from '../resources/images/nav/gear-six.svg?react';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
    padding: theme.spacing(2, 2.5),
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    boxShadow: '4px 0px 12px rgba(0, 0, 0, 0.08)',
  },
  top: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(3),
  },
  logo: {
    maxWidth: '48px',
    maxHeight: '48px',
    margin: 0,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    width: '100%',
  },
  bottom: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    width: '100%',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    height: 56,
    width: '100%',
    padding: theme.spacing(0, 2),
    borderRadius: theme.shape.borderRadius,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  itemActive: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
    },
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
  },
  icon: {
    flexShrink: 0,
  },
}));

const NavRail = () => {
  const { classes, cx } = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');
  const disableReports = useRestriction('disableReports');
  const devices = useSelector((state) => state.devices.items);
  const user = useSelector((state) => state.session.user);
  const socket = useSelector((state) => state.session.socket);
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const deviceIdOrSingle = () => {
    if (selectedDeviceId != null) {
      return selectedDeviceId;
    }
    const deviceIds = Object.keys(devices);
    return deviceIds.length === 1 ? deviceIds[0] : null;
  };

  const handleVideo = () => {
    const id = deviceIdOrSingle();
    navigate(id != null ? `/stream?deviceId=${id}` : '/stream');
  };

  const handleReports = () => {
    const id = deviceIdOrSingle();
    navigate(id != null ? `/reports/combined?deviceId=${id}` : '/reports/combined');
  };

  const handleLogout = async () => {
    const notificationToken = window.localStorage.getItem('notificationToken');
    if (notificationToken && !user.readonly) {
      window.localStorage.removeItem('notificationToken');
      const tokens = user.attributes.notificationTokens?.split(',') || [];
      if (tokens.includes(notificationToken)) {
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens:
              tokens.length > 1
                ? tokens.filter((it) => it !== notificationToken).join(',')
                : undefined,
          },
        };
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });
      }
    }

    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    navigate('/login');
    dispatch(sessionActions.updateUser(null));
  };

  const active = (test) => (test ? classes.itemActive : undefined);

  return (
    <div className={classes.root}>
      <div className={classes.top}>
        <LogoImage className={classes.logo} />
        <div className={classes.nav}>
          <button
            type="button"
            className={cx(classes.item, active(location.pathname === '/'))}
            onClick={() => navigate('/')}
          >
            <Badge color="error" variant="dot" overlap="circular" invisible={socket !== false}>
              <MapPinIcon className={classes.icon} />
            </Badge>
            <Typography className={classes.label}>{t('monitorTitle')}</Typography>
          </button>
          <button
            type="button"
            className={cx(classes.item, active(location.pathname.startsWith('/stream')))}
            onClick={handleVideo}
          >
            <WebcamIcon className={classes.icon} />
            <Typography className={classes.label}>{t('positionVideo')}</Typography>
          </button>
          {!disableReports && (
            <button
              type="button"
              className={cx(classes.item, active(location.pathname.startsWith('/reports')))}
              onClick={handleReports}
            >
              <ChartLineUpIcon className={classes.icon} />
              <Typography className={classes.label}>{t('reportTitle')}</Typography>
            </button>
          )}
        </div>
      </div>
      <div className={classes.bottom}>
        {!readonly && (
          <button
            type="button"
            className={cx(classes.item, active(location.pathname.startsWith('/settings')))}
            onClick={() => navigate('/settings/preferences?menu=true')}
          >
            <GearSixIcon className={classes.icon} />
            <Typography className={classes.label}>{t('settingsTitle')}</Typography>
          </button>
        )}
        <button type="button" className={classes.item} onClick={handleLogout}>
          <ExitToAppIcon className={classes.icon} />
          <Typography className={classes.label}>{t('loginLogout')}</Typography>
        </button>
      </div>
    </div>
  );
};

export default NavRail;
