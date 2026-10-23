import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Typography, Menu, MenuItem, Divider } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../common/components/LocalizationProvider';
import CaretRightIcon from '../resources/images/nav/caret-right.svg?react';
import CaretDownIcon from '../resources/images/nav/caret-down.svg?react';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
  },
  groups: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  groupRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    height: 40,
    padding: theme.spacing(0, 1),
    borderRadius: theme.shape.borderRadius,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'start',
    fontSize: 14,
    color: theme.palette.text.primary,
  },
  groupRowActive: {
    backgroundColor: theme.palette.action.hover,
  },
  sortRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: 16,
    color: theme.palette.text.primary,
    padding: 0,
  },
  statusRow: {
    display: 'flex',
    gap: theme.spacing(0.75),
  },
  statusPill: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: theme.shape.borderRadius,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#f2faff',
    fontSize: 14,
    color: theme.palette.text.disabled,
  },
  statusPillActive: {
    color: theme.palette.secondary.main,
    fontWeight: 500,
  },
}));

const DeviceFilterPanel = ({ filter, setFilter, filterSort, setFilterSort, devices }) => {
  const { classes, cx } = useStyles();
  const t = useTranslation();

  const groups = useSelector((state) => state.groups.items);

  const [sortAnchorEl, setSortAnchorEl] = useState(null);

  const deviceList = Object.values(devices);

  const deviceStatusCount = (status) =>
    status ? deviceList.filter((d) => d.status === status).length : deviceList.length;

  const toggleGroup = (groupId) => {
    setFilter({
      ...filter,
      groups: filter.groups.includes(groupId)
        ? filter.groups.filter((id) => id !== groupId)
        : [...filter.groups, groupId],
    });
  };

  const toggleStatus = (status) => {
    if (!status) {
      setFilter({ ...filter, statuses: [] });
      return;
    }
    setFilter({
      ...filter,
      statuses: filter.statuses.includes(status)
        ? filter.statuses.filter((it) => it !== status)
        : [...filter.statuses, status],
    });
  };

  const sortOptions = [
    { value: '', label: t('sharedSortBy') },
    { value: 'name', label: t('sharedName') },
    { value: 'lastUpdate', label: t('deviceLastUpdate') },
  ];

  const statuses = [
    { value: null, label: t('sharedAll') },
    { value: 'online', label: t('deviceStatusOnline') },
    { value: 'offline', label: t('deviceStatusOffline') },
    { value: 'unknown', label: t('deviceStatusUnknown') },
  ];

  return (
    <div className={classes.root}>
      {Object.values(groups).length > 0 && (
        <div className={classes.groups}>
          {Object.values(groups)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((group) => (
              <button
                key={group.id}
                type="button"
                className={cx(
                  classes.groupRow,
                  filter.groups.includes(group.id) && classes.groupRowActive,
                )}
                onClick={() => toggleGroup(group.id)}
              >
                <CaretRightIcon />
                <span>{`${group.name} ${deviceList.filter((d) => d.groupId === group.id).length}/${deviceList.length}`}</span>
              </button>
            ))}
        </div>
      )}
      <Divider />
      <div className={classes.sortRow}>
        <button
          type="button"
          className={classes.sortButton}
          onClick={(event) => setSortAnchorEl(event.currentTarget)}
        >
          <Typography>
            {sortOptions.find((option) => option.value === filterSort)?.label}
          </Typography>
          <CaretDownIcon />
        </button>
      </div>
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        {sortOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => {
              setFilterSort(option.value);
              setSortAnchorEl(null);
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
      <div className={classes.statusRow}>
        {statuses.map((status) => {
          const active = status.value
            ? filter.statuses.includes(status.value)
            : filter.statuses.length === 0;
          return (
            <button
              key={status.label}
              type="button"
              className={cx(classes.statusPill, active && classes.statusPillActive)}
              onClick={() => toggleStatus(status.value)}
            >
              {`${status.label} (${deviceStatusCount(status.value)})`}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DeviceFilterPanel;
