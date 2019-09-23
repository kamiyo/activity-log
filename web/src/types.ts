import { DateTime } from 'luxon';
import GroupedArray from './GroupedArray';
import { ActivityKeys } from './ActivityList';

export interface Response {
    status?: number,
    message?: string,
}

export interface State {
    _data: GroupedArray;
    activities: DataGroup[];
    requestInFlight: boolean;
    last?: DateTime;
    hasMore: boolean;
    error: boolean;
    response: Response;
}

export enum ActivityActionTypes {
    FETCH_DATA_FAILURE = 'FETCH_DATA_FAILURE',
    FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS',
    FETCH_DATA_REQUEST = 'FETCH_DATA_REQUEST',
}

export interface HasDateTime {
    id?: string;
    dateTime: string | DateTime;
}

export interface BaseData extends HasDateTime {
    id: string;
    type?: ActivityKeys | '';
    amount?: string;
    dateTime: string | DateTime;
}

export interface RawData extends BaseData {
    dateTime: string;
}

export interface Data extends BaseData {
    dateTime: DateTime;
}

export interface DataGroup extends HasDateTime {
    dateTime: DateTime;
    data: Data[];
    amount?: {
        meal: number;
        sleep: number;
    };
}

export type Action =
    | { type: ActivityActionTypes.FETCH_DATA_FAILURE,
        response: Response, }
    | { type: ActivityActionTypes.FETCH_DATA_SUCCESS,
        last: DateTime,
        hasMore?: boolean,
        response: Response, }
    | { type: ActivityActionTypes.FETCH_DATA_REQUEST };