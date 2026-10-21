import { grey, indigo } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

export default (server, darkMode) => ({
  mode: darkMode ? 'dark' : 'light',
  background: {
    default: darkMode ? '#0b1120' : '#f4f6fb',
    paper: darkMode ? '#141b2d' : '#ffffff',
  },
  primary: {
    main:
      validatedColor(server?.attributes?.colorPrimary) || (darkMode ? indigo[200] : indigo[700]),
  },
  secondary: {
    main: validatedColor(server?.attributes?.colorSecondary) || (darkMode ? '#34d399' : '#059669'),
  },
  neutral: {
    main: grey[500],
  },
  geometry: {
    main: '#3bb2d0',
  },
  alwaysDark: {
    main: grey[900],
  },
  divider: darkMode ? 'rgba(226, 232, 240, 0.08)' : 'rgba(15, 23, 42, 0.08)',
  text: {
    primary: darkMode ? '#e2e8f0' : '#1e293b',
    secondary: darkMode ? '#94a3b8' : '#64748b',
  },
});
