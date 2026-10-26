import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  IconButton,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Menu,
  MenuItem,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Checkbox,
  Switch,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PublicIcon from '@mui/icons-material/Public';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from './LocalizationProvider';
import FileInput from './FileInput';
import RemoveDialog from './RemoveDialog';
import QrCodeDialog from './QrCodeDialog';
import SelectField from './SelectField';
import { useDeviceReadonly, useManager } from '../util/permissions';
import useFeatures from '../util/useFeatures';
import useAttributeUnits from '../util/useAttributeUnits';
import { attributeFromRaw, attributeToRaw, attributeUnitString } from '../util/attributeUnits';
import useDeviceAttributes from '../attributes/useDeviceAttributes';
import useCommonDeviceAttributes from '../attributes/useCommonDeviceAttributes';
import deviceCategories from '../util/deviceCategories';
import { mapIcons, mapIconKey } from '../../map/core/preloadImages';
import { prefixString } from '../util/stringUtils';
import { devicesActions } from '../../store';
import { useAsyncTask, useCatch } from '../../reactHelper';
import fetchOrThrow from '../util/fetchOrThrow';

const DeviceAnalyticsPanel = lazy(() => import('./DeviceAnalyticsPanel'));

const useStyles = makeStyles()((theme) => ({
  paper: {
    width: '90vw',
    maxWidth: '90vw',
    height: '85vh',
    maxHeight: '85vh',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    paddingInline: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
  },
  tabs: {
    minHeight: 52,
    flex: 1,
    minWidth: 0,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    flexShrink: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    padding: theme.spacing(3),
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  placeholder: {
    padding: theme.spacing(6, 2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    cursor: 'default',
  },
  sectionHeaderClickable: {
    cursor: 'pointer',
    userSelect: 'none',
  },
  sectionTitle: {
    fontWeight: 600,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    columnGap: theme.spacing(4),
    rowGap: theme.spacing(2.5),
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },
  checkboxRow: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: theme.spacing(4),
    rowGap: theme.spacing(0.5),
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
    minWidth: 0,
  },
  fieldSpan: {
    gridColumn: '1 / -1',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 600,
  },
  required: {
    color: theme.palette.error.main,
  },
  helpText: {
    fontSize: 12,
    color: theme.palette.warning.dark,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2, 3),
    borderTop: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
  },
  expandIcon: {
    transition: 'transform 0.2s',
  },
  expandIconOpen: {
    transform: 'rotate(180deg)',
  },
  alertRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    minWidth: 0,
  },
  alertLabel: {
    fontSize: 14,
    fontWeight: 600,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  alertControls: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    flexShrink: 0,
  },
  alertValue: {
    width: 110,
  },
  tableWrap: {
    overflowX: 'auto',
  },
  typeCell: {
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  channelCell: {
    textAlign: 'center',
  },
  channelHeadCell: {
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
}));

const tabKeys = [
  'deviceManageDetails',
  'deviceCommand',
  'deviceManageAlertSetting',
  'deviceManageAnalytics',
  'deviceManageCustomizedReminders',
  'deviceManageScheduledTaskSetting',
];

const Field = ({ classes, label, required, span, children }) => (
  <div className={`${classes.field} ${span ? classes.fieldSpan : ''}`}>
    <Typography className={classes.fieldLabel}>
      {label}
      {required && <span className={classes.required}> *</span>}
    </Typography>
    {children}
  </div>
);

const AlertRow = ({ classes, label, tooltip, checked, onChange, disabled, extra }) => (
  <div className={classes.alertRow}>
    <Typography className={classes.alertLabel}>{label}</Typography>
    <div className={classes.alertControls}>
      <Switch
        size="small"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {tooltip && (
        <Tooltip title={tooltip}>
          <InfoIcon fontSize="small" color="action" />
        </Tooltip>
      )}
      {extra}
    </div>
  </div>
);

const DeviceManageDialog = ({ open, deviceId, onClose }) => {
  const { classes, cx } = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const manager = useManager();
  const deviceReadonly = useDeviceReadonly();
  const features = useFeatures();
  const units = useAttributeUnits();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const deviceAttributeDefs = useDeviceAttributes(t);
  const attributeDefinitions = useMemo(
    () => ({ ...commonDeviceAttributes, ...deviceAttributeDefs }),
    [commonDeviceAttributes, deviceAttributeDefs],
  );
  const attributeKeys = Object.keys(attributeDefinitions);
  const otherAttributeKeys = attributeKeys.filter(
    (key) => attributeDefinitions[key].type !== 'boolean',
  );
  const booleanAttributeKeys = attributeKeys.filter(
    (key) => attributeDefinitions[key].type === 'boolean',
  );

  const device = useSelector((state) => state.devices.items[deviceId]);

  const [tab, setTab] = useState(0);
  const [item, setItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [iconAnchorEl, setIconAnchorEl] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [attributesExpanded, setAttributesExpanded] = useState(false);
  const [notifications, setNotifications] = useState(null);
  const [linkedNotifications, setLinkedNotifications] = useState(null);
  const [notificationTypes, setNotificationTypes] = useState(null);
  const [notificatorTypes, setNotificatorTypes] = useState(null);
  const [notificationsExpanded, setNotificationsExpanded] = useState(true);
  const [alertSaving, setAlertSaving] = useState(null);
  const notificationsFetchedRef = useRef(false);

  useEffect(() => {
    if (open && device) {
      setTab(0);
      setItem({ ...device, attributes: { ...device.attributes } });
      setImageFile(null);
      setShowQr(false);
      setAttributesExpanded(false);
      setNotifications(null);
      setLinkedNotifications(null);
      setNotificationTypes(null);
      setNotificatorTypes(null);
      setNotificationsExpanded(true);
      setAlertSaving(null);
      notificationsFetchedRef.current = false;
    }
    // Deliberately keyed on deviceId, not the live `device` object: the device record
    // updates on every position/status push, and resetting on each of those would wipe
    // in-progress edits and re-trigger the Alert Setting tab's data fetch repeatedly.
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [open, deviceId]);

  useAsyncTask(
    async ({ signal }) => {
      if (open && tab === 2 && item?.id && !notificationsFetchedRef.current) {
        notificationsFetchedRef.current = true;
        const [allResponse, linkedResponse, typesResponse, notificatorsResponse] =
          await Promise.all([
            fetchOrThrow('/api/notifications', { signal }),
            fetchOrThrow(`/api/notifications?deviceId=${item.id}`, { signal }),
            fetchOrThrow('/api/notifications/types', { signal }),
            fetchOrThrow('/api/notifications/notificators', { signal }),
          ]);
        setNotifications(await allResponse.json());
        setLinkedNotifications(await linkedResponse.json());
        setNotificationTypes(await typesResponse.json());
        setNotificatorTypes(await notificatorsResponse.json());
      }
    },
    [open, tab, item?.id],
  );

  const notificatorColumns = (notificatorTypes || []).filter((it) => it.type !== 'command');

  const notificationChannels = (type) => {
    const linked = (linkedNotifications || []).find((n) => n.type === type);
    return linked ? (linked.notificators || '').split(/[, ]+/).filter(Boolean) : [];
  };

  const setNotificationChannels = useCatch(async (type, channels) => {
    const savingKey = `type:${type}`;
    setAlertSaving(savingKey);
    const existingLinked = (linkedNotifications || []).find((n) => n.type === type);
    if (channels.length === 0) {
      if (existingLinked) {
        await fetchOrThrow('/api/permissions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: item.id, notificationId: existingLinked.id }),
        });
        setLinkedNotifications((prev) => (prev || []).filter((n) => n.id !== existingLinked.id));
      }
    } else {
      const notificatorsValue = channels.join(',');
      let target = (notifications || []).find(
        (n) => n.type === type && (n.notificators || '') === notificatorsValue,
      );
      if (!target) {
        const response = await fetchOrThrow('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            notificators: notificatorsValue,
            always: false,
            attributes: {},
          }),
        });
        target = await response.json();
        setNotifications((prev) => [...(prev || []), target]);
      }
      if (!existingLinked || existingLinked.id !== target.id) {
        if (existingLinked) {
          await fetchOrThrow('/api/permissions', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId: item.id, notificationId: existingLinked.id }),
          });
        }
        await fetchOrThrow('/api/permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: item.id, notificationId: target.id }),
        });
      }
      setLinkedNotifications((prev) => [...(prev || []).filter((n) => n.type !== type), target]);
    }
    setAlertSaving(null);
  });

  const alertDefinitions = useMemo(
    () => ({
      overspeed: {
        key: 'overspeed',
        label: t('deviceManageAlertOverspeed'),
        tooltip: t('eventDeviceOverspeed'),
        types: [{ type: 'deviceOverspeed' }],
      },
      offline: {
        key: 'offline',
        label: t('deviceManageAlertOfflineJudgment'),
        tooltip: t('eventDeviceOffline'),
        types: [{ type: 'deviceOffline' }],
      },
      inactive: {
        key: 'inactive',
        label: t('deviceManageAlertOffLine'),
        tooltip: t('eventDeviceInactive'),
        types: [{ type: 'deviceInactive' }],
      },
      restrictedDriving: {
        key: 'restrictedDriving',
        label: t('deviceManageAlertRestrictedDriving'),
        tooltip: t('eventGeofenceExit'),
        types: [{ type: 'geofenceExit' }],
      },
      acc: {
        key: 'acc',
        label: t('deviceManageAlertAcc'),
        tooltip: `${t('eventIgnitionOn')} / ${t('eventIgnitionOff')}`,
        types: [{ type: 'ignitionOn' }, { type: 'ignitionOff' }],
      },
      fatigueDriving: {
        key: 'fatigueDriving',
        label: t('deviceManageAlertFatigueDriving'),
        tooltip: t('alarmFatigueDriving'),
        types: [{ type: 'alarm', alarms: 'fatigueDriving' }],
      },
      idle: {
        key: 'idle',
        label: t('deviceManageAlertIdleSpeed'),
        tooltip: t('alarmIdle'),
        types: [{ type: 'alarm', alarms: 'idle' }],
      },
      lowPower: {
        key: 'lowPower',
        label: t('deviceManageAlertLowVoltage'),
        tooltip: t('alarmLowPower'),
        types: [{ type: 'alarm', alarms: 'lowPower' }],
      },
    }),
    [t],
  );
  const restAlertKeys = [
    'offline',
    'inactive',
    'restrictedDriving',
    'acc',
    'fatigueDriving',
    'idle',
    'lowPower',
  ];

  const matchesType = (notification, typeSpec) =>
    notification.type === typeSpec.type &&
    (!typeSpec.alarms || notification.attributes?.alarms === typeSpec.alarms);

  const isAlertEnabled = (definition) =>
    (linkedNotifications || []).some((notification) =>
      definition.types.some((typeSpec) => matchesType(notification, typeSpec)),
    );

  const toggleAlert = useCatch(async (definition, enabled) => {
    setAlertSaving(definition.key);
    if (enabled) {
      const linkedResults = await Promise.all(
        definition.types.map(async (typeSpec) => {
          let notification = (notifications || []).find((n) => matchesType(n, typeSpec));
          if (!notification) {
            const response = await fetchOrThrow('/api/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: typeSpec.type,
                attributes: typeSpec.alarms ? { alarms: typeSpec.alarms } : {},
                always: false,
                notificators: 'web',
              }),
            });
            notification = await response.json();
            setNotifications((prev) => [...(prev || []), notification]);
          }
          await fetchOrThrow('/api/permissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId: item.id, notificationId: notification.id }),
          });
          return notification;
        }),
      );
      setLinkedNotifications((prev) => [...(prev || []), ...linkedResults]);
    } else {
      const toUnlink = (linkedNotifications || []).filter((notification) =>
        definition.types.some((typeSpec) => matchesType(notification, typeSpec)),
      );
      await Promise.all(
        toUnlink.map((notification) =>
          fetchOrThrow('/api/permissions', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId: item.id, notificationId: notification.id }),
          }),
        ),
      );
      const toUnlinkIds = toUnlink.map((notification) => notification.id);
      setLinkedNotifications((prev) =>
        (prev || []).filter((notification) => !toUnlinkIds.includes(notification.id)),
      );
    }
    setAlertSaving(null);
  });

  const speedUnitLabel = attributeUnitString('speed', units, t);
  const speedLimitEnabled = item?.attributes.speedLimit != null;
  const speedLimitDisplay = item
    ? (attributeFromRaw(item.attributes.speedLimit, 'speed', units) ?? '')
    : '';

  const setAttribute = (key, value) => {
    setItem((prev) => ({ ...prev, attributes: { ...prev.attributes, [key]: value } }));
  };

  const attributeLabel = (key) => {
    const definition = attributeDefinitions[key];
    const unit = attributeUnitString(definition.dataType, units, t);
    return unit ? `${definition.name} (${unit})` : definition.name;
  };

  const valid = useMemo(
    () => Boolean(item && item.name && item.uniqueId && item.expirationTime),
    [item],
  );

  const handleFileInput = useCatch(async (newFile) => {
    setImageFile(newFile);
    if (newFile && item?.id) {
      const response = await fetchOrThrow(`/api/devices/${item.id}/image`, {
        method: 'POST',
        body: newFile,
      });
      setAttribute('deviceImage', await response.text());
    } else if (!newFile) {
      setAttribute('deviceImage', undefined);
    }
  });

  const handleSubmit = useCatch(async () => {
    const response = await fetchOrThrow(`/api/devices/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    dispatch(devicesActions.update([await response.json()]));
    onClose();
  });

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetchOrThrow('/api/devices');
      dispatch(devicesActions.refresh(await response.json()));
      onClose();
    }
    setRemoving(false);
  });

  if (!item) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        slotProps={{ paper: { className: classes.paper } }}
      >
        <div className={classes.header}>
          <Tabs
            className={classes.tabs}
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabKeys.map((key) => (
              <Tab key={key} label={t(key)} />
            ))}
          </Tabs>
          <div className={classes.headerActions}>
            <IconButton
              size="small"
              color="error"
              disabled={deviceReadonly}
              onClick={() => setRemoving(true)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
        {tab === 0 ? (
          <div className={classes.content}>
            <div className={classes.section}>
              <div className={classes.sectionHeader}>
                <Typography variant="subtitle1" className={classes.sectionTitle}>
                  {t('deviceManageDeviceInformation')}
                </Typography>
                <div className={classes.iconCircle} style={{ backgroundColor: '#fde3e3' }}>
                  <PlayCircleIcon fontSize="small" sx={{ color: '#e4573a' }} />
                </div>
                <div className={classes.iconCircle} style={{ backgroundColor: '#dcf7e3' }}>
                  <PublicIcon fontSize="small" sx={{ color: '#22a35a' }} />
                </div>
              </div>
              <div className={classes.grid}>
                <Field classes={classes} label={t('sharedName')} required>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.name || ''}
                    onChange={(e) => setItem({ ...item, name: e.target.value })}
                  />
                </Field>
                <Field classes={classes} label={t('deviceManageImportTime')}>
                  <TextField
                    size="small"
                    fullWidth
                    type="date"
                    value={
                      item.attributes.importTime ? item.attributes.importTime.split('T')[0] : ''
                    }
                    onChange={(e) =>
                      setAttribute(
                        'importTime',
                        e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      )
                    }
                  />
                </Field>
                <Field classes={classes} label={t('deviceModel')}>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.model || ''}
                    onChange={(e) => setItem({ ...item, model: e.target.value })}
                  />
                </Field>
                <Field classes={classes} label={t('deviceManageSaleTime')}>
                  <TextField
                    size="small"
                    fullWidth
                    type="date"
                    value={item.attributes.saleTime ? item.attributes.saleTime.split('T')[0] : ''}
                    onChange={(e) =>
                      setAttribute(
                        'saleTime',
                        e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      )
                    }
                  />
                </Field>
                <Field classes={classes} label={t('deviceIdentifier')} required>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.uniqueId || ''}
                    onChange={(e) => setItem({ ...item, uniqueId: e.target.value })}
                  />
                </Field>
                <Field classes={classes} label={t('deviceManageActivationDate')}>
                  <TextField
                    size="small"
                    fullWidth
                    type="date"
                    value={
                      item.attributes.activationDate
                        ? item.attributes.activationDate.split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setAttribute(
                        'activationDate',
                        e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      )
                    }
                  />
                </Field>
                <Field classes={classes} label={t('deviceManageSimCard')}>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.attributes.simCard || ''}
                    onChange={(e) => setAttribute('simCard', e.target.value)}
                  />
                </Field>
                <Field classes={classes} label={t('userExpirationTime')} required>
                  <TextField
                    size="small"
                    fullWidth
                    type="date"
                    required
                    value={item.expirationTime ? item.expirationTime.split('T')[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setItem({
                          ...item,
                          expirationTime: new Date(e.target.value).toISOString(),
                        });
                      }
                    }}
                    disabled={!manager}
                  />
                </Field>
                <Field classes={classes} label={t('deviceManageIccid')}>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.attributes.iccid || ''}
                    onChange={(e) => setAttribute('iccid', e.target.value)}
                  />
                </Field>
              </div>
            </div>
            <div className={classes.section}>
              <div className={classes.sectionHeader}>
                <Typography variant="subtitle1" className={classes.sectionTitle}>
                  {t('deviceManageDeviceInformation')}
                </Typography>
                <div className={classes.iconCircle} style={{ backgroundColor: '#e3edfd' }}>
                  <InfoIcon fontSize="small" sx={{ color: '#3b6fe0' }} />
                </div>
                <div className={classes.iconCircle} style={{ backgroundColor: '#e3edfd' }}>
                  <PublicIcon fontSize="small" sx={{ color: '#3b6fe0' }} />
                </div>
              </div>
              <div className={classes.grid}>
                <Field classes={classes} label={t('deviceManagePlateNumber')}>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.attributes.plateNumber || ''}
                    onChange={(e) => setAttribute('plateNumber', e.target.value)}
                  />
                </Field>
                <Field classes={classes} label={t('deviceContact')}>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.contact || ''}
                    onChange={(e) => setItem({ ...item, contact: e.target.value })}
                  />
                </Field>
                <Field classes={classes} label={t('sharedPhone')}>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.phone || ''}
                    onChange={(e) => setItem({ ...item, phone: e.target.value })}
                  />
                </Field>
                <Field classes={classes} label={t('deviceManageFuelConsumption')}>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.attributes.fuelConsumption || ''}
                    onChange={(e) => setAttribute('fuelConsumption', e.target.value)}
                  />
                </Field>
                <Field classes={classes} label={t('deviceCategory')}>
                  <TextField
                    size="small"
                    fullWidth
                    value={t(
                      `category${(item.category || 'default').replace(/^\w/, (c) => c.toUpperCase())}`,
                    )}
                    onClick={(e) => setIconAnchorEl(e.currentTarget)}
                    slotProps={{
                      input: {
                        readOnly: true,
                        sx: { cursor: 'pointer' },
                        endAdornment: (
                          <InputAdornment position="end">
                            <img
                              src={mapIcons[mapIconKey(item.category)]}
                              alt=""
                              width={18}
                              height={18}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Field>
                <Field classes={classes} label={t('attributeDeviceImage')}>
                  <FileInput
                    placeholder={t('attributeDeviceImage')}
                    value={imageFile}
                    onChange={handleFileInput}
                    slotProps={{ htmlInput: { accept: 'image/jpeg,image/jpg,image/png' } }}
                  />
                </Field>
                <Field classes={classes} label={t('deviceManageDistributorRemark')} span>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder={t('deviceManageRemarkPlaceholder')}
                    value={item.attributes.distributorRemark || ''}
                    onChange={(e) => setAttribute('distributorRemark', e.target.value)}
                  />
                </Field>
              </div>
            </div>
            <div className={classes.section}>
              <div className={classes.sectionHeader}>
                <Typography variant="subtitle1" className={classes.sectionTitle}>
                  {t('sharedExtra')}
                </Typography>
                <div className={classes.iconCircle} style={{ backgroundColor: '#f1e9fd' }}>
                  <TuneIcon fontSize="small" sx={{ color: '#7c4fe0' }} />
                </div>
              </div>
              <div className={classes.grid}>
                <Field classes={classes} label={t('groupParent')}>
                  <SelectField
                    singleLine
                    fullWidth
                    value={item.groupId}
                    onChange={(e) => setItem({ ...item, groupId: Number(e.target.value) })}
                    endpoint="/api/groups"
                  />
                </Field>
                <Field classes={classes} label={t('sharedCalendar')}>
                  <SelectField
                    singleLine
                    fullWidth
                    value={item.calendarId}
                    onChange={(e) => setItem({ ...item, calendarId: Number(e.target.value) })}
                    endpoint="/api/calendars"
                  />
                </Field>
              </div>
              <div className={classes.checkboxRow}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(item.disabled)}
                      onChange={(e) => setItem({ ...item, disabled: e.target.checked })}
                    />
                  }
                  label={t('sharedDisabled')}
                  disabled={!manager}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => setShowQr(true)}
                >
                  {t('sharedQrCode')}
                </Button>
              </div>
            </div>
            {!features.disableAttributes && (
              <div className={classes.section}>
                <div
                  className={cx(classes.sectionHeader, classes.sectionHeaderClickable)}
                  onClick={() => setAttributesExpanded((prev) => !prev)}
                >
                  <Typography variant="subtitle1" className={classes.sectionTitle}>
                    {t('sharedAttributes')}
                  </Typography>
                  <div className={classes.iconCircle} style={{ backgroundColor: '#fdeee3' }}>
                    <SettingsIcon fontSize="small" sx={{ color: '#e08a3b' }} />
                  </div>
                  <IconButton size="small">
                    <ExpandMoreIcon
                      className={cx(
                        classes.expandIcon,
                        attributesExpanded && classes.expandIconOpen,
                      )}
                    />
                  </IconButton>
                </div>
                {attributesExpanded && (
                  <>
                    <div className={classes.grid}>
                      {otherAttributeKeys.map((key) => {
                        const definition = attributeDefinitions[key];
                        const rawValue = item.attributes[key];
                        const displayValue =
                          definition.type === 'number'
                            ? (attributeFromRaw(rawValue, definition.dataType, units) ?? '')
                            : (rawValue ?? '');
                        return (
                          <Field classes={classes} key={key} label={attributeLabel(key)}>
                            <TextField
                              size="small"
                              fullWidth
                              type={definition.type === 'number' ? 'number' : 'text'}
                              value={displayValue}
                              onChange={(e) => {
                                const { value } = e.target;
                                if (definition.type === 'number') {
                                  setAttribute(
                                    key,
                                    value === ''
                                      ? undefined
                                      : attributeToRaw(Number(value), definition.dataType, units),
                                  );
                                } else {
                                  setAttribute(key, value);
                                }
                              }}
                            />
                          </Field>
                        );
                      })}
                    </div>
                    <div className={classes.checkboxRow}>
                      {booleanAttributeKeys.map((key) => (
                        <FormControlLabel
                          key={key}
                          control={
                            <Checkbox
                              checked={Boolean(item.attributes[key])}
                              onChange={(e) => setAttribute(key, e.target.checked)}
                            />
                          }
                          label={attributeLabel(key)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : tab === 2 ? (
          <div className={classes.content}>
            {notificationTypes !== null && notificatorTypes !== null && (
              <div className={classes.section}>
                <div
                  className={cx(classes.sectionHeader, classes.sectionHeaderClickable)}
                  onClick={() => setNotificationsExpanded((prev) => !prev)}
                >
                  <Typography variant="subtitle1" className={classes.sectionTitle}>
                    {t('deviceManageAllNotifications')}
                  </Typography>
                  <div className={classes.iconCircle} style={{ backgroundColor: '#fdeee3' }}>
                    <NotificationsActiveIcon fontSize="small" sx={{ color: '#e08a3b' }} />
                  </div>
                  <IconButton size="small">
                    <ExpandMoreIcon
                      className={cx(
                        classes.expandIcon,
                        notificationsExpanded && classes.expandIconOpen,
                      )}
                    />
                  </IconButton>
                </div>
                {notificationsExpanded && (
                  <div className={classes.tableWrap}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell className={classes.typeCell}>
                            {t('deviceManageNotificationType')}
                          </TableCell>
                          {notificatorColumns.map((notificator) => (
                            <TableCell key={notificator.type} className={classes.channelHeadCell}>
                              {t(prefixString('notificator', notificator.type))}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(notificationTypes || []).map((notificationType) => {
                          const type = notificationType.type;
                          const channels = notificationChannels(type);
                          const saving = alertSaving === `type:${type}`;
                          return (
                            <TableRow key={type}>
                              <TableCell className={classes.typeCell}>
                                {t(prefixString('event', type))}
                              </TableCell>
                              {notificatorColumns.map((notificator) => (
                                <TableCell key={notificator.type} className={classes.channelCell}>
                                  <Checkbox
                                    size="small"
                                    checked={channels.includes(notificator.type)}
                                    disabled={deviceReadonly || saving}
                                    onChange={(e) => {
                                      const next = e.target.checked
                                        ? [...channels, notificator.type]
                                        : channels.filter((c) => c !== notificator.type);
                                      setNotificationChannels(type, next);
                                    }}
                                  />
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
            {notifications === null || linkedNotifications === null ? (
              <Typography className={classes.placeholder}>
                {t('deviceManageAlertLoading')}
              </Typography>
            ) : (
              <div className={classes.section}>
                <div className={classes.sectionHeader}>
                  <Typography variant="subtitle1" className={classes.sectionTitle}>
                    {t('deviceManageAlertSetting')}
                  </Typography>
                  <div className={classes.iconCircle} style={{ backgroundColor: '#fde3e3' }}>
                    <NotificationsActiveIcon fontSize="small" sx={{ color: '#e4573a' }} />
                  </div>
                </div>
                <div className={classes.grid}>
                  <AlertRow
                    classes={classes}
                    label={alertDefinitions.overspeed.label}
                    tooltip={alertDefinitions.overspeed.tooltip}
                    checked={isAlertEnabled(alertDefinitions.overspeed)}
                    onChange={(checked) => toggleAlert(alertDefinitions.overspeed, checked)}
                    disabled={deviceReadonly || alertSaving === alertDefinitions.overspeed.key}
                  />
                  <AlertRow
                    classes={classes}
                    label={t('deviceManageAlertStaticThreshold')}
                    checked={speedLimitEnabled}
                    onChange={(checked) =>
                      setAttribute(
                        'speedLimit',
                        checked ? attributeToRaw(0, 'speed', units) : undefined,
                      )
                    }
                    disabled={deviceReadonly}
                    extra={
                      <TextField
                        size="small"
                        type="number"
                        className={classes.alertValue}
                        value={speedLimitDisplay}
                        disabled={deviceReadonly || !speedLimitEnabled}
                        onChange={(e) => {
                          const { value } = e.target;
                          setAttribute(
                            'speedLimit',
                            value === ''
                              ? undefined
                              : attributeToRaw(Number(value), 'speed', units),
                          );
                        }}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">{speedUnitLabel}</InputAdornment>
                            ),
                          },
                        }}
                      />
                    }
                  />
                  {restAlertKeys.map((key) => (
                    <AlertRow
                      key={key}
                      classes={classes}
                      label={alertDefinitions[key].label}
                      tooltip={alertDefinitions[key].tooltip}   
                      checked={isAlertEnabled(alertDefinitions[key],)}
                      onChange={(checked) => toggleAlert(alertDefinitions[key], checked)}
                      disabled={deviceReadonly || alertSaving === alertDefinitions[key].key}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : tab === 3 ? (
          <div className={classes.content}>
            <Suspense
              fallback={
                <Typography className={classes.placeholder}>{t('sharedLoading')}</Typography>
              }
            >
              <DeviceAnalyticsPanel deviceId={item.id} />
            </Suspense>
          </div>
        ) : (
          <div className={classes.content}>
            <Typography className={classes.placeholder}>{t('deviceManageComingSoon')}</Typography>
          </div>
        )}
        <div className={classes.footer}>
          <Button onClick={onClose}>{t('sharedCancel')}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSubmit}
            disabled={deviceReadonly || !valid}
          >
            {t('sharedSubmit')}
          </Button>
        </div>
      </Dialog>
      <Menu
        anchorEl={iconAnchorEl}
        open={Boolean(iconAnchorEl)}
        onClose={() => setIconAnchorEl(null)}
      >
        {deviceCategories.map((category) => (
          <MenuItem
            key={category}
            selected={mapIconKey(item.category) === category}
            onClick={() => {
              setItem({ ...item, category });
              setIconAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <img src={mapIcons[category]} alt="" width={20} height={20} />
            </ListItemIcon>
            <ListItemText>
              {t(`category${category.replace(/^\w/, (c) => c.toUpperCase())}`)}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
      <RemoveDialog open={removing} endpoint="devices" itemId={item.id} onResult={handleRemove} />
    </>
  );
};

export default DeviceManageDialog;
