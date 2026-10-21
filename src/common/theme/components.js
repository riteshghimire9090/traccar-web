export default {
  MuiUseMediaQuery: {
    defaultProps: {
      noSsr: true,
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.default,
        borderRadius: theme.shape.borderRadius,
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: '1.5px',
        },
      }),
      notchedOutline: ({ theme }) => ({
        borderColor: theme.palette.divider,
      }),
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 10,
        fontWeight: 600,
      },
      sizeMedium: {
        height: '40px',
      },
      contained: ({ theme }) => ({
        transition: theme.transitions.create(['box-shadow', 'transform'], { duration: 150 }),
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-1px)',
        },
      }),
      outlined: ({ theme }) => ({
        borderColor: theme.palette.divider,
      }),
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: 'small',
    },
  },
  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      enterDelay: 500,
      enterNextDelay: 500,
    },
    styleOverrides: {
      tooltip: ({ theme }) => ({
        borderRadius: 8,
        fontSize: '0.75rem',
        backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : 'rgba(30, 41, 59, 0.92)',
        backdropFilter: 'blur(4px)',
      }),
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: {
        borderRadius: 14,
      },
      outlined: ({ theme }) => ({
        borderColor: theme.palette.divider,
      }),
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        overflow: 'hidden',
      },
    },
  },
  MuiAppBar: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      colorInherit: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
      },
      list: {
        padding: 6,
      },
    },
  },
  MuiPopover: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: '0 4px',
        width: 'auto',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 500,
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderColor: theme.palette.divider,
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderColor: theme.palette.divider,
        '@media print': {
          color: theme.palette.alwaysDark.main,
        },
      }),
      head: ({ theme }) => ({
        fontWeight: 600,
        color: theme.palette.text.secondary,
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.06)' : 'rgba(15, 23, 42, 0.03)',
      }),
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }) => ({
        transition: theme.transitions.create('background-color', { duration: 100 }),
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.06)' : 'rgba(15, 23, 42, 0.03)',
        },
      }),
    },
  },
};
