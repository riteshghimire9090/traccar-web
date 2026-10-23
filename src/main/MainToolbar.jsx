import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Toolbar,
  IconButton,
  OutlinedInput,
  InputAdornment,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Badge,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import DnsIcon from '@mui/icons-material/Dns';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useDeviceReadonly } from '../common/util/permissions';
import DeviceRow from './DeviceRow';
import DeviceFilterPanel from './DeviceFilterPanel';
import CloseIcon from '../resources/images/nav/close-x.svg?react';
import MagnifyingGlassIcon from '../resources/images/nav/magnifying-glass.svg?react';

const useStyles = makeStyles()((theme) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 2, 0, 2),
  },
  title: {
    fontWeight: 500,
  },
  toolbar: {
    display: 'flex',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 2),
  },
  search: {
    borderRadius: theme.shape.borderRadius,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.divider,
    },
  },
  filterPanel: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    width: theme.dimensions.drawerWidthTablet,
  },
}));

const MainToolbar = ({
  filteredDevices,
  devicesOpen,
  setDevicesOpen,
  keyword,
  setKeyword,
  filter,
  setFilter,
  filterSort,
  setFilterSort,
  filterMap,
  setFilterMap,
}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();

  const devices = useSelector((state) => state.devices.items);
  const devicesLoaded = useSelector((state) => state.devices.loaded);
  const geofences = useSelector((state) => state.geofences.items);

  const toolbarRef = useRef();
  const inputRef = useRef();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [devicesAnchorEl, setDevicesAnchorEl] = useState(null);

  return (
    <>
      <div className={classes.header}>
        <Typography className={classes.title}>
          {devicesOpen ? t('sharedViewDevice') : t('deviceTitle')}
        </Typography>
        <IconButton edge="end" onClick={() => setDevicesOpen(!devicesOpen)}>
          {devicesOpen ? <CloseIcon width={20} height={20} /> : <DnsIcon fontSize="small" />}
        </IconButton>
      </div>
      <Toolbar ref={toolbarRef} className={classes.toolbar}>
        <OutlinedInput
          ref={inputRef}
          className={classes.search}
          placeholder={t('sharedSearchDevices')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setDevicesAnchorEl(toolbarRef.current)}
          onBlur={() => setDevicesAnchorEl(null)}
          endAdornment={
            <InputAdornment position="end">
              <MagnifyingGlassIcon width={20} height={20} />
            </InputAdornment>
          }
          size="small"
          fullWidth
        />
        <IconButton onClick={(event) => setFilterAnchorEl(event.currentTarget)}>
          <Badge color="info" variant="dot" invisible={!filter.geofences.length && !filterMap}>
            <TuneIcon fontSize="small" />
          </Badge>
        </IconButton>
        <IconButton
          edge="end"
          onClick={() => navigate('/settings/device')}
          disabled={deviceReadonly}
        >
          <Tooltip
            open={!deviceReadonly && devicesLoaded && Object.keys(devices).length === 0}
            title={t('deviceRegisterFirst')}
            arrow
          >
            <AddIcon />
          </Tooltip>
        </IconButton>
        <Popover
          open={!!devicesAnchorEl && !devicesOpen}
          anchorEl={devicesAnchorEl}
          onClose={() => setDevicesAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: Number(theme.spacing(2).slice(0, -2)),
          }}
          marginThreshold={0}
          slotProps={{
            paper: {
              style: { width: `calc(${toolbarRef.current?.clientWidth}px - ${theme.spacing(4)})` },
            },
          }}
          elevation={1}
          disableAutoFocus
          disableEnforceFocus
        >
          {filteredDevices.slice(0, 3).map((_, index) => (
            <DeviceRow key={filteredDevices[index].id} devices={filteredDevices} index={index} />
          ))}
          {filteredDevices.length > 3 && (
            <ListItemButton alignItems="center" onClick={() => setDevicesOpen(true)}>
              <ListItemText primary={t('notificationAlways')} style={{ textAlign: 'center' }} />
            </ListItemButton>
          )}
        </Popover>
        <Popover
          open={!!filterAnchorEl}
          anchorEl={filterAnchorEl}
          onClose={() => setFilterAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <div className={classes.filterPanel}>
            <FormControl>
              <InputLabel>{t('sharedGeofences')}</InputLabel>
              <Select
                label={t('sharedGeofences')}
                value={filter.geofences}
                onChange={(e) => setFilter({ ...filter, geofences: e.target.value })}
                multiple
              >
                {Object.values(geofences)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((geofence) => (
                    <MenuItem key={geofence.id} value={geofence.id}>
                      {geofence.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox checked={filterMap} onChange={(e) => setFilterMap(e.target.checked)} />
                }
                label={t('sharedFilterMap')}
              />
            </FormGroup>
          </div>
        </Popover>
      </Toolbar>
      {devicesOpen && (
        <DeviceFilterPanel
          filter={filter}
          setFilter={setFilter}
          filterSort={filterSort}
          setFilterSort={setFilterSort}
          devices={devices}
        />
      )}
    </>
  );
};

export default MainToolbar;
