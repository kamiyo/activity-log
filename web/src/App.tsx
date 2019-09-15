import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import pink from '@material-ui/core/colors/pink';
import purple from '@material-ui/core/colors/purple';

import ActivityList from './ActivityList';

const primary = pink[100];
const secondary = purple[200];

const theme = createMuiTheme({
    palette: {
        primary: { main: primary },
        secondary: { main: secondary },
    },
    overrides: {
        MuiTableCell: {
            root: {
                padding: '0.5rem 0.5rem 0.5rem 0.5rem',
                tableLayout: 'fixed',
                width: '100%',
            }
        }
    }
});

const App: React.SFC<{}> = () => {
    return (
        <div>
            <ThemeProvider theme={theme}>
                {/* <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6">
                            Activity Log
                        </Typography>
                    </Toolbar>
                </AppBar> */}
                <ActivityList />

            </ThemeProvider>
        </div>
    )
};

export default App;