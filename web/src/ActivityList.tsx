import * as React from 'react';
import MaterialTable from 'material-table';
import { DateTime } from 'luxon';
import LuxonUtils from '@date-io/luxon';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';

import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

const tableIcons = {
    Add: React.forwardRef<SVGSVGElement>((props, ref) => <AddBox {...props} ref={ref} />),
    Check: React.forwardRef<SVGSVGElement>((props, ref) => <Check {...props} ref={ref} fontSize="small" />),
    Clear: React.forwardRef<SVGSVGElement>((props, ref) => <Clear {...props} ref={ref} fontSize="small" />),
    Delete: React.forwardRef<SVGSVGElement>((props, ref) => <DeleteOutline {...props} ref={ref} fontSize="small" />),
    DetailPanel: React.forwardRef<SVGSVGElement>((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: React.forwardRef<SVGSVGElement>((props, ref) =>
        <Edit
            {...props}
            fontSize="small"
            ref={ref}
        />),
    Export: React.forwardRef<SVGSVGElement>((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: React.forwardRef<SVGSVGElement>((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: React.forwardRef<SVGSVGElement>((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: React.forwardRef<SVGSVGElement>((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: React.forwardRef<SVGSVGElement>((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: React.forwardRef<SVGSVGElement>((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: React.forwardRef<SVGSVGElement>((props, ref) => <Clear {...props} ref={ref} />),
    Search: React.forwardRef<SVGSVGElement>((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: React.forwardRef<SVGSVGElement>((props, ref) => <ArrowUpward {...props} ref={ref} fontSize="small" />),
    ThirdStateCheck: React.forwardRef<SVGSVGElement>((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: React.forwardRef<SVGSVGElement>((props, ref) => <ViewColumn {...props} ref={ref} />)
};

const dateFormat = { ...DateTime.DATETIME_SHORT, weekday: 'short' };

const Table: React.FC<{}> = () => {
    const [data, updateData] = React.useState(
        [{
            id: '134ehsd',
            dateTime: DateTime.fromISO((new Date()).toISOString()),
            activity: 'Meal',
            amount: '3'
        },
        {
            id: '832035r3ud',
            dateTime: DateTime.fromISO((new Date()).toISOString()),
            activity: 'Poop',
            amount: null,
        }],
    );

    return (
        <MaterialTable
            icons={tableIcons}
            title="Ella's Activity Log"
            columns={[
                {
                    title: 'Date & Time',
                    field: 'dateTime',
                    sorting: false,
                    editComponent: props => (
                        <MuiPickersUtilsProvider utils={LuxonUtils}>
                            <DateTimePicker
                                autoOk
                                ampm={false}
                                value={props.value}
                                onAccept={e => {
                                    const idx = data.findIndex((val) => val.id === props.rowData.id);
                                    const state = [...data];
                                    state[idx].dateTime = e;
                                    console.log(state);
                                    updateData(state);
                                }}
                                onChange={e => {
                                    const idx = data.findIndex((val) => val.id === props.rowData.id);
                                    const state = [...data];
                                    state[idx].dateTime = e;
                                    console.log(state);
                                    updateData(state);
                                }}
                            />
                        </MuiPickersUtilsProvider>
                    ),
                    render: rowData => {
                        return <span>{rowData.dateTime.toLocaleString(dateFormat)}</span>;
                    },
                },
                {
                    title: '🍼/💩',
                    headerStyle: { minWidth: '2rem' },
                    cellStyle: { textAlign: 'center' },
                    field: 'activity',
                    sorting: false,
                    render: rowData => <span>{((rowData.activity === 'Meal') ? '🍼' : '💩')}</span>
                },
                {
                    title: 'Amount',
                    field: 'amount',
                    sorting: false,
                    render: rowData => {
                        return <span>{rowData.amount ? rowData.amount + ' oz' : ''}</span>;
                    }
                },
                {
                    title: 'ID',
                    field: 'id',
                    hidden: true,
                }
            ]}
            data={query =>
                new Promise((res, rej) => {
                    res({
                        data: data,
                        page: 0,
                        totalCount: 1,
                    });
                })
            }
            editable={{
                isEditable: () => true,
                isDeletable: () => true,
                onRowAdd: newData =>
                    new Promise((res, rej) => {
                        res();
                    }),
                onRowUpdate: (newData, oldData) =>
                    new Promise((res, rej) => {
                        res();
                    }),
                onRowDelete: oldData =>
                    new Promise((res, rej) => {
                        res();
                    }),
            }}
        />
    );
}

export default Table;