import * as React from 'react';
import Paper from '@material-ui/core/Paper'
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles, createStyles, withStyles, useTheme } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { ActivityListContext } from './App';
import Color from 'color';
import { loginAction } from './actions';

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        margin: '0 2rem',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem',
        width: '100%',
    },
    wrapper: {
        [`${theme.breakpoints.up(0)} and (orientation:landscape)`]: {
            height: `calc(100vh - 48px)`,
        },
        [theme.breakpoints.up('sm')]: {
            height: `calc(100vh - 64px)`,
        },
        height: `calc(100vh - 56px)`,
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButton: {
        marginTop: '2rem',
    }
}));

const LoginPage: React.FC<{}> = () => {
    const theme = useTheme();
    const classes = useStyles(theme);
    const { state, dispatch } = React.useContext(ActivityListContext);
    const [{ username, password }, updateCredentials] = React.useState({ username: '', password: '' });

    return (
        <div className={classes.wrapper}>
            <Paper className={classes.root}>
                <Typography>Please sign in.</Typography>
                <Divider />
                <TextField
                    margin="normal"
                    id="username"
                    label="Username"
                    value={username}
                    onChange={(event) => {
                        updateCredentials({
                            username: event.target.value,
                            password,
                        });
                    }}
                    error={state.response.status === 403}
                />
                <TextField
                    margin="normal"
                    id="password"
                    label="Password"
                    value={password}
                    onChange={(event) => {
                        updateCredentials({
                            username,
                            password: event.target.value,
                        });
                    }}
                    error={state.response.status === 403}
                    type="password"
                />
                <Button
                    disabled={state.requestInFlight}
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        loginAction(username, password, state, dispatch)();
                    }}
                    className={classes.loginButton}
                >
                    {state.requestInFlight ? <CircularProgress size={16} /> : 'Login'}
                </Button>
            </Paper>
        </div>
    );
}

export default LoginPage;