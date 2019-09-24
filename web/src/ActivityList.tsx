import * as React from 'react';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListSubheader, { ListSubheaderProps } from '@material-ui/core/ListSubheader';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import Divider from '@material-ui/core/Divider';
import throttle from 'lodash/throttle';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { DateTime, Duration } from 'luxon';
import { makeStyles, createStyles, withStyles, WithStyles } from '@material-ui/styles';
import axios from 'axios';
import { useTheme, Theme } from '@material-ui/core';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import activityReducer, {
    initialState,
} from './reducers';
import {
    Data,
    State,
    Action,
    DataGroup,
    ActivityKeys,
} from './types';
import { FlexBasisProperty, TextAlignProperty, GlobalsNumber } from 'csstype';
import ActivityDialog from './ActivityDialog';
import { fetchDataAction } from './actions';
import Color from 'color';
import { activityTypeMap } from './GroupedArray';

const DEV_API_KEY = 'rusr0nlautNPE0+jVCkXQFByOVgvGHKVZ+zyw05/58I=';

axios.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${DEV_API_KEY}`;
    return config;
});

const EditButton = withStyles(() => ({
    root: {
        backgroundColor: green[600],
        color: 'white',
        '&:hover': {
            backgroundColor: green[800],
        }
    },
}))(Fab);

const fabs = (classes: { fab: string }) => ([
    {
        color: 'secondary' as 'secondary',
        className: classes.fab,
        icon: <AddIcon />,
        label: 'Add',
    },
    {
        color: 'secondary' as 'secondary',
        className: classes.fab,
        icon: <EditIcon />,
        label: 'Edit',
    },
]);

interface Column {
    id: 'dateTime' | 'type' | 'amount';
    minWidth?: string;
    align?: 'center' | 'left' | 'right';
    format: (...args: any) => string;
    gridWidth?: boolean | "auto" | 3 | 1 | 2 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    flexBasis?: FlexBasisProperty<number>;
    flexGrow?: GlobalsNumber;
    textAlign?: TextAlignProperty;
    className?: string;
}

const getTimeAgo = (dateTime: DateTime) => {
    const now = DateTime.local();
    const diff = now.diff(dateTime, ['hours', 'minutes']);
    const hours = diff.hours;
    const minutes = Math.round(diff.minutes);
    return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''} ago`;
};

const formatDuration = (dur: Duration) => {
    const hours = dur.hours;
    const minutes = Math.round(dur.minutes);
    return `-${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`;
};

const getTimeSince = (a: DateTime, b: DateTime) => {
    const diff = b.diff(a, ['hours', 'minutes']);
    const hours = diff.hours;
    const minutes = Math.round(diff.minutes);
    return `-${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`;
};

const columns: Column[] = [
    {
        id: 'dateTime',
        format: (dateTime: DateTime) => {
            return dateTime.toLocaleString(DateTime.TIME_24_SIMPLE);
        },
        gridWidth: 8,
        flexBasis: 'auto',
        flexGrow: 1,
        textAlign: 'left',
        className: 'dateTimeColumn',
    },
    {
        id: 'type',
        format: (type: ActivityKeys) => {
            return type ? activityTypeMap[type].emoji : '';
        },
        minWidth: '2rem',
        align: 'center',
        flexBasis: '2rem',
        gridWidth: 'auto',
        flexGrow: 0,
        textAlign: 'center',
        className: 'emojiColumn',
    },
    {
        id: 'amount',
        format: (amount: string, type: ActivityKeys) => {
            const units = activityTypeMap[type] ? activityTypeMap[type].units : '';
            return (amount && units) ? `${amount} ${units}` : '';
        },
        minWidth: '3rem',
        flexBasis: '4.2rem',
        gridWidth: 'auto',
        flexGrow: 0,
        textAlign: 'left',
        className: 'amountColumn',
    },
];

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        width: '100%',
        [theme.breakpoints.up('lg')]: {
            margin: '2rem auto',
            maxWidth: '800px',
        },
        margin: 'auto',
    },
    tableWrapper: {
        [`${theme.breakpoints.up(0)} and (orientation:landscape)`]: {
            height: `calc(100vh - 48px)`,
        },
        [theme.breakpoints.up('sm')]: {
            height: `calc(100vh - 64px)`,
        },
        height: `calc(100vh - 56px)`,
        overflow: 'auto',
    },
    stickyHeader: {
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        backgroundColor: theme.palette.grey[700],
    },
    mainList: {
        paddingTop: 0,
        paddingBottom: '5rem',
    },
    list: {
        padding: 0,
    },
    listText: {
        margin: 0,
    },
    dateTimeColumn: {
        display: 'flex',
        alignItems: 'flex-start',
    },
    emojiColumn: {
        display: 'flex',
        justifyContent: 'center',
    },
    amountColumn: {},
    secondaryText: {
        display: 'block',
        marginLeft: '0.5rem',
        marginTop: '0.2rem',
    },
    aside: {
        fontSize: '0.8rem',
        color: '#8c8c8c',
        display: 'block',
        marginLeft: '0.5rem',
    },
    fab: {
        position: 'absolute',
        zIndex: 100,
        bottom: theme.spacing(3),
        right: theme.spacing(3),
    },
    grid: (basis: string | number) => ({
        flexBasis: basis,
    }),
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

export const ActivityListContext = React.createContext<{ state: State; dispatch: React.Dispatch<Action>; }>(
    { state: initialState, dispatch: (value) => { } }
);

const onScroll = (threshold: number, fetchData: () => Promise<void>) =>
    (event: React.SyntheticEvent<HTMLDivElement, Event>) => {
        const el = (event.target as HTMLDivElement);
        const height = el.getBoundingClientRect().height;
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight;
        if (height + scrollTop >= scrollHeight - threshold) {
            fetchData();
        }
    };

const ActivityList: React.FC<{}> = () => {
    const theme = useTheme();
    const classes = useStyles(theme);
    const [state, dispatch] = React.useReducer(activityReducer, initialState);
    const [selected, handleSelect] = React.useState<Data>(null);
    const [dialogOpen, handleOpenDialog] = React.useState(false);
    const [isEdit, handleIsEdit] = React.useState(false);
    const debouncedScroll = throttle(onScroll(100, fetchDataAction(state, dispatch)), 250);
    const [snackbarOpen, handleSnackbarOpen] = React.useState(false);

    React.useEffect(() => {
        const fetchData = fetchDataAction(state, dispatch);
        fetchData();
    }, []);

    React.useEffect(() => {
        if (state.requestInFlight === false) {
            handleOpenDialog(false);
        }
    }, [state.requestInFlight]);

    React.useEffect(() => {
        if (Object.entries(state.response).length !== 0 && state.response.constructor === Object) {
            handleSnackbarOpen(true);
        }
    }, [state.response]);

    const MyListSubheader: React.ComponentType<ListSubheaderProps & PaperProps> = ListSubheader;

    const SnackIcon = state.error ? ErrorIcon : CheckCircleIcon;
    return (
        <ActivityListContext.Provider value={{ state, dispatch }}>
            <Paper className={classes.root} square>
                <div
                    className={classes.tableWrapper}
                    onScroll={(event) => {
                        event.persist();
                        debouncedScroll(event);
                    }}
                >
                    <List className={classes.mainList}>
                        {state.activities.map((section: DataGroup, idy) => {
                            return (
                                <li key={section.dateTime.toISODate()}>
                                    <ul key={`${section.dateTime.toISODate()}-ul`} className={classes.list}>
                                        <MyListSubheader
                                            className={classes.stickyHeader}
                                            component={Paper}
                                            elevation={1}
                                            key={`${section.dateTime.toISODate()}-sub`}
                                            square
                                        >
                                            <Grid
                                                container
                                                justify={'space-between'}
                                                alignItems={'center'}
                                                spacing={0}
                                            >
                                                <Grid item>
                                                    <Typography variant="subtitle1">
                                                        {section.dateTime.toLocaleString({ ...DateTime.DATE_SHORT, weekday: 'short' })}
                                                    </Typography>
                                                </Grid>
                                                <Grid item style={{ lineHeight: 'normal' }}>
                                                    <Typography variant="caption">
                                                        {Object.entries(section.amount).reduce((prev, [k, v]: [ActivityKeys, number], idx) => {
                                                            prev.push(<span key={k}>{`${activityTypeMap[k].emoji} ${v} ${activityTypeMap[k].units}`}</span>);
                                                            if (idx === 0) {
                                                                prev.push(' | ');
                                                            }
                                                            return prev;
                                                        }, [])}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </MyListSubheader>
                                        {section.data.map((activity: Data, idx, arr) => {
                                            return (
                                                <React.Fragment key={idx}>
                                                    {(idx !== 0) && (
                                                        <Divider />
                                                    )}
                                                    <ListItem
                                                        key={`${activity.dateTime.toISO()}-${activity.type}`}
                                                        button
                                                        onClick={() => {
                                                            handleSelect(activity);
                                                            handleIsEdit(true);
                                                            handleOpenDialog(true);
                                                        }}
                                                    >
                                                        <Grid
                                                            container
                                                            justify={'space-between'}
                                                            alignItems={'flex-start'}
                                                            spacing={0}
                                                        >
                                                            {columns.map(column => {
                                                                const value = activity[column.id];
                                                                const { flexBasis, flexGrow, textAlign, align, gridWidth, className } = column;
                                                                const primaryProps: Partial<TypographyProps> = { align };
                                                                const columnClass = classes[column.className as keyof typeof classes] || '';
                                                                return (
                                                                    <Grid
                                                                        key={column.id}
                                                                        item
                                                                        xs={gridWidth}
                                                                        style={{
                                                                            flexBasis,
                                                                            flexGrow,
                                                                            textAlign
                                                                        }}
                                                                    >
                                                                        <ListItemText
                                                                            className={`${classes.listText} ${columnClass}`}
                                                                            disableTypography
                                                                            primary={
                                                                                <Typography {...primaryProps}>{column.format(value, activity.type)}</Typography>
                                                                            }
                                                                            secondary={
                                                                                (value instanceof DateTime)
                                                                                    ? <div className={classes.secondaryText}>
                                                                                        <Typography className={classes.aside}>
                                                                                            {
                                                                                                (activity.timeBeforePrev === null)
                                                                                                    ? getTimeAgo(value)
                                                                                                    : formatDuration(activity.timeBeforePrev)
                                                                                            }
                                                                                        </Typography>
                                                                                        {(activity.notes) &&
                                                                                            <Typography className={classes.aside}>
                                                                                                {activity.notes}
                                                                                            </Typography>
                                                                                        }
                                                                                    </div>
                                                                                    : null
                                                                            }
                                                                        />
                                                                    </Grid>
                                                                );
                                                            })}
                                                        </Grid>
                                                    </ListItem>
                                                </React.Fragment>
                                            );
                                        })}
                                    </ul>
                                </li>
                            );
                        })}
                    </List>
                </div>
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
            </Paper>
            <ActivityDialog
                open={dialogOpen}
                activity={isEdit ? selected :
                    {
                        id: '',
                        dateTime: selected ? selected.dateTime : DateTime.local(),
                        type: 'meal',
                        amount: '',
                        notes: ''
                    }
                }
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
                    ]}></SnackbarContent>
            </Snackbar>
        </ActivityListContext.Provider>
    );
}

export default ActivityList;