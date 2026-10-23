import { useMediaQuery, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import LogoImage from './LogoImage';
import { useTranslation } from '../common/components/LocalizationProvider';
import heroBackground from '../resources/images/login/hero-background.jpg';
import defaultHeroIllustration from '../resources/images/login/hero-illustration-phone.png';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
    background: theme.palette.background.paper,
  },
  formSide: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    padding: theme.spacing(4, 4, 4, 5),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
    },
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
  },
  logo: {
    maxWidth: '140px',
    maxHeight: '44px',
    width: 'auto',
    height: 'auto',
    margin: 0,
  },
  formCenter: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    maxWidth: theme.spacing(49),
    margin: '0 auto',
  },
  form: {
    width: '100%',
  },
  hero: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 24,
    margin: theme.spacing(3, 3, 3, 0),
    width: '46%',
    color: theme.palette.common.white,
    background: theme.palette.secondary.main,
    [theme.breakpoints.down('lg')]: {
      width: theme.dimensions.sidebarWidthTablet,
      margin: 0,
      borderRadius: 0,
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  heroBackground: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    [theme.breakpoints.down('lg')]: {
      display: 'none',
    },
  },
  heroContent: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(4),
    padding: theme.spacing(5, 4),
    [theme.breakpoints.down('lg')]: {
      display: 'none',
    },
  },
  heroIllustration: {
    maxWidth: '100%',
    height: 'auto',
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  },
  heroTitle: {
    fontWeight: 700,
    textAlign: 'center',
  },
  heroSubtitle: {
    textAlign: 'center',
    opacity: 0.9,
  },
  dots: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    background: theme.palette.common.white,
  },
}));

const LoginLayout = ({ children, headerEnd, heroIllustration }) => {
  const { classes, cx } = useStyles();
  const theme = useTheme();
  const t = useTranslation();

  const showHero = !useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <main className={classes.root}>
      <div className={classes.formSide}>
        <div className={classes.topBar}>
          <LogoImage className={classes.logo} />
          {headerEnd}
        </div>
        <div className={classes.formCenter}>
          <form className={classes.form}>{children}</form>
        </div>
      </div>
      {showHero && (
        <div className={classes.hero}>
          <img src={heroBackground} alt="" className={classes.heroBackground} />
          <div className={classes.heroContent}>
            <img
              src={heroIllustration || defaultHeroIllustration}
              alt=""
              className={classes.heroIllustration}
            />
            <div className={classes.heroText}>
              <Typography variant="h5" className={classes.heroTitle}>
                {t('loginHeroTitle')}
              </Typography>
              <Typography variant="body2" className={classes.heroSubtitle}>
                {t('loginHeroSubtitle')}
              </Typography>
            </div>
            <div className={classes.dots}>
              <span className={cx(classes.dot, classes.dotActive)} />
              <span className={classes.dot} />
              <span className={classes.dot} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default LoginLayout;
