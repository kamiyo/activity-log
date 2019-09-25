import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './App';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import deepOrange from '@material-ui/core/colors/deepOrange'
import green from '@material-ui/core/colors/green';

const secondary = deepOrange['A100'];
const primary = green[100];

const theme = createMuiTheme({
    palette: {
        primary: { main: primary, contrastText: 'rgba(40, 40, 40, 0.87)' },
        secondary: { main: secondary },
        type: 'dark',
    },
    overrides: {
        MuiTableCell: {
            root: {
                padding: '0.5rem 0.5rem 0.5rem 0.5rem',
                width: '100%',
            },
        },
        MuiIconButton: {
            root: {
                padding: '0.5rem',
            },
        },
        MuiInputLabel: {
            animated: {
                transition: 'color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
            }
        },
        MuiButton: {
            root: {
                transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                borderRadius: '4px',
            }
        },
        MuiFormControl: {
            root: {
                marginLeft: '0.5rem',
                marginRight: '0.5rem',
            }
        },
        MuiSvgIcon: {
            root: {
                transition: 'fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            }
        },
        MuiSnackbarContent: {
            root: {
                borderRadius: '4px',
            }
        },
        MuiListItem: {
            button: {
                transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            }
        }
    },
});

function main() {
    ReactDOM.render(
        (<ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>),
        document.getElementById('app'));
}

main();
