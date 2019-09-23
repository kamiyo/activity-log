import * as React from 'react';
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Data } from './types';
import { activityTypeMap, ActivityListContext, ActivityKeys } from './ActivityList';
import LuxonUtils from '@date-io/luxon';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles, createStyles, withStyles } from '@material-ui/styles';
import { useTheme, Theme, CircularProgress } from '@material-ui/core';
import { DateTime } from 'luxon';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Color from 'color';
import { addNewAction, updateAction, deleteAction } from './actions';

const SubmitButton = withStyles(() => ({
    root: {
        backgroundColor: Color(green[700]).fade(0.1).string(),
        color: 'white',
        '&:hover': {
            backgroundColor: Color(green[800]).fade(0.1).string(),
        },
        marginLeft: '8px',
    },
}))(Button);

const CancelButton = withStyles(() => ({
    root: {
        backgroundColor: 'transparent',
        color: Color(red[500]).fade(0.2).lighten(0.2).string(),
        '&:hover': {
            backgroundColor: Color(red[500]).fade(0.92).string(),
        },
        border: `1px solid ${Color(red[500]).fade(0.2).lighten(0.2).string()}`,
        marginLeft: '8px',
    },
}))(Button);

const DeleteButton = withStyles(() => ({
    root: {
        backgroundColor: Color(red[800]).fade(0.2).string(),
        color: 'white',
        '&:hover': {
            backgroundColor: Color(red[900]).fade(0.2).string(),
        },
        minWidth: '2.5rem',
        padding: '6px 0',
    },
}))(Button);

const useStyles = makeStyles((theme: Theme) => createStyles({
    dateTimeInput: {
        margin: '1rem 0 0 0',
    },
    formControl: {
        marginTop: '1rem',
        marginBottom: '0.5rem',
    },
    selectItems: {
        justifyContent: 'center',
    },
    amountWidth: {
        width: '6rem',
    },
    title: {
        backgroundColor: Color(theme.palette.primary.main).fade(0.8).string(),
        color: Color(theme.palette.primary.main).lighten(0.1).string(),
    },
    dialogActions: {
        paddingTop: '2rem',
        justifyContent: 'space-between',
    },
}));

interface ActivityDialogProps {
    open: boolean;
    edit: boolean;
    activity: Data;
    handleClose: () => void;
}

const initialState: Data = { id: '', dateTime: DateTime.local(), type: '', amount: '' }

const ActivityDialog: React.FC<ActivityDialogProps> = (props) => {
    const theme = useTheme();
    const classes = useStyles(theme);
    const { state, dispatch } = React.useContext(ActivityListContext);
    const [activity, changeActivity] = React.useState<Data>(initialState);
    const [error, setError] = React.useState(false);

    React.useEffect(() => {
        changeActivity(props.activity || initialState);
    }, [props.activity]);

    const units = (!activity.type) ? '' : activityTypeMap[activity.type].units;
    const adornment = (units) ? units : '';

    return (
        <Dialog
            onClose={() => {
                props.handleClose();
                changeActivity(initialState);
                setError(false);
            }}
            open={props.open}
            TransitionProps={{
                unmountOnExit: true,
                mountOnEnter: true,
            }}
        >
            <DialogTitle className={classes.title}>{props.edit ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
            <Divider />
            <DialogContent>
                <FormControl className={classes.formControl}>
                    <InputLabel shrink>{'Date & Time'}</InputLabel>
                    <MuiPickersUtilsProvider utils={LuxonUtils}>
                        <DateTimePicker
                            value={activity.dateTime}
                            ampm={false}
                            autoOk={false}
                            onChange={(value) => changeActivity({
                                ...activity,
                                dateTime: value,
                            })}
                            className={classes.dateTimeInput}
                        />
                    </MuiPickersUtilsProvider>
                </FormControl>
                <TextField
                    select
                    margin="normal"
                    id="type"
                    label="Type"
                    value={activity.type}
                    onChange={(event) => {
                        const value = event.target.value
                        changeActivity({
                            ...activity,
                            type: value as ActivityKeys,
                            amount: (value === 'poop') ? '' : activity.amount,
                        });
                    }}
                    SelectProps={{
                        SelectDisplayProps: {
                            style: {
                                minWidth: '2rem',
                            }
                        }
                    }}
                >
                    {Object.entries(activityTypeMap).map(([key, activity]) => (
                        <MenuItem key={key} value={key} className={classes.selectItems}>
                            {activity.emoji}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    margin="normal"
                    id="amount"
                    label="Amount"
                    type="number"
                    disabled={(activity.type === 'poop')}
                    onChange={(event) => {
                        if (event.target.value !== '' && isNaN(parseFloat(event.target.value))) {
                            setError(true);
                        } else {
                            if (error) {
                                setError(false);
                            }
                            changeActivity({
                                ...activity,
                                amount: event.target.value,
                            });
                        }
                    }}
                    value={activity.amount === null ? '' : activity.amount}
                    error={error}
                    InputProps={{
                        className: classes.amountWidth,
                        endAdornment:
                            <InputAdornment position="end">
                                {adornment}
                            </InputAdornment>,
                    }}
                />

            </DialogContent>
            <DialogActions className={classes.dialogActions}>
                <DeleteButton
                    onClick={() => {
                        deleteAction(activity, state, dispatch)();
                    }}
                    variant="contained"
                    disabled={state.requestInFlight}
                >
                    <DeleteOutline />
                </DeleteButton>
                <div style={{ flex: '0 0 auto', display: 'flex' }}>
                    <CancelButton onClick={() => props.handleClose()} variant="outlined">
                        Cancel
                    </CancelButton>
                    <SubmitButton
                        onClick={() => {
                            if (props.edit) {
                                updateAction(activity, state, dispatch)();
                            } else {
                                addNewAction(activity, state, dispatch)();
                            }
                        }}
                        variant="contained"
                        disabled={state.requestInFlight}
                    >
                        {state.requestInFlight ? <CircularProgress size={16} /> : props.edit ? 'Update' : 'Add'}
                    </SubmitButton>
                </div>
            </DialogActions>
        </Dialog>
    );
};

export default ActivityDialog;