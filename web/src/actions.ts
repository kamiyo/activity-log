import * as React from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { State, ActivityActionTypes, RawData, Data, Action } from './types';

export const fetchDataAction = (state: State, dispatch: React.Dispatch<Action>) => async () => {
    if (!state.hasMore) {
        return;
    }
    dispatch({ type: ActivityActionTypes.FETCH_DATA_REQUEST });
    try {
        const config: AxiosRequestConfig = {};
        if (!!state.last) {
            config.params = {
                before: state.last.toSeconds(),
            };
        }
        const response = await axios.get<{ activities: RawData[] }>('/api/v1/activities', config);
        const hasMore = !!response.data.activities.length;
        state._data.push(...response.data.activities);
        const last = state._data.getSmallest().dateTime;
        dispatch({
            type: ActivityActionTypes.FETCH_DATA_SUCCESS,
            last,
            hasMore,
            response: {},
        });
    } catch (err) {
        if (err.response) {
            console.log(err.response.data);
        }
        dispatch({
            type: ActivityActionTypes.FETCH_DATA_FAILURE,
            response: {
                status: err.response.status,
                message: err.response.statusText,
            }
        });
    }
};

const removeEmptyFields = (activity: Data) => {
    return Object.keys(activity).reduce((prev, val: keyof Data) => {
        if (activity[val] === '') {
            return prev;
        } else {
            return {
                ...prev,
                [val]: activity[val],
            }
        }
    }, {});
};

export const addNewAction = (activity: Data, state: State, dispatch: React.Dispatch<Action>) => async () => {
    if (state.requestInFlight) return;
    const body = removeEmptyFields(activity);
    dispatch({ type: ActivityActionTypes.FETCH_DATA_REQUEST });
    try {
        const config: AxiosRequestConfig = {
            headers: {
                ContentType: 'application/json',
            },
        };
        if (!!state.last) {
            config.params = {
                after: state.last.toSeconds()
            };
        }
        const response = await axios.post<{ created: RawData, activities: RawData[] }>(
            '/api/v1/activities',
            body,
            config,
        );
        state._data.push(...response.data.activities);
        const last = state._data.getSmallest().dateTime;
        dispatch({
            type: ActivityActionTypes.FETCH_DATA_SUCCESS,
            last,
            response: {
                status: response.status,
                message: 'Activity successfully added.',
            },
        })
    } catch (err) {
        dispatch({
            type: ActivityActionTypes.FETCH_DATA_FAILURE,
            response: {
                status: err.response.status,
                message: err.response.statusText,
            }
        });
        console.log(err);
    }
};

export const updateAction = (activity: Data, state: State, dispatch: React.Dispatch<Action>) => async () => {
    if (state.requestInFlight) return;
    const body = removeEmptyFields(activity);
    dispatch({ type: ActivityActionTypes.FETCH_DATA_REQUEST });
    try {
        const config: AxiosRequestConfig = {
            headers: {
                ContentType: 'application/json',
            },
        };
        if (!!state.last) {
            config.params = {
                after: state.last.toSeconds(),
            };
        }
        const response = await axios.put<{ created: RawData, activities: RawData[] }>(
            `/api/v1/activities/${activity.id}`,
            body,
            config,
        );
        state._data.push(...response.data.activities);
        const last = state._data.getSmallest().dateTime;
        dispatch({
            type: ActivityActionTypes.FETCH_DATA_SUCCESS,
            last,
            response: {
                status: response.status,
                message: 'Activity successfully updated.',
            },
        });
    } catch (err) {
        dispatch({
            type: ActivityActionTypes.FETCH_DATA_FAILURE,
            response: {
                status: err.response.status,
                message: err.response.statusText,
            }
        });
        console.log(err);
    }
};

export const deleteAction = (activity: Data, state: State, dispatch: React.Dispatch<Action>) => async () => {
    if (state.requestInFlight) return;
    dispatch({ type: ActivityActionTypes.FETCH_DATA_REQUEST });
    try {
        const response = await axios.delete(`/api/v1/activities/${activity.id}`);
        state._data.delete(activity);
        const last = state._data.getSmallest().dateTime;
        dispatch({
            type: ActivityActionTypes.FETCH_DATA_SUCCESS,
            last,
            response: {
                status: response.status,
                message: 'Activity successfully deleted.',
            },
        });
    } catch (err) {
        dispatch({
            type: ActivityActionTypes.FETCH_DATA_FAILURE,
            response: {
                status: err.response.status,
                message: err.response.statusText,
            }
        });
        console.log(err);
    }
};