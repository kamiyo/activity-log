import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import green from '@material-ui/core/colors/green';
import deepOrange from '@material-ui/core/colors/deepOrange'

import ActivityList from './ActivityList';

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
        }
    },
});

const App: React.SFC<{}> = () => {
    return (
        <div>
            <ThemeProvider theme={theme}>
                <AppBar position="fixed" elevation={2}>
                    <Toolbar>
                        <Typography variant="h5">
                            Activity Log
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Toolbar />
                <ActivityList />

            </ThemeProvider>
        </div>
    )
};

export default App;