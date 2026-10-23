import { TextField, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import PasswordField from '../common/components/PasswordField';

const useStyles = makeStyles()((theme) => ({
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  label: {
    fontWeight: 600,
  },
}));

const LoginField = ({ label, required, secret, className, extra, ...others }) => {
  const { classes, cx } = useStyles();
  const Component = secret ? PasswordField : TextField;

  return (
    <div className={cx(classes.field, className)}>
      <Typography variant="body2" className={classes.label}>
        {required ? `${label} *` : label}
      </Typography>
      <Component placeholder={label} {...others} />
      {extra}
    </div>
  );
};

export default LoginField;
