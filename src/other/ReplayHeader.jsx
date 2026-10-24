import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Popover,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Box,
  Typography,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import TuneIcon from '@mui/icons-material/Tune';
import CheckIcon from '@mui/icons-material/Check';
import { map } from '../map/core/MapView';
import { toMapCoordinates } from '../map/core/mapUtil';
import useGeocodeSearch from '../map/core/useGeocodeSearch';
import { interpolateTurbo } from '../common/util/colors';
import { speedFromKnots, speedUnitString } from '../common/util/converter';
import { useAttributePreference } from '../common/util/preferences';
import { useTranslation } from '../common/components/LocalizationProvider';
import CaretDownIcon from '../resources/images/nav/caret-down.svg?react';
import ClockIcon from '../resources/images/nav/clock.svg?react';
import MagnifyingGlassIcon from '../resources/images/nav/magnifying-glass.svg?react';
import CloseIcon from '../resources/images/nav/close-x2.svg?react';

const shadow = '0px 0px 2px rgba(0,0,0,0.12), 0px 2px 4px rgba(0,0,0,0.08)';

const useStyles = makeStyles()((theme) => ({
  header: {
    position: 'fixed',
    zIndex: 5,
    top: theme.spacing(3),
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 64px)',
    maxWidth: 1456,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    flexWrap: 'nowrap',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
    flexShrink: 0,
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 48,
    padding: '8px 24px',
    borderRadius: 100,
    backgroundColor: 'white',
    border: 'none',
    cursor: 'pointer',
    font: 'inherit',
    boxShadow: shadow,
    whiteSpace: 'nowrap',
  },
  pillOutlined: {
    boxShadow: 'none',
    border: `1px solid ${theme.palette.grey[300]}`,
  },
  pillText: {
    fontSize: 14,
    fontWeight: 500,
  },
  deviceName: {
    maxWidth: 160,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rangeText: {
    fontSize: 16,
  },
  quickGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    height: 48,
    padding: 8,
    borderRadius: 100,
    backgroundColor: 'white',
    border: `1px solid ${theme.palette.grey[300]}`,
  },
  quickButton: {
    border: 'none',
    cursor: 'pointer',
    font: 'inherit',
    height: '100%',
    padding: '4px 8px',
    borderRadius: 100,
    fontSize: 14,
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.secondary,
  },
  quickButtonActive: {
    backgroundColor: theme.palette.info.lightest || '#f2faff',
    color: theme.palette.info.main,
  },
  roundButton: {
    '&&': {
      backgroundColor: 'white',
      boxShadow: shadow,
      width: 48,
      height: 48,
      color: theme.palette.text.primary,
    },
  },
  panel: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  searchPanel: {
    width: theme.spacing(40),
    maxHeight: theme.spacing(50),
    display: 'flex',
    flexDirection: 'column',
  },
  searchInput: {
    padding: theme.spacing(1),
  },
  searchResults: {
    overflowY: 'auto',
  },
  legendTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
  },
  legendBadge: {
    padding: '4px 8px',
    borderRadius: 100,
    backgroundColor: '#fff0f0',
    color: theme.palette.primary.main,
    fontSize: 14,
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  legendSwatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    flexShrink: 0,
  },
}));

const ReplayHeader = ({
  deviceId,
  onDeviceChange,
  quickKey,
  onQuickSelect,
  range,
  onCustomApply,
  positions,
  onClose,
}) => {
  const t = useTranslation();
  const { classes, cx } = useStyles();
  const speedUnit = useAttributePreference('speedUnit');

  const devices = useSelector((state) => state.devices.items);
  const deviceList = Object.values(devices).sort((a, b) => a.name.localeCompare(b.name));
  const deviceName = devices[deviceId]?.name || '';

  const [deviceAnchor, setDeviceAnchor] = useState(null);
  const [dateAnchor, setDateAnchor] = useState(null);
  const [searchAnchor, setSearchAnchor] = useState(null);
  const [optionAnchor, setOptionAnchor] = useState(null);

  const [draftFrom, setDraftFrom] = useState(range[0]);
  const [draftTo, setDraftTo] = useState(range[1]);

  const [query, setQuery] = useState('');
  const { results, loading } = useGeocodeSearch(query);

  const quickOptions = [
    { key: 'yesterday', label: t('reportYesterday') },
    { key: 'today', label: t('reportToday') },
    { key: 'week', label: t('reportThisWeek') },
    { key: 'lastWeek', label: t('reportPreviousWeek') },
  ];

  const openDateAnchor = (event) => {
    setDraftFrom(range[0]);
    setDraftTo(range[1]);
    setDateAnchor(event.currentTarget);
  };

  const applyCustomRange = () => {
    onCustomApply([dayjs(draftFrom).toISOString(), dayjs(draftTo).toISOString()]);
    setDateAnchor(null);
  };

  const onSelectResult = (feature) => {
    const [minX, minY, maxX, maxY] = feature.bbox;
    map.fitBounds([toMapCoordinates(minX, minY), toMapCoordinates(maxX, maxY)], { padding: 40 });
    setSearchAnchor(null);
    setQuery('');
  };

  const speeds = positions.map((p) => p.speed);
  const minSpeed = speeds.length ? Math.min(...speeds) : 0;
  const maxSpeed = speeds.length ? Math.max(...speeds) : 0;
  const unit = speedUnitString(speedUnit, t);
  const bandLabel = (from, to) =>
    `${Math.round(speedFromKnots(from, speedUnit))} - ${Math.round(speedFromKnots(to, speedUnit))} ${unit}`;
  const step = (maxSpeed - minSpeed) / 3;
  const legend = [0, 1, 2].map((i) => ({
    color: `rgb(${interpolateTurbo(i / 2).join(',')})`,
    label: bandLabel(minSpeed + i * step, minSpeed + (i + 1) * step),
  }));

  return (
    <div className={classes.header}>
      <div className={classes.leftGroup}>
        <button
          type="button"
          className={classes.pill}
          onClick={(e) => setDeviceAnchor(e.currentTarget)}
        >
          <span className={cx(classes.pillText, classes.deviceName)}>{deviceName}</span>
          <CaretDownIcon width={16} height={16} />
        </button>
        <Menu
          anchorEl={deviceAnchor}
          open={Boolean(deviceAnchor)}
          onClose={() => setDeviceAnchor(null)}
        >
          {deviceList.map((device) => (
            <MenuItem
              key={device.id}
              selected={device.id === deviceId}
              onClick={() => {
                onDeviceChange(device.id);
                setDeviceAnchor(null);
              }}
            >
              {device.name}
            </MenuItem>
          ))}
        </Menu>

        <button
          type="button"
          className={cx(classes.pill, classes.pillOutlined)}
          onClick={openDateAnchor}
        >
          <span className={classes.rangeText}>{dayjs(range[0]).format('YYYY-MM-DD HH:mm:ss')}</span>
          <span className={classes.rangeText}>-</span>
          <span className={classes.rangeText}>{dayjs(range[1]).format('YYYY-MM-DD HH:mm:ss')}</span>
          <ClockIcon width={16} height={16} />
        </button>
        <Popover
          anchorEl={dateAnchor}
          open={Boolean(dateAnchor)}
          onClose={() => setDateAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box className={classes.panel}>
            <div className={classes.dateRow}>
              <TextField
                label={t('reportFrom')}
                type="datetime-local"
                size="small"
                value={dayjs(draftFrom).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setDraftFrom(e.target.value)}
              />
              <TextField
                label={t('reportTo')}
                type="datetime-local"
                size="small"
                value={dayjs(draftTo).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setDraftTo(e.target.value)}
              />
              <IconButton color="primary" onClick={applyCustomRange}>
                <CheckIcon />
              </IconButton>
            </div>
          </Box>
        </Popover>

        <div className={classes.quickGroup}>
          {quickOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={cx(
                classes.quickButton,
                quickKey === option.key && classes.quickButtonActive,
              )}
              onClick={() => onQuickSelect(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={classes.rightGroup}>
        <IconButton
          className={classes.roundButton}
          onClick={(e) => setSearchAnchor(e.currentTarget)}
        >
          <MagnifyingGlassIcon width={24} height={24} />
        </IconButton>
        <Popover
          anchorEl={searchAnchor}
          open={Boolean(searchAnchor)}
          onClose={() => setSearchAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box className={classes.searchPanel}>
            <Box className={classes.searchInput}>
              <TextField
                autoFocus
                fullWidth
                size="small"
                placeholder={t('sharedSearch')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Box>
            <List className={classes.searchResults} dense disablePadding>
              {loading
                ? Array.from({ length: 3 }, (_, i) => (
                    <ListItemButton key={i} disabled>
                      <ListItemText primary={<Skeleton width="100%" />} />
                    </ListItemButton>
                  ))
                : results.map((feature) => (
                    <ListItemButton
                      key={feature.properties.place_id}
                      onClick={() => onSelectResult(feature)}
                    >
                      <ListItemText primary={feature.properties.display_name} />
                    </ListItemButton>
                  ))}
            </List>
          </Box>
        </Popover>

        <button
          type="button"
          className={classes.pill}
          onClick={(e) => setOptionAnchor(e.currentTarget)}
        >
          <TuneIcon fontSize="small" />
          <span className={classes.pillText}>{t('replayOption')}</span>
          <CaretDownIcon width={16} height={16} />
        </button>
        <Popover
          anchorEl={optionAnchor}
          open={Boolean(optionAnchor)}
          onClose={() => setOptionAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box className={classes.panel} style={{ width: 280 }}>
            <div className={classes.legendTitle}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t('replayTraceColor')}
              </Typography>
              <span className={classes.legendBadge}>{t('replayTraceCustomized')}</span>
            </div>
            {legend.map((item) => (
              <div key={item.label} className={classes.legendRow}>
                <div className={classes.legendSwatch} style={{ backgroundColor: item.color }} />
                <Typography variant="body1">{item.label}</Typography>
              </div>
            ))}
          </Box>
        </Popover>

        <button type="button" className={classes.pill} onClick={onClose}>
          <span className={classes.pillText}>{t('sharedClose')}</span>
          <CloseIcon width={18} height={18} />
        </button>
      </div>
    </div>
  );
};

export default ReplayHeader;
