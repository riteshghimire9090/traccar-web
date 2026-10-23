import { useTheme, useMediaQuery } from '@mui/material';
import { useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import defaultLogo from '../resources/images/login/logo-mark.png';

const useStyles = makeStyles()((theme) => ({
  image: {
    alignSelf: 'center',
    maxWidth: '240px',
    maxHeight: '120px',
    width: 'auto',
    height: 'auto',
    margin: theme.spacing(2),
  },
}));

const LogoImage = ({ className }) => {
  const theme = useTheme();
  const { classes, cx } = useStyles();

  const expanded = !useMediaQuery(theme.breakpoints.down('lg'));

  const logo = useSelector((state) => state.session.server.attributes?.logo);
  const logoInverted = useSelector((state) => state.session.server.attributes?.logoInverted);

  const imageClassName = cx(classes.image, className);

  if (logo) {
    if (expanded && logoInverted) {
      return <img className={imageClassName} src={logoInverted} alt="" />;
    }
    return <img className={imageClassName} src={logo} alt="" />;
  }
  return <img className={imageClassName} src={defaultLogo} alt="" />;
};

export default LogoImage;
