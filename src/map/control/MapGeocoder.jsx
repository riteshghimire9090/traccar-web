import { useEffect, useState } from 'react';
import {
  useTheme,
  Popover,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Box,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { createRoot } from 'react-dom/client';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { map } from '../core/MapView';
import { toMapCoordinates } from '../core/mapUtil';
import useGeocodeSearch from '../core/useGeocodeSearch';
import { useTranslation } from '../../common/components/LocalizationProvider';

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
    width: theme.spacing(40),
    maxHeight: theme.spacing(50),
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: theme.spacing(1),
  },
  results: {
    overflowY: 'auto',
  },
}));

const MapGeocoder = () => {
  const theme = useTheme();
  const t = useTranslation();
  const { classes, cx } = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [query, setQuery] = useState('');
  const { results, loading } = useGeocodeSearch(query);

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
        iconRoot.render(<TravelExploreIcon fontSize="small" />);
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

  const onSelect = (feature) => {
    const [minX, minY, maxX, maxY] = feature.bbox;
    map.fitBounds([toMapCoordinates(minX, minY), toMapCoordinates(maxX, maxY)], { padding: 40 });
    setAnchorEl(null);
    setQuery('');
  };

  return (
    <Popover
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={() => setAnchorEl(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Box className={classes.panel}>
        <Box className={classes.input}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder={t('sharedSearch')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Box>
        <List className={classes.results} dense disablePadding>
          {loading
            ? Array.from({ length: 3 }, (_, i) => (
                <ListItemButton key={i} disabled>
                  <ListItemText primary={<Skeleton width="100%" />} />
                </ListItemButton>
              ))
            : results.map((feature) => (
                <ListItemButton key={feature.properties.place_id} onClick={() => onSelect(feature)}>
                  <ListItemText primary={feature.properties.display_name} />
                </ListItemButton>
              ))}
        </List>
      </Box>
    </Popover>
  );
};

export default MapGeocoder;
