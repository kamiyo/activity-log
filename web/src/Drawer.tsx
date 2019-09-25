import * as React from 'react';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import { ActivityListContext } from './App';
import { logoutAction } from './actions';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import { activityTypeMap } from './GroupedArray';
import { ActivityKeys } from './types';
import { Duration } from 'luxon';
import { formatDuration } from './ActivityList';
import { useTheme } from '@material-ui/styles';

interface DrawerProps {
    menuOpen: boolean;
    handleMenuOpen: (isOpen: boolean) => void;
}

const statMap = {
    mean: 'μ',
    stdev: 'σ',
};

const useStyles = makeStyles((theme: Theme) => createStyles({
    stats: {
        fontSize: '0.8rem',
        color: '#8c8c8c',
        display: 'block',
        marginLeft: '0.5rem',
    },
}));

const _Drawer: React.FC<DrawerProps> = ({ menuOpen, handleMenuOpen }) => {
    const { state, dispatch } = React.useContext(ActivityListContext);
    const theme = useTheme();
    const classes = useStyles(theme);

    const stats = state._data.getStats();
    return (
        <Drawer open={menuOpen} onClose={() => handleMenuOpen(false)}>
            <List>
                <ListItem>
                    <ListItemText
                    disableTypography
                    primary={<Typography>Time Statistics</Typography>}
                    secondary={
                    <div>
                        {Object.keys(stats).map((key: ActivityKeys) => (
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
                <ListItem>
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