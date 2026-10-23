import { useEffect, useRef, useState } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  Button,
  TextField,
  Link,
  Alert,
  IconButton,
  Tooltip,
  Typography,
  Divider,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import CountryFlag from 'react-country-flag';
import { makeStyles } from 'tss-react/mui';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import LanguageIcon from '@mui/icons-material/Language';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { alpha, useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sessionActions } from '../store';
import { useLocalization, useTranslation } from '../common/components/LocalizationProvider';
import LoginLayout from './LoginLayout';
import usePersistedState from '../common/util/usePersistedState';
import {
  generateLoginToken,
  handleLoginTokenListeners,
  nativeEnvironment,
  nativePostMessage,
} from '../common/components/NativeInterface';
import GoogleIcon from './GoogleIcon';
import { useCatch } from '../reactHelper';
import QrCodeDialog from '../common/components/QrCodeDialog';
import PasswordField from '../common/components/PasswordField';

const useStyles = makeStyles()((theme) => ({
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  languagePill: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    borderRadius: 999,
    padding: theme.spacing(0.5, 1.5),
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
  languageIcon: {
    display: 'flex',
    fontSize: 16,
  },
  select: {
    '&.MuiInputBase-root': {
      fontSize: 14,
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      padding: 0,
      paddingRight: `${theme.spacing(2.5)} !important`,
    },
    '& fieldset': {
      border: 'none',
    },
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
  },
  titleBlock: {
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
  googleButton: {
    borderColor: theme.palette.divider,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    gap: theme.spacing(1),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.divider,
    },
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  label: {
    fontWeight: 600,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    cursor: 'pointer',
    color: theme.palette.error.main,
    fontWeight: 500,
    marginTop: theme.spacing(0.5),
  },
  submit: {
    height: 56,
  },
  registerPrompt: {
    textAlign: 'center',
    color: grey[500],
  },
  registerLink: {
    cursor: 'pointer',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  flag: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const LoginPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTranslation();

  const { languages, language, setLocalLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    country: values[1].country,
    name: values[1].name,
  }));

  const [failed, setFailed] = useState(false);

  const [email, setEmail] = usePersistedState('loginEmail', '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showServerTooltip, setShowServerTooltip] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const registrationEnabled = useSelector((state) => state.session.server.registration);
  const languageEnabled = useSelector((state) => {
    const attributes = state.session.server.attributes;
    return !attributes.language && !attributes['ui.disableLoginLanguage'];
  });
  const changeEnabled = useSelector((state) => !state.session.server.attributes.disableChange);
  const emailEnabled = useSelector((state) => state.session.server.emailEnabled);
  const openIdEnabled = useSelector((state) => state.session.server.openIdEnabled);
  const openIdForced = useSelector(
    (state) => state.session.server.openIdEnabled && state.session.server.openIdForce,
  );
  const [codeEnabled, setCodeEnabled] = useState(false);

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector((state) => state.session.server.announcement);

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setFailed(false);
    try {
      const query = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const response = await fetch('/api/session', {
        method: 'POST',
        body: new URLSearchParams(code.length ? `${query}&code=${code}` : query),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        const target = window.sessionStorage.getItem('postLogin') || '/';
        window.sessionStorage.removeItem('postLogin');
        navigate(target, { replace: true });
      } else if (response.status === 401 && response.headers.get('WWW-Authenticate') === 'TOTP') {
        setCodeEnabled(true);
      } else {
        throw Error(await response.text());
      }
    } catch {
      setFailed(true);
      setPassword('');
    }
  };

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetch(`/api/session?token=${encodeURIComponent(token)}`);
    if (response.ok) {
      const user = await response.json();
      dispatch(sessionActions.updateUser(user));
      navigate('/');
    } else if (response.status === 401) {
      nativePostMessage('logout');
    }
  });

  const handleTokenLoginRef = useRef(handleTokenLogin);
  handleTokenLoginRef.current = handleTokenLogin;

  const handleOpenIdLogin = () => {
    document.location = '/api/session/openid/auth';
  };

  useEffect(() => nativePostMessage('authentication'), []);

  useEffect(() => {
    const listener = (token) => handleTokenLoginRef.current(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem('hostname') !== window.location.hostname) {
      window.localStorage.setItem('hostname', window.location.hostname);
      setShowServerTooltip(true);
    }
  }, []);

  return (
    <LoginLayout
      headerEnd={
        <div className={classes.headerActions}>
          {nativeEnvironment && changeEnabled && (
            <IconButton color="primary" onClick={() => navigate('/change-server')}>
              <Tooltip
                title={`${t('settingsServer')}: ${window.location.hostname}`}
                open={showServerTooltip}
                arrow
              >
                <VpnLockIcon />
              </Tooltip>
            </IconButton>
          )}
          {!nativeEnvironment && (
            <IconButton color="primary" onClick={() => setShowQr(true)}>
              <QrCode2Icon />
            </IconButton>
          )}
          {languageEnabled && (
            <FormControl>
              <div className={classes.languagePill}>
                <LanguageIcon className={classes.languageIcon} />
                <Select
                  value={language}
                  onChange={(e) => setLocalLanguage(e.target.value)}
                  variant="outlined"
                  className={classes.select}
                  IconComponent={ExpandMoreIcon}
                >
                  {languageList.map((it) => (
                    <MenuItem key={it.code} value={it.code}>
                      <span className={classes.flag}>
                        <CountryFlag
                          countryCode={it.country}
                          svg
                          style={{ marginRight: theme.spacing(1) }}
                        />
                      </span>
                      {it.name}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </FormControl>
          )}
        </div>
      }
    >
      <div className={classes.container}>
        <div className={classes.titleBlock}>
          <Typography variant="h4" className={classes.title}>
            {t('loginTitle')}
          </Typography>
          <Typography variant="body2" className={classes.subtitle}>
            {t('loginSubtitle')}
          </Typography>
        </div>
        {!!announcement && !announcementShown && (
          <Alert severity="info" onClose={() => setAnnouncementShown(true)}>
            {announcement}
          </Alert>
        )}
        {openIdEnabled && (
          <Button
            onClick={() => handleOpenIdLogin()}
            variant="outlined"
            className={classes.googleButton}
            startIcon={<GoogleIcon />}
            fullWidth
          >
            {t('loginOpenId')}
          </Button>
        )}
        {openIdEnabled && !openIdForced && <Divider>{t('loginOr')}</Divider>}
        {!openIdForced && (
          <>
            <div className={classes.field}>
              <Typography variant="body2" className={classes.label}>
                {`${t('userEmail')} *`}
              </Typography>
              <TextField
                required
                error={failed}
                placeholder={t('userEmail')}
                name="email"
                value={email}
                autoComplete="email"
                autoFocus={!email}
                onChange={(e) => setEmail(e.target.value)}
                helperText={failed && t('loginFailed')}
              />
            </div>
            <div className={classes.field}>
              <Typography variant="body2" className={classes.label}>
                {`${t('userPassword')} *`}
              </Typography>
              <PasswordField
                required
                error={failed}
                placeholder={t('userPassword')}
                name="password"
                value={password}
                autoComplete="current-password"
                autoFocus={!!email}
                onChange={(e) => setPassword(e.target.value)}
              />
              {emailEnabled && (
                <Link
                  onClick={() => navigate('/reset-password')}
                  className={classes.forgotLink}
                  underline="none"
                  variant="body2"
                >
                  {t('loginReset')}
                </Link>
              )}
            </div>
            {codeEnabled && (
              <TextField
                required
                error={failed}
                label={t('loginTotpCode')}
                name="code"
                value={code}
                type="number"
                onChange={(e) => setCode(e.target.value)}
              />
            )}
            <Button
              onClick={handlePasswordLogin}
              type="submit"
              variant="contained"
              color="secondary"
              className={classes.submit}
              disabled={!email || !password || (codeEnabled && !code)}
              fullWidth
            >
              {t('loginLogin')}
            </Button>
          </>
        )}
        {!openIdForced && registrationEnabled && (
          <Typography variant="body2" className={classes.registerPrompt}>
            {`${t('loginNoAccount')} `}
            <Link
              onClick={() => navigate('/register')}
              className={classes.registerLink}
              underline="none"
              variant="body2"
            >
              {t('loginRegister')}
            </Link>
          </Typography>
        )}
      </div>
      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
    </LoginLayout>
  );
};

export default LoginPage;
