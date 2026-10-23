import { ThemeProvider } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import theme from '../common/theme';
import { useLocalization } from '../common/components/LocalizationProvider';

const LoginThemeProvider = ({ children }) => {
  const server = useSelector((state) => state.session.server);
  const { direction } = useLocalization();

  const lightTheme = theme(server, false, direction);

  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
};

export default LoginThemeProvider;
