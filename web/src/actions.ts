import * as React from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { State, ActivityActionTypes, Data, Action, PostResponseData, GetResponseData, PutResponseData, DeleteResponseData } from './types';
import { getPath, rawToStats } from './utils';

export const fetchDataAction = (state: State, dispatch: React.Dispatch<Action>) =>
    async (): Promise<void> => {
        if (!state.hasMore || state.requestInFlight) {
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
            const response = await axios.get<GetResponseData>(
                getPath('/api/v1/activities'),
                config,
            );
            const hasMore = !!response.data.activities.length;
            state._data.push(...response.data.activities);
            const last = state._data.getSmallest().dateTime;
            dispatch({
                type: ActivityActionTypes.FETCH_DATA_SUCCESS,
                stats: rawToStats(response.data.stats),
                last,
                hasMore,
                response: {
                    message: state.response.message,
                    status: 0,
                },
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

const removeEmptyFields = (activity: Data): { [key: string]: any } => {
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

export const addNewAction = (activity: Data, state: State, dispatch: React.Dispatch<Action>) =>
    async (): Promise<void> => {
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
            const response = await axios.post<PostResponseData>(
                getPath('/api/v1/activities'),
                body,
                config,
            );
            state._data.push(...response.data.activities);
            const last = state._data.getSmallest().dateTime;
            dispatch({
                type: ActivityActionTypes.FETCH_DATA_SUCCESS,
                stats: rawToStats(response.data.stats),
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

export const updateAction = (activity: Data, state: State, dispatch: React.Dispatch<Action>) =>
    async (): Promise<void> => {
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
            const response = await axios.put<PutResponseData>(
                getPath(`/api/v1/activities/${activity.id}`),
                body,
                config,
            );
            state._data.push(...response.data.activities);
            const last = state._data.getSmallest().dateTime;
            dispatch({
                type: ActivityActionTypes.FETCH_DATA_SUCCESS,
                stats: rawToStats(response.data.stats),
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

export const deleteAction = (activity: Data, state: State, dispatch: React.Dispatch<Action>) =>
    async (): Promise<void> => {
        if (state.requestInFlight) return;
        dispatch({ type: ActivityActionTypes.FETCH_DATA_REQUEST });
        try {
            const config: AxiosRequestConfig = (!!state.last) ? {
                params: {
                    after: state.last.toSeconds(),
                },
            } : {};
            const response = await axios.delete<DeleteResponseData>(
                getPath(`/api/v1/activities/${activity.id}`),
                config,
            );
            const { deleted, activities } = response.data;
            if (deleted.id === activity.id) {
                state._data.delete(activity);
            } else {
                throw {
                    ...response,
                    statusText: `ID to delete and ID deleted don't match!`,
                };
            }
            state._data.push(...activities);
            const last = state._data.getSmallest().dateTime;
            dispatch({
                type: ActivityActionTypes.FETCH_DATA_SUCCESS,
                stats: rawToStats(response.data.stats),
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

export const loginAction = (
    username: string,
    password: string,
    state: State,
    dispatch: React.Dispatch<Action>,
) =>
    async (): Promise<void> => {
        if (state.requestInFlight) return;
        dispatch({ type: ActivityActionTypes.LOGIN_REQUEST });
        try {
            const response = await axios.post(getPath('/auth/login'), {
                username,
                password,
            });
            console.log(response);
            dispatch({
                type: ActivityActionTypes.LOGIN_SUCCESS,
                response: {
                    status: response.status,
                    message: 'Successfully logged in.',
                },
            });
        } catch (err) {
            dispatch({
                type: ActivityActionTypes.LOGIN_FAILURE,
                response: {
                    status: err.response.status,
                    message: 'Invalid credentials.',
                }
            });
            console.log(err);
        }
    };

export const logoutAction = (state: State, dispatch: React.Dispatch<Action>) =>
    async (): Promise<void> => {
        if (state.requestInFlight) return;
        dispatch({ type: ActivityActionTypes.LOGOUT_REQUEST });
        try {
            const response = await axios.post(getPath('/auth/logout'));
            dispatch({
                type: ActivityActionTypes.LOGOUT_SUCCESS,
                response: {
                    status: response.status,
                    message: 'Successfully logged out.',
                },
            });
        } catch (err) {
            dispatch({
                type: ActivityActionTypes.LOGOUT_FAILURE,
                response: {
                    status: err.response.status,
                    message: err.response.statusText,
                }
            });
            console.log(err);
        }
    };
