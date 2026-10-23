import { Typography, Link } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { grey } from '@mui/material/colors';

const useStyles = makeStyles()((theme) => ({
  prompt: {
    textAlign: 'center',
    color: grey[500],
  },
  link: {
    cursor: 'pointer',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
}));

const AuthPrompt = ({ prompt, actionLabel, onAction }) => {
  const { classes } = useStyles();

  return (
    <Typography variant="body2" className={classes.prompt}>
      {`${prompt} `}
      <Link onClick={onAction} className={classes.link} underline="none" variant="body2">
        {actionLabel}
      </Link>
    </Typography>
  );
};

export default AuthPrompt;
