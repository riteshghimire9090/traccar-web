import { Select, MenuItem, FormControl } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { alpha, useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import CountryFlag from 'react-country-flag';
import LanguageIcon from '@mui/icons-material/Language';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLocalization } from '../common/components/LocalizationProvider';

const useStyles = makeStyles()((theme) => ({
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    borderRadius: 999,
    padding: theme.spacing(0.5, 1.5),
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
  icon: {
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
  flag: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const LanguageSelector = () => {
  const { classes } = useStyles();
  const theme = useTheme();
  const { languages, language, setLocalLanguage } = useLocalization();

  const languageEnabled = useSelector((state) => {
    const attributes = state.session.server.attributes;
    return !attributes.language && !attributes['ui.disableLoginLanguage'];
  });

  if (!languageEnabled) {
    return null;
  }

  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    country: values[1].country,
    name: values[1].name,
  }));

  return (
    <FormControl>
      <div className={classes.pill}>
        <LanguageIcon className={classes.icon} />
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
  );
};

export default LanguageSelector;
