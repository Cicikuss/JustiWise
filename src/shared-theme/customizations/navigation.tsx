import * as React from 'react';
import { Theme, alpha, Components } from '@mui/material/styles';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { buttonBaseClasses } from '@mui/material/ButtonBase';
import { dividerClasses } from '@mui/material/Divider';
import { menuItemClasses } from '@mui/material/MenuItem';
import { selectClasses } from '@mui/material/Select';
import { tabClasses } from '@mui/material/Tab';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import { gray, brand } from '../themePrimitives';

/* eslint-disable import/prefer-default-export */
export const navigationCustomizations: Components<Theme> = {
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius, // theme.vars kaldırıldı
        padding: '6px 8px',
        [`&.${menuItemClasses.focusVisible}`]: {
          backgroundColor: 'transparent',
        },
        [`&.${menuItemClasses.selected}`]: {
          [`&.${menuItemClasses.focusVisible}`]: {
            backgroundColor: alpha(theme.palette.action.selected, 0.3),
          },
        },
      }),
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: ({ theme }) => ({
        marginTop: '4px',
        borderRadius: theme.shape.borderRadius, // theme.vars kaldırıldı
        border: `1px solid ${theme.palette.divider}`, // theme.vars kaldırıldı
        backgroundImage: 'none',
        background: 'hsl(0, 0%, 100%)',
        boxShadow:
          'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
      }),
    },
  },
  MuiSelect: {
    defaultProps: {
      IconComponent: React.forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
        <UnfoldMoreRoundedIcon fontSize="small" {...props} ref={ref} />
      )),
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius, // theme.vars kaldırıldı
        border: '1px solid',
        borderColor: gray[200],
        backgroundColor: theme.palette.background.paper, // theme.vars kaldırıldı
        '&:hover': {
          borderColor: gray[300],
          backgroundColor: theme.palette.background.paper, // theme.vars kaldırıldı
        },
      }),
    },
  },
  MuiLink: {
    defaultProps: {
      underline: 'none',
    },
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.palette.text.primary, // theme.vars kaldırıldı
      }),
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.background.default, // theme.vars kaldırıldı
      }),
    },
  },
  MuiPaginationItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.Mui-selected': {
          color: 'white',
          backgroundColor: theme.palette.grey[900], // theme.vars kaldırıldı
        },
      }),
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: ({ theme }) => ({
        backgroundColor: theme.palette.grey[800], // theme.vars kaldırıldı
      }),
    },
  },
  MuiTab: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.palette.text.secondary, // theme.vars kaldırıldı
        borderRadius: theme.shape.borderRadius, // theme.vars kaldırıldı
      }),
    },
  },
  MuiStepConnector: {
    styleOverrides: {
      line: ({ theme }) => ({
        borderColor: theme.palette.divider, // theme.vars kaldırıldı
      }),
    },
  },
  MuiStepIcon: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.Mui-active': {
          color: theme.palette.primary.main, // theme.vars kaldırıldı
        },
        '&.Mui-completed': {
          color: theme.palette.success.main, // theme.vars kaldırıldı
        },
      }),
    },
  },
};
