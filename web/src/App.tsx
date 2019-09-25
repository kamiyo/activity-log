import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { Theme } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/styles';
import green from '@material-ui/core/colors/green';
import AddIcon from '@material-ui/icons/Add';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles, createStyles } from '@material-ui/styles';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import ActivityList from './ActivityList';
import activityReducer, { initialState } from './reducers';
import { State, Action, Data, ActivityActionTypes } from './types';
import ActivityDialog from './ActivityDialog';
import { DateTime } from 'luxon';
import { Fab } from '@material-ui/core';
import Color from 'color';
import red from '@material-ui/core/colors/red';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import LoginPage from './LoginPage';
import Drawer from './Drawer';

export const ActivityListContext = React.createContext<{ state: State; dispatch: React.Dispatch<Action>; }>(
    { state: initialState, dispatch: (_) => { } }
);

const useStyles = makeStyles((theme: Theme) => createStyles({
    fab: {
        position: 'absolute',
        zIndex: 100,
        bottom: theme.spacing(3),
        right: theme.spacing(3),
    },
    snackbar: {
        [theme.breakpoints.down('xs')]: {
            bottom: 90,
        },
    },
    snackbarContent: {
        backgroundColor: Color(theme.palette.primary.main).desaturate(0.95).darken(0.85).string(),
        color: Color(theme.palette.primary.main).lighten(0.1).string(),
    },
    snackbarMessage: {
        display: 'flex',
        alignItems: 'center',
    },
    snackError: {
        color: Color(red[500]).fade(0.2).lighten(0.2).string(),
        marginRight: '0.5rem',
    },
    snackSuccess: {
        color: Color(green[800]).fade(0.2).string(),
        marginRight: '0.5rem',
    },
    closeIcon: {

    },
}));

const App: React.SFC<{}> = () => {
    const [state, dispatch] = React.useReducer(activityReducer, initialState);
    const theme = useTheme();
    const classes = useStyles(theme);
    const [selected, handleSelect] = React.useState<Data>(null);
    const [dialogOpen, handleOpenDialog] = React.useState(false);
    const [isEdit, handleIsEdit] = React.useState(false);
    const [snackbarOpen, handleSnackbarOpen] = React.useState(false);
    const [menuOpen, handleMenuOpen] = React.useState(false);
    const SnackIcon = state.error ? ErrorIcon : CheckCircleIcon;

    React.useEffect(() => {
        if (state.requestInFlight === false) {
            handleOpenDialog(false);
        }
    }, [state.requestInFlight]);

    React.useEffect(() => {
        if (Object.entries(state.response).length !== 0
            && state.response.constructor === Object
            && state.response.status !== 0) {
            handleSnackbarOpen(true);
        }
    }, [state.response]);

    React.useEffect(() => {
        if (state.loggedIn === false)
            handleMenuOpen(false);
    }, [state.loggedIn])

    const getInitialDialogState = (): Data => ({
        id: '',
        dateTime: selected ? selected.dateTime : DateTime.local(),
        type: 'meal',
        amount: '',
        notes: ''
    });

    return (
        <ActivityListContext.Provider value={{ state, dispatch }}>
            <AppBar position="fixed" elevation={2}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => handleMenuOpen(!menuOpen)}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h5">
                        Activity Log
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer menuOpen={menuOpen} handleMenuOpen={handleMenuOpen} />
            <Toolbar />
            {(state.loggedIn) ?
                <>
                    <ActivityList
                        handleSelect={handleSelect}
                        handleIsEdit={handleIsEdit}
                        handleOpenDialog={handleOpenDialog}
                    />
                    <Fab
                        className={classes.fab}
                        color="secondary"
                        onClick={() => {
                            handleIsEdit(false);
                            handleOpenDialog(true);
                        }}
                    >
                        <AddIcon />
                    </Fab>
                </>
                : <LoginPage />
            }
            <ActivityDialog
                open={dialogOpen}
                activity={isEdit ? selected : getInitialDialogState()}
                edit={isEdit}
                handleClose={() => handleOpenDialog(false)}
            />
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                className={classes.snackbar}
                onClose={() => handleSnackbarOpen(false)}
            >
                <SnackbarContent
                    className={classes.snackbarContent}
                    message={
                        <span className={classes.snackbarMessage}>
                            <SnackIcon className={classes[(state.error) ? 'snackError' : 'snackSuccess']} />
                            {state.response.message}
                        </span>
                    }
                    action={[
                        <IconButton key="close" color="inherit" onClick={() => handleSnackbarOpen(false)}>
                            <CloseIcon className={classes.closeIcon} />
                        </IconButton>
                    ]}
                />
            </Snackbar>
        </ActivityListContext.Provider>
    )
};

export default App;