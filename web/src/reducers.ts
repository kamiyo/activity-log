import { State, ActivityActionTypes, Action } from "./types";
import GroupedArray, { dataComp } from "./GroupedArray";

export const initialState: State = {
    _data: new GroupedArray([], dataComp),
    activities: [],
    requestInFlight: false,
    response: {},
    error: false,
    hasMore: true,
    loggedIn: true,
    filters: [],
    last: null,
    stats: null,
};

const activityReducer = (state: State, action: Action): State => {
    switch (action.type) {
        case ActivityActionTypes.FETCH_DATA_REQUEST:
            return {
                ...state,
                requestInFlight: true,
                error: false,
                response: {},
            };
        case ActivityActionTypes.FETCH_DATA_FAILURE:
            return {
                ...state,
                requestInFlight: false,
                response: action.response,
                loggedIn: (action.response.status === 401 || action.response.status === 403) ? false : state.loggedIn,
                error: true,
            };
        case ActivityActionTypes.FETCH_DATA_SUCCESS:
            return {
                ...state,
                requestInFlight: false,
                activities: state._data.toGrouped(),
                stats: state._data.getStats(),
                last: action.last,
                response: action.response,
                error: false,
                hasMore: (action.hasMore === undefined || action.hasMore === null) ? state.hasMore : action.hasMore,
            };
        case ActivityActionTypes.LOGIN_REQUEST:
        case ActivityActionTypes.LOGOUT_REQUEST:
            return {
                ...state,
                requestInFlight: true,
                error: false,
            };
        case ActivityActionTypes.LOGIN_FAILURE:
        case ActivityActionTypes.LOGOUT_FAILURE:
            return {
                ...state,
                requestInFlight: false,
                error: true,
                response: action.response,
                loggedIn: false,
            };
        case ActivityActionTypes.LOGIN_SUCCESS:
            return {
                ...state,
                requestInFlight: false,
                error: false,
                response: action.response,
                loggedIn: true,
            };
        case ActivityActionTypes.LOGOUT_SUCCESS:
            return {
                ...initialState,
                response: action.response,
                loggedIn: false,
                _data: new GroupedArray([], dataComp),
                activities: [],
                filters: [],
                last: null,
                hasMore: true,
                error: false,
                stats: null,
            };
        case ActivityActionTypes.FILTER:

            return {
                ...state,
                filters: action.filters,
            }
        default:
            throw new Error('Invalid action type.');
    }
};

export default activityReducer;