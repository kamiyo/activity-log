import * as React from 'react';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import { ActivityListContext } from './App';
import { logoutAction } from './actions';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import { activityTypeMap } from './GroupedArray';
import { ActivityKeys, ActivityActionTypes } from './types';
import { formatDuration } from './utils';
import { useTheme } from '@material-ui/styles';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';

interface DrawerProps {
    menuOpen: boolean;
    handleMenuOpen: (isOpen: boolean) => void;
}

const statMap = {
    mean: 'μ',
    stdev: 'σ',
};

const useStyles = makeStyles((theme: Theme) => createStyles({
    menu: {
        [theme.breakpoints.up('sm')]: {
            minWidth: '200px',
        },
    },
    stats: {
        fontSize: '0.8rem',
        color: '#8c8c8c',
        display: 'block',
        marginLeft: '0.5rem',
    },
    itemIcon: {
        minWidth: '2rem',
    }
}));

const _Drawer: React.FC<DrawerProps> = ({ menuOpen, handleMenuOpen }) => {
    const { state, dispatch } = React.useContext(ActivityListContext);
    const theme = useTheme();
    const classes = useStyles(theme);
    const [filterOpen, handleFilterOpen] = React.useState(false);

    const handleFilter = (filter: ActivityKeys) => {
        const filters = [...state.filters]
        const idx = state.filters.indexOf(filter);
        if (idx !== -1) {
            filters.splice(idx, 1);
        } else {
            filters.push(filter);
        }
        dispatch({ type: ActivityActionTypes.FILTER, filters });
    };

    const stats = state.stats;
    return (
        <Drawer open={menuOpen} onClose={() => handleMenuOpen(false)}>
            <List className={classes.menu}>
                <ListItem key="stats">
                    <ListItemText
                    disableTypography
                    primary={<Typography>Time Statistics</Typography>}
                    secondary={
                    <div>
                        {stats && Object.keys(stats).map((key: ActivityKeys) => (
                            <React.Fragment key={key}>
                                <Typography key={`${key}-stats-emoji`}>
                                    {`${activityTypeMap[key].emoji}:`}
                                </Typography>
                                {Object.entries(stats[key as ActivityKeys]).map(([k, stat]) => (
                                    <Typography key={`${key}-stats-${k}`} className={classes.stats}>
                                        {`${statMap[k as keyof typeof statMap]}: ${formatDuration(stat).substr(1)}`}
                                    </Typography>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                } />
                </ListItem>
                <ListItem key="filters" button onClick={() => handleFilterOpen(!filterOpen)}>
                    <ListItemText primary="Filter" />
                    {filterOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={filterOpen} timeout="auto" unmountOnExit>
                    <List disablePadding key="filter-list">
                        {Object.keys(activityTypeMap).map((key: ActivityKeys) => {
                            return (
                                <ListItem button dense onClick={() => handleFilter(key)} key={`filter-${key}`}>
                                    <ListItemIcon className={classes.itemIcon}>
                                        <Checkbox
                                            edge="start"
                                            checked={state.filters.indexOf(key) !== -1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary={key} />
                                    <ListItemSecondaryAction>
                                        {activityTypeMap[key as ActivityKeys].emoji}
                                    </ListItemSecondaryAction>
                                </ListItem>
                            );
                        })}
                    </List>
                </Collapse>
                <ListItem key="logout">
                    <Button
                        disabled={!state.loggedIn}
                        color="secondary"
                        variant="contained"
                        onClick={() => {
                            logoutAction(state, dispatch)();
                        }}
                    >
                        Logout
                        </Button>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default _Drawer;