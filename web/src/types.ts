import { DateTime } from 'luxon';
import GroupedArray from './GroupedArray';

export interface Response {
    status?: number;
    message?: string;
}

export interface State {
    _data: GroupedArray;
    activities: DataGroup[];
    requestInFlight: boolean;
    last?: DateTime;
    hasMore: boolean;
    error: boolean;
    response: Response;
    loggedIn: boolean;
    filters: ActivityKeys[];
    stats: Stats;
}

export enum ActivityActionTypes {
    FETCH_DATA_FAILURE = 'FETCH_DATA_FAILURE',
    FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS',
    FETCH_DATA_REQUEST = 'FETCH_DATA_REQUEST',
    LOGIN_REQUEST = 'LOGIN_REQUEST',
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILURE = 'LOGIN_FAILURE',
    LOGOUT_REQUEST = 'LOGOUT_REQUEST',
    LOGOUT_SUCCESS = 'LOGOUT_SUCCESS',
    LOGOUT_FAILURE = 'LOGOUT_FAILURE',
    FILTER = 'FILTER',
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
    notes?: string;
}

export interface RawData extends BaseData {
    dateTime: string;
    timeBeforePrev?: Interval;
}

export interface Interval {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

export interface Stats {
    type: ActivityKeys;
    average: Interval;
    stddev: Interval;
}

export interface Data extends BaseData {
    dateTime: DateTime;
    timeBeforePrev?: Interval;
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
    | {
        type: ActivityActionTypes.FETCH_DATA_FAILURE;
        response: Response;
    }
    | {
        type: ActivityActionTypes.FETCH_DATA_SUCCESS;
        last: DateTime;
        hasMore?: boolean;
        response: Response;
    }
    | { type: ActivityActionTypes.FETCH_DATA_REQUEST }
    | { type: ActivityActionTypes.LOGIN_REQUEST }
    | {
        type: ActivityActionTypes.LOGIN_FAILURE;
        response: Response;
    }
    | {
        type: ActivityActionTypes.LOGIN_SUCCESS;
        response: Response;
    }
    | { type: ActivityActionTypes.LOGOUT_REQUEST }
    | {
        type: ActivityActionTypes.LOGOUT_FAILURE;
        response: Response;
    }
    | {
        type: ActivityActionTypes.LOGOUT_SUCCESS;
        response: Response;
    }
    | {
        type: ActivityActionTypes.FILTER;
        filters: ActivityKeys[];
    };


export interface ActivityInfo {
    emoji: string;
    units?: string;
}

export type ActivityKeys = 'meal' | 'poop' | 'nurse' | 'bath' | 'sleep';

export interface GetResponseData {
    activities: RawData[];
    stats: Stats[];
}

export interface PostResponseData {
    activities: RawData[];
    stats: Stats[];
    created: RawData;
}

export interface PutResponseData {
    activities: RawData[];
    stats: Stats[];
    updated: RawData;
}

export interface DeleteResponseData {
    activities: RawData[];
    stats: Stats[];
    deleted: RawData;
}
