import * as React from 'react';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListSubheader, { ListSubheaderProps } from '@material-ui/core/ListSubheader';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import throttle from 'lodash/throttle';
import { DateTime } from 'luxon';
import { makeStyles, createStyles } from '@material-ui/styles';
import { useTheme, Theme } from '@material-ui/core';
import LinearProgress from '@material-ui/core/LinearProgress';
import {
    Data,
    DataGroup,
    ActivityKeys,
} from './types';
import { FlexBasisProperty, TextAlignProperty, GlobalsNumber } from 'csstype';
import { fetchDataAction } from './actions';
import { activityTypeMap } from './GroupedArray';
import { ActivityListContext } from './App';
import { getTimeAgo, formatInterval } from './utils';

const SCROLL_THRESHOLD = 100;

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

const columns: Column[] = [
    {
        id: 'dateTime',
        format: (dateTime: DateTime): string => {
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
        format: (type: ActivityKeys): string => {
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
        format: (amount: string, type: ActivityKeys): string => {
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
            margin: 'auto',
        },
        margin: 'auto',
    },
    tableWrapper: {
        [`${theme.breakpoints.up(0)} and (orientation:landscape)`]: {
            height: `calc(100vh - 48px)`,
        },
        [theme.breakpoints.up('sm')]: {
            height: `calc(100vh - 64px)`,
            display: 'flex',
            justifyContent: 'center',
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
        maxWidth: '800px',
        width: '100%',
        margin: 'auto',
        [theme.breakpoints.up('lg')]: {
            paddingTop: '2rem',
            flex: '1 1 auto',
        },
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
    grid: (basis: string | number) => ({
        flexBasis: basis,
    }),
    loading: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
}));

const onScroll = (fetchData: () => Promise<void>) =>
    (event: React.SyntheticEvent<HTMLDivElement, Event>): void => {
        const el = (event.target as HTMLDivElement);
        const height = el.getBoundingClientRect().height;
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight;
        if (height + scrollTop >= scrollHeight - SCROLL_THRESHOLD) {
            fetchData();
        }
    };

export interface ActivityListProps {
    handleSelect: (data: Data) => void;
    handleIsEdit: (isEdit: boolean) => void;
    handleOpenDialog: (open: boolean) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ handleSelect, handleIsEdit, handleOpenDialog }) => {
    const theme = useTheme();
    const classes = useStyles(theme);
    const { state, dispatch } = React.useContext(ActivityListContext);
    const scrollContainerRef = React.useRef<HTMLDivElement>();

    const debouncedScroll = throttle(onScroll(fetchDataAction(state, dispatch)), 250);

    React.useEffect(() => {
        if (state.loggedIn) {
            fetchDataAction(state, dispatch)();
        }
    }, [state.loggedIn]);

    React.useEffect(() => {
        if (state.loggedIn) {
            const el = scrollContainerRef.current;
            const height = el.getBoundingClientRect().height;
            const scrollTop = el.scrollTop;
            const scrollHeight = el.scrollHeight;
            if (height + scrollTop >= scrollHeight - SCROLL_THRESHOLD) {
                console.log(state.hasMore);
                fetchDataAction(state, dispatch);
            }
        }
    }, [state.activities])

    const MyListSubheader: React.ComponentType<ListSubheaderProps & PaperProps> = ListSubheader;

    return (
        <Paper className={classes.root} square>
            <div
                className={classes.tableWrapper}
                ref={scrollContainerRef}
                onScroll={(event): void => {
                    event.persist();
                    debouncedScroll(event);
                }}
            >
                <List className={classes.mainList}>
                    {state.activities.map((section: DataGroup) => {
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
                                                        prev.push(
                                                            <span key={k}>
                                                                {`${activityTypeMap[k].emoji} ${v} ${activityTypeMap[k].units}`}
                                                            </span>);
                                                        if (idx === 0) {
                                                            prev.push(' | ');
                                                        }
                                                        return prev;
                                                    }, [])}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </MyListSubheader>
                                    {section.data.map((activity: Data, idx) => {
                                        return (!state.filters.length ||
                                            (activity.type !== '' && state.filters.indexOf(activity.type) !== -1))
                                            && (
                                                <React.Fragment key={idx}>
                                                    {(idx !== 0) && (
                                                        <Divider />
                                                    )}
                                                    <ListItem
                                                        key={`${activity.dateTime.toISO()}-${activity.type}`}
                                                        button
                                                        onClick={(): void => {
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
                                                                const columnClass = classes[className as keyof typeof classes] || '';
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
                                                                                <Typography {...primaryProps}>
                                                                                    {column.format(value, activity.type)}
                                                                                </Typography>
                                                                            }
                                                                            secondary={
                                                                                (value instanceof DateTime) &&
                                                                                <div className={classes.secondaryText}>
                                                                                    <Typography className={classes.aside}>
                                                                                        {(activity.timeBeforePrev === null)
                                                                                            ? getTimeAgo(value)
                                                                                            : formatInterval(activity.timeBeforePrev)
                                                                                        }
                                                                                    </Typography>
                                                                                    {(activity.notes) &&
                                                                                        <Typography className={classes.aside}>
                                                                                            {activity.notes}
                                                                                        </Typography>
                                                                                    }
                                                                                </div>
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
                {(state.requestInFlight) &&
                    <div className={classes.loading}>
                        <LinearProgress color="secondary" />
                    </div>
                }
            </div>
        </Paper>
    );
}

export default ActivityList;