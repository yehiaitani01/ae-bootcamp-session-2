import { createTheme } from '@mui/material/styles';

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

const TOKENS = {
  light: {
    primary: '#0F7AC4',
    primaryDark: '#0B6FB8',
    primaryLight: '#1E9BE8',
    secondary: '#1C8F78',
    warning: '#C97A00',
    danger: '#D8364F',
    bgTop: '#E8F6FF',
    bgBottom: '#D6F5EC',
    surface: 'rgba(255,255,255,0.78)',
    text: '#14324A',
    textMuted: '#4F6D85',
    border: 'rgba(20,50,74,0.12)',
    shadow: '0 2px 8px rgba(20,50,74,0.08)',
    shadowRaised: '0 6px 20px rgba(20,50,74,0.12)',
  },
  dark: {
    primary: '#5BBDF7',
    primaryDark: '#3AA5E8',
    primaryLight: '#8AD2FA',
    secondary: '#4FD1B5',
    warning: '#FFB84D',
    danger: '#FF7A8C',
    bgTop: '#0B1E2D',
    bgBottom: '#0E2B33',
    surface: 'rgba(20,44,62,0.72)',
    text: '#E6F3FA',
    textMuted: '#A9C2D4',
    border: 'rgba(230,243,250,0.14)',
    shadow: '0 2px 8px rgba(0,0,0,0.3)',
    shadowRaised: '0 6px 20px rgba(0,0,0,0.4)',
  },
};

export function createAppTheme(mode = 'light') {
  const t = TOKENS[mode];
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: t.primary,
        dark: t.primaryDark,
        light: t.primaryLight,
        contrastText: isDark ? '#0B1E2D' : '#FFFFFF',
      },
      secondary: { main: t.secondary },
      warning: { main: t.warning },
      error: { main: t.danger },
      success: { main: t.secondary },
      text: { primary: t.text, secondary: t.textMuted },
      divider: t.border,
      background: { default: t.bgTop, paper: t.surface },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: FONT_STACK,
      fontSize: 16,
      htmlFontSize: 16,
      h1: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em' },
      h2: { fontSize: '1.25rem', fontWeight: 600 },
      h3: { fontSize: '1rem', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          body {
            min-height: 100vh;
            background: linear-gradient(160deg, ${t.bgTop} 0%, ${t.bgBottom} 100%) fixed;
          }
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              transition-duration: 0.01ms !important;
            }
          }
        `,
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${isDark ? t.border : 'rgba(255,255,255,0.6)'}`,
            boxShadow: t.shadow,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 24, boxShadow: '0 16px 40px rgba(20,50,74,0.18)' },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 999, minHeight: 44, paddingInline: 20 },
          containedPrimary: {
            background: `linear-gradient(180deg, ${t.primary} 0%, ${t.primaryDark} 100%)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.45), ${t.shadow}`,
            '&:hover': { boxShadow: `inset 0 1px 0 rgba(255,255,255,0.45), ${t.shadowRaised}` },
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          primary: {
            background: `linear-gradient(180deg, ${t.primary} 0%, ${t.primaryDark} 100%)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.45), ${t.shadowRaised}`,
          },
        },
      },
      MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
      MuiCheckbox: { styleOverrides: { root: { padding: 11 } } },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            minHeight: 44,
            textTransform: 'none',
            fontWeight: 600,
            '&.Mui-selected': { color: t.primary, backgroundColor: `${t.primary}22` },
          },
        },
      },
      MuiToggleButtonGroup: { styleOverrides: { root: { borderRadius: 999 } } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiMenuItem: { styleOverrides: { root: { minHeight: 44 } } },
    },
  });
}
