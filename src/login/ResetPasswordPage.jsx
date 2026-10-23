import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginLayout from './LoginLayout';
import { useTranslation } from '../common/components/LocalizationProvider';
import { messagesActions } from '../store';
import { useCatch } from '../reactHelper';
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

const ResetPasswordPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('passwordReset');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCatch(async (event) => {
    event.preventDefault();
    if (!token) {
      await fetchOrThrow('/api/password/reset', {
        method: 'POST',
        body: new URLSearchParams(`email=${encodeURIComponent(email)}`),
      });
    } else {
      await fetchOrThrow('/api/password/update', {
        method: 'POST',
        body: new URLSearchParams(
          `token=${encodeURIComponent(token)}&password=${encodeURIComponent(password)}`,
        ),
      });
    }
    dispatch(
      messagesActions.push({
        message: t(!token ? 'loginResetSuccess' : 'loginUpdateSuccess'),
        severity: 'success',
      }),
    );
    navigate('/login');
  });

  return (
    <LoginLayout headerEnd={<LanguageSelector />} heroIllustration={heroIllustration}>
      <div className={classes.container}>
        <AuthHeading subtitle={t(!token ? 'loginResetSubtitle' : 'loginUpdateSubtitle')} />
        {!token ? (
          <LoginField
            required
            type="email"
            label={t('userEmail')}
            name="email"
            value={email}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
          />
        ) : (
          <LoginField
            required
            secret
            label={t('userPassword')}
            name="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
        <Button
          variant="contained"
          color="primary"
          className={classes.submit}
          type="submit"
          onClick={handleSubmit}
          disabled={!/(.+)@(.+)\.(.{2,})/.test(email) && !password}
          fullWidth
        >
          {t('loginReset')}
        </Button>
        <AuthPrompt
          prompt={t('loginHaveAccount')}
          actionLabel={t('loginSignIn')}
          onAction={() => navigate('/login')}
        />
      </div>
    </LoginLayout>
  );
};

export default ResetPasswordPage;
