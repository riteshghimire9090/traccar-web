import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import palette from './palette';
import dimensions from './dimensions';
import components from './components';

const buildShadows = (darkMode) => {
  const alpha = darkMode ? 0.6 : 0.1;
  const soft = (y, blur, spread = 0) => `0 ${y}px ${blur}px ${spread}px rgba(15, 23, 42, ${alpha})`;
  const steps = [
    'none',
    soft(1, 3),
    soft(2, 6),
    soft(3, 8),
    soft(4, 10),
    soft(5, 12),
    soft(6, 14),
    soft(7, 16),
    soft(8, 18),
    soft(9, 20),
    soft(10, 22),
    soft(11, 24),
    soft(12, 26),
  ];
  while (steps.length < 25) {
    steps.push(soft(14, 32));
  }
  return steps;
};

export default (server, darkMode, direction) =>
  useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: '"Inter","Roboto","Segoe UI",Helvetica Neue,Arial,sans-serif',
          h6: {
            fontWeight: 600,
          },
          button: {
            fontWeight: 600,
            textTransform: 'none',
          },
        },
        shape: {
          borderRadius: 10,
        },
        shadows: buildShadows(darkMode),
        palette: palette(server, darkMode),
        direction,
        dimensions,
        components,
      }),
    [server, darkMode, direction],
  );
