import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useRestriction } from '../common/util/permissions';
import UserCircleCheckIcon from '../resources/images/nav/user-circle-check.svg?react';
import CaretDownIcon from '../resources/images/nav/caret-down.svg?react';

const useStyles = makeStyles()((theme) => ({
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    height: 48,
    padding: theme.spacing(0, 2),
    border: 'none',
    borderRadius: 999,
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.12), 0px 2px 4px 0px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    color: theme.palette.text.primary,
  },
  icon: {
    flexShrink: 0,
  },
  name: {
    fontSize: 16,
    whiteSpace: 'nowrap',
  },
  caret: {
    flexShrink: 0,
  },
}));

const ProfileMenu = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();

  const readonly = useRestriction('readonly');
  const user = useSelector((state) => state.session.user);

  return (
    <button
      type="button"
      className={classes.pill}
      disabled={readonly}
      onClick={() => navigate(`/settings/user/${user.id}`)}
    >
      <UserCircleCheckIcon className={classes.icon} />
      <Typography className={classes.name}>{user.name}</Typography>
      <CaretDownIcon className={classes.caret} />
    </button>
  );
};

export default ProfileMenu;
