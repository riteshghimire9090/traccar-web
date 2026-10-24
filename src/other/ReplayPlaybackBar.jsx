import { useState } from 'react';
import { IconButton, Menu, MenuItem, Slider, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import PauseCircleIcon from '@mui/icons-material/PauseCircleFilled';
import DownloadIcon from '@mui/icons-material/Download';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PlayCircleIcon from '../resources/images/nav/play-circle.svg?react';
import CaretDownIcon from '../resources/images/nav/caret-down.svg?react';
import { SHEET_HEIGHT } from './ReplayDetailsSheet';

const SPEED_OPTIONS = [1, 2, 5, 10, 25];

const useStyles = makeStyles()((theme) => ({
  bar: {
    position: 'fixed',
    zIndex: 5,
    bottom: theme.spacing(4),
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 64px)',
    maxWidth: 834,
    height: 96,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(0, 2),
    backgroundColor: 'white',
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: 16,
  },
  barRaised: {
    bottom: SHEET_HEIGHT + 16,
  },
  play: {
    '&&': {
      padding: 0,
      color: theme.palette.text.primary,
    },
  },
  steps: {
    display: 'flex',
    alignItems: 'center',
  },
  middle: {
    flex: 1,
    minWidth: 0,
  },
  caption: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  speedButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 38,
    padding: '8px 16px',
    borderRadius: 100,
    border: 'none',
    backgroundColor: 'white',
    boxShadow: '0px 0px 1px rgba(0,0,0,0.12)',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 14,
    whiteSpace: 'nowrap',
  },
  toggleGroup: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  toggleButton: {
    height: 48,
    padding: '8px 16px',
    borderRadius: 8,
    border: `1px solid ${theme.palette.grey[300]}`,
    backgroundColor: 'white',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 16,
    whiteSpace: 'nowrap',
  },
  toggleButtonActive: {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 500,
  },
}));

const ReplayPlaybackBar = ({
  positions,
  index,
  onIndexChange,
  playing,
  onPlayPause,
  speed,
  onSpeedChange,
  detailsTab,
  onOpenDetails,
  onDownload,
}) => {
  const { classes, cx } = useStyles();
  const t = useTranslation();
  const [speedAnchor, setSpeedAnchor] = useState(null);

  return (
    <div className={cx(classes.bar, detailsTab && classes.barRaised)}>
      <div className={classes.steps}>
        <IconButton
          size="small"
          onClick={() => onIndexChange(index - 1)}
          disabled={playing || index <= 0}
        >
          <FastRewindIcon />
        </IconButton>
        <IconButton
          className={classes.play}
          onClick={onPlayPause}
          disabled={index >= positions.length - 1}
        >
          {playing ? (
            <PauseCircleIcon sx={{ fontSize: 48 }} />
          ) : (
            <PlayCircleIcon width={48} height={48} />
          )}
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onIndexChange(index + 1)}
          disabled={playing || index >= positions.length - 1}
        >
          <FastForwardIcon />
        </IconButton>
      </div>

      <div className={classes.middle}>
        <Slider
          size="small"
          max={positions.length - 1}
          step={null}
          marks={positions.map((_, i) => ({ value: i }))}
          value={index}
          onChange={(_, value) => onIndexChange(value)}
        />
        <div className={classes.caption}>
          <Typography variant="caption">{`${index + 1}/${positions.length}`}</Typography>
          <Typography variant="caption">
            {formatTime(positions[index].fixTime, 'seconds')}
          </Typography>
        </div>
      </div>

      <button
        type="button"
        className={classes.speedButton}
        onClick={(e) => setSpeedAnchor(e.currentTarget)}
      >
        {`x${speed}`}
        <CaretDownIcon width={12} height={12} />
      </button>
      <Menu anchorEl={speedAnchor} open={Boolean(speedAnchor)} onClose={() => setSpeedAnchor(null)}>
        {SPEED_OPTIONS.map((value) => (
          <MenuItem
            key={value}
            selected={value === speed}
            onClick={() => {
              onSpeedChange(value);
              setSpeedAnchor(null);
            }}
          >
            {`x${value}`}
          </MenuItem>
        ))}
      </Menu>

      <div className={classes.toggleGroup}>
        <button
          type="button"
          className={cx(
            classes.toggleButton,
            detailsTab === 'details' && classes.toggleButtonActive,
          )}
          onClick={() => onOpenDetails('details')}
        >
          {t('replayDetails')}
        </button>
        <button
          type="button"
          className={cx(classes.toggleButton, detailsTab === 'speed' && classes.toggleButtonActive)}
          onClick={() => onOpenDetails('speed')}
        >
          {t('positionSpeed')}
        </button>
      </div>

      <IconButton onClick={onDownload}>
        <DownloadIcon />
      </IconButton>
    </div>
  );
};

export default ReplayPlaybackBar;
