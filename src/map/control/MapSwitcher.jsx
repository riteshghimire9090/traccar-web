import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, Popover, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { createRoot } from 'react-dom/client';
import LayersIcon from '@mui/icons-material/Layers';
import TuneIcon from '@mui/icons-material/Tune';
import { map } from '../core/MapView';
import usePersistedState from '../../common/util/usePersistedState';
import { useTranslation } from '../../common/components/LocalizationProvider';

const collectTitles = () => {
  const titles = [];
  map.getStyle()?.layers?.forEach((layer) => {
    const title = layer.metadata?.['traccar:title'];
    if (title && !titles.includes(title)) {
      titles.push(title);
    }
  });
  return titles;
};

const applyVisibility = (hidden) => {
  map.getStyle()?.layers?.forEach((layer) => {
    const title = layer.metadata?.['traccar:title'];
    if (title) {
      const visibility = hidden.includes(title) ? 'none' : 'visible';
      if ((map.getLayoutProperty(layer.id, 'visibility') || 'visible') !== visibility) {
        map.setLayoutProperty(layer.id, 'visibility', visibility);
      }
    }
  });
};

const useStyles = makeStyles()((theme) => ({
  button: {
    '&&': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#333',
    },
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    width: theme.spacing(36),
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 500,
  },
  displayGrid: {
    display: 'flex',
    gap: theme.spacing(1.5),
    backgroundColor: '#f5f5f7',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5),
  },
  displayItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },
  displayIcon: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.disabled,
  },
  displayIconActive: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
  displayLabel: {
    fontSize: 10,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  displayLabelActive: {
    color: theme.palette.secondary.main,
  },
  styleRow: {
    display: 'flex',
    alignItems: 'center',
    height: 32,
    padding: theme.spacing(0, 1),
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#f0f1f5',
    color: theme.palette.text.primary,
    fontSize: 14,
  },
  styleRowActive: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    height: 40,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: theme.palette.text.primary,
  },
}));

const MapSwitcher = ({ styles, selectedId, onSelect }) => {
  const theme = useTheme();
  const t = useTranslation();
  const navigate = useNavigate();
  const { classes, cx } = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const [hidden, setHidden] = usePersistedState('hiddenMapLayers', []);
  const [titles, setTitles] = useState(collectTitles);

  const hiddenRef = useRef(hidden);
  hiddenRef.current = hidden;

  useEffect(() => {
    const update = () => {
      setTitles(collectTitles());
      applyVisibility(hiddenRef.current);
    };
    map.on('styledata', update);
    update();
    return () => map.off('styledata', update);
  }, []);

  useEffect(() => applyVisibility(hidden), [hidden]);

  useEffect(() => {
    let element;
    let iconRoot;
    const control = {
      onAdd: () => {
        element = document.createElement('div');
        element.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = cx('maplibregl-ctrl-icon', classes.button);
        button.onclick = () => setAnchorEl(button);
        element.appendChild(button);
        iconRoot = createRoot(button);
        iconRoot.render(<LayersIcon fontSize="small" />);
        return element;
      },
      onRemove: () => {
        queueMicrotask(() => iconRoot.unmount());
        element.remove();
      },
    };
    map.addControl(control, theme.direction === 'rtl' ? 'top-left' : 'top-right');
    return () => map.removeControl(control);
  }, [theme.direction, classes.button, cx]);

  return (
    <Popover
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={() => setAnchorEl(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <div className={classes.panel}>
        {titles.length > 0 && (
          <div className={classes.section}>
            <Typography className={classes.sectionLabel}>{t('mapDisplay')}</Typography>
            <div className={classes.displayGrid}>
              {titles.map((title) => {
                const active = !hidden.includes(title);
                return (
                  <button
                    key={title}
                    type="button"
                    className={classes.displayItem}
                    onClick={() =>
                      setHidden((previous) =>
                        previous.includes(title)
                          ? previous.filter((value) => value !== title)
                          : [...previous, title],
                      )
                    }
                  >
                    <span className={cx(classes.displayIcon, active && classes.displayIconActive)}>
                      <LayersIcon fontSize="small" />
                    </span>
                    <span
                      className={cx(classes.displayLabel, active && classes.displayLabelActive)}
                    >
                      {title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className={classes.section}>
          <Typography className={classes.sectionLabel}>{t('mapSelection')}</Typography>
          {styles.map((style) => (
            <button
              key={style.id}
              type="button"
              className={cx(classes.styleRow, style.id === selectedId && classes.styleRowActive)}
              onClick={() => {
                onSelect(style.id);
                setAnchorEl(null);
              }}
            >
              {style.title}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={classes.footer}
          onClick={() => {
            setAnchorEl(null);
            navigate('/settings/preferences');
          }}
        >
          <TuneIcon fontSize="small" />
          <Typography>{t('sharedPreferences')}</Typography>
        </button>
      </div>
    </Popover>
  );
};

export default MapSwitcher;
