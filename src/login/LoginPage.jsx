import { useEffect, useRef, useState } from 'react';
import { Button, Link, Alert, IconButton, Tooltip, Divider } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sessionActions } from '../store';
import { useTranslation } from '../common/components/LocalizationProvider';
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
import LoginField from './LoginField';
import LanguageSelector from './LanguageSelector';
import AuthHeading from './AuthHeading';
import AuthPrompt from './AuthPrompt';

const useStyles = makeStyles()((theme) => ({
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
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
}));

const LoginPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const [failed, setFailed] = useState(false);

  const [email, setEmail] = usePersistedState('loginEmail', '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showServerTooltip, setShowServerTooltip] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const registrationEnabled = useSelector((state) => state.session.server.registration);
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
          <LanguageSelector />
        </div>
      }
    >
      <div className={classes.container}>
        <AuthHeading subtitle={t('loginSubtitle')} />
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
            <LoginField
              required
              error={failed}
              label={t('userEmail')}
              name="email"
              value={email}
              autoComplete="email"
              autoFocus={!email}
              onChange={(e) => setEmail(e.target.value)}
              helperText={failed && t('loginFailed')}
            />
            <LoginField
              required
              secret
              error={failed}
              label={t('userPassword')}
              name="password"
              value={password}
              autoComplete="current-password"
              autoFocus={!!email}
              onChange={(e) => setPassword(e.target.value)}
              extra={
                emailEnabled && (
                  <Link
                    onClick={() => navigate('/reset-password')}
                    className={classes.forgotLink}
                    underline="none"
                    variant="body2"
                  >
                    {t('loginReset')}
                  </Link>
                )
              }
            />
            {codeEnabled && (
              <LoginField
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
              color="primary"
              className={classes.submit}
              disabled={!email || !password || (codeEnabled && !code)}
              fullWidth
            >
              {t('loginLogin')}
            </Button>
          </>
        )}
        {!openIdForced && registrationEnabled && (
          <AuthPrompt
            prompt={t('loginNoAccount')}
            actionLabel={t('loginRegister')}
            onAction={() => navigate('/register')}
          />
        )}
      </div>
      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
    </LoginLayout>
  );
};

export default LoginPage;
