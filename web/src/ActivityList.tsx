import * as React from 'react';
import MaterialTable from 'material-table';

const Table: React.SFC<{}> = () => (
    <MaterialTable
        title="Ella's Activity Log"
        columns={[
            {
                title: 'Date & Time',
                field: 'dateTime',
                render: rowData => {
                    return <span>{rowData.dateTime}</span>;
                },
            },
            {
                title: 'Activity',
                field: 'activity',
                render: rowData => <span>{((rowData.activity === 'Meal') ? '🍼' : '💩')}</span>
            },
            {
                title: 'Amount',
                field: 'amount',
                render: rowData => {
                    return <span>{rowData.amount || ''}</span>;
                }
            },
        ]}
        data={query =>
            new Promise((res, rej) => {
                res({
                    data: [
                        {
                            dateTime: new Date(),
                            activity: 'Meal',
                            amount: '3'
                        },
                        {
                            dateTime: new Date(),
                            activity: 'Poop',
                            amount: null,
                        },
                    ],
                    page: 0,
                    totalCount: 1,
                });
            })
        }
    />
);

export default Table;