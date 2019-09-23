import { Data, State, ActivityActionTypes, Action, BaseData, HasDateTime } from "./types";
import { DateTime } from "luxon";
import GroupedArray, { dataComp } from "./GroupedArray";

export const initialState: State = {
    _data: new GroupedArray([], dataComp),
    activities: [],
    requestInFlight: false,
    response: {},
    error: false,
    hasMore: true,
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
                error: true,
            };
        case ActivityActionTypes.FETCH_DATA_SUCCESS:
            return {
                ...state,
                requestInFlight: false,
                activities: state._data.toGrouped(),
                last: action.last,
                response: action.response,
                error: false,
                hasMore: (action.hasMore === undefined || action.hasMore === null) ? state.hasMore : action.hasMore,
            };
        default:
            throw new Error('Invalid action type.');
    }
};

export default activityReducer;