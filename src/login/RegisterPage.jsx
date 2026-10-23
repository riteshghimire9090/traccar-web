import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import LoginLayout from './LoginLayout';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatch, useAsyncTask } from '../reactHelper';
import { messagesActions, sessionActions } from '../store';
import LoginField from './LoginField';
import LanguageSelector from './LanguageSelector';
import AuthHeading from './AuthHeading';
import AuthPrompt from './AuthPrompt';
import heroIllustration from '../resources/images/login/hero-illustration-desktop.jpg';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
  },
  submit: {
    height: 56,
  },
}));

const RegisterPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const server = useSelector((state) => state.session.server);
  const totpForce = useSelector((state) => state.session.server.attributes.totpForce);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpKey, setTotpKey] = useState(null);

  useAsyncTask(
    async ({ signal }) => {
      if (totpForce) {
        const response = await fetchOrThrow('/api/users/totp', { method: 'POST', signal });
        setTotpKey(await response.text());
      }
    },
    [totpForce, setTotpKey],
  );

  const handleSubmit = useCatch(async (event) => {
    event.preventDefault();
    await fetchOrThrow('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, totpKey }),
    });
    dispatch(messagesActions.push({ message: t('loginCreated'), severity: 'success' }));
    dispatch(sessionActions.updateServer({ ...server, newServer: false }));
    navigate('/login');
  });

  return (
    <LoginLayout headerEnd={<LanguageSelector />} heroIllustration={heroIllustration}>
      <div className={classes.container}>
        <AuthHeading subtitle={t('loginRegisterSubtitle')} />
        <LoginField
          required
          label={t('sharedName')}
          name="name"
          value={name}
          autoComplete="name"
          autoFocus
          onChange={(event) => setName(event.target.value)}
        />
        <LoginField
          required
          type="email"
          label={t('userEmail')}
          name="email"
          value={email}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />
        <LoginField
          required
          secret
          label={t('userPassword')}
          name="password"
          value={password}
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
        />
        {totpForce && (
          <LoginField
            required
            label={t('loginTotpKey')}
            name="totpKey"
            value={totpKey || ''}
            slotProps={{
              input: { readOnly: true },
            }}
          />
        )}
        <Button
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={handleSubmit}
          type="submit"
          disabled={!name || !password || !(server.newServer || /(.+)@(.+)\.(.{2,})/.test(email))}
          fullWidth
        >
          {t('loginRegister')}
        </Button>
        {!server.newServer && (
          <AuthPrompt
            prompt={t('loginHaveAccount')}
            actionLabel={t('loginSignIn')}
            onAction={() => navigate('/login')}
          />
        )}
      </div>
    </LoginLayout>
  );
};

export default RegisterPage;
