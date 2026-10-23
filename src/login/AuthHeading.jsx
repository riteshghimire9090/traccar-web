import { Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../common/components/LocalizationProvider';

const useStyles = makeStyles()((theme) => ({
  block: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
  title: {
    fontWeight: 700,
  },
  subtitle: {
    color: theme.palette.text.secondary,
  },
}));

const AuthHeading = ({ subtitle }) => {
  const { classes } = useStyles();
  const t = useTranslation();

  return (
    <div className={classes.block}>
      <Typography variant="h4" className={classes.title}>
        {t('loginHeadline')}
      </Typography>
      <Typography variant="body2" className={classes.subtitle}>
        {subtitle}
      </Typography>
    </div>
  );
};

export default AuthHeading;
