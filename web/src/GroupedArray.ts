import binarySearch from 'binary-search';
import { Data, HasDateTime, RawData, DataGroup, ActivityKeys, ActivityInfo } from './types';
import { DateTime, Duration } from 'luxon';

export const activityTypeMap: Record<ActivityKeys, ActivityInfo> = {
    meal: { emoji: '🍼', units: 'oz' },
    poop: { emoji: '💩' },
    nurse: { emoji: '🌰' },
    bath: { emoji: '🛁' },
    sleep: { emoji: '💤', units: 'hrs' },
};

export type comparator<T> = (a: T, b: T, index?: number, array?: T[]) => number;

export const dataComp = (a: HasDateTime, b: HasDateTime) => {
    const aDateTime = a.dateTime;
    const bDateTime = b.dateTime;
    if (a.id === b.id) {
        return 0;
    }
    if (aDateTime > bDateTime) {
        return -1;
    } else if (aDateTime < bDateTime) {
        return 1;
    } else if (a.id > b.id) {
        return -1;
    } else {
        return 1;
    }
}

export const isDataArray = (data: RawData[] | Data[]): data is Data[] => {
    return (data[0] as Data).dateTime instanceof DateTime;
};

export const isData = (data: RawData | Data): data is Data => {
    return (data as Data).dateTime instanceof DateTime;
};

export const rawToData = (raw: RawData): Data => {
    return {
        ...raw,
        dateTime: DateTime.fromISO(raw.dateTime),
    };
};

interface Node {
    dateTime: DateTime;
    index: number;
}

class GroupedArray {
    array: Data[];
    nodes: Node[];
    readonly comparator: comparator<HasDateTime>;
    length: number;

    private generateTimeBeforePrev() {
        Object.keys(activityTypeMap).forEach((key) => {
            let prev: DateTime = null;
            this.array.forEach((val, idx, arr) => {
                if (val.type !== key) return;
                const dur: Duration = prev ? prev.diff(val.dateTime, ['hours', 'minutes']) : null;
                arr[idx].timeBeforePrev = dur;
                prev = val.dateTime;
            });
        });
    }

    private generateNodes() {
        this.generateTimeBeforePrev();
        this.nodes = [];
        if (this.length === 0) {
            return;
        }
        const max = this.array[0].dateTime.startOf('day');
        const min = this.array[this.length - 1].dateTime.startOf('day');
        for (let it = max; it >= min; it = it.minus({ days: 1 })) {
            let index = binarySearch(this.array, { dateTime: it.plus({ days: 1 }) }, this.comparator);
            if (index < 1) {
                index = (-1 * index) - 1;
            }
            this.nodes.push({
                dateTime: it,
                index,
            });
        }
    }

    constructor(args: Data[] | RawData[], comparator: comparator<HasDateTime>, inputSorted?: boolean) {
        this.comparator = comparator;
        if (!args.length) {
            this.length = 0;
            this.array = [];
            this.nodes = [];
            return;
        }
        if (isDataArray(args)) {
            this.array = inputSorted ? args : [...args].sort(this.comparator);
        } else {
            const dataArray = args.map((val) => rawToData(val));
            this.array = inputSorted ? dataArray : dataArray.sort(this.comparator);
        }
        this.length = this.array.length;
        this.generateNodes();
    }

    toGrouped(): DataGroup[] {
        return this.nodes.map((node, idx, arr) => {
            const ptr = node.index;
            const next = (idx === arr.length - 1) ? this.array.length : arr[idx + 1].index;
            const group = this.array.slice(ptr, next);
            const amount = group.reduce((prev, curr) => {
                if (curr.type !== 'meal' && curr.type !== 'sleep') return prev;
                if (!curr.amount) return prev;
                const result = { ...prev };
                result[curr.type] += parseFloat(curr.amount);
                return result;
            }, {
                meal: 0,
                sleep: 0,
            });
            return {
                dateTime: node.dateTime,
                data: this.array.slice(ptr, next),
                amount,
            };
        });
    }

    empty() {
        return !this.array.length;
    }

    getSmallest() {
        return this.array[this.length - 1];
    }

    set(index: number, value: Data) {
        // instead of setting, we will remove and insert
        this.array.splice(index, 1);
        this.length = this.array.length;
        this.push(value);
    }

    private _push(...value: Data[]) {
        value.forEach((val) => {
            const idx = binarySearch(this.array, val, this.comparator);
            // exists
            if (idx >= 0) {
                // update
                this.array[idx] = val;
                return;
            }
            // insert
            const slicePoint = (-1 * idx) - 1;
            this.array.splice(slicePoint, 0, val);
            this.length++;
        });
    }

    push(...value: Data[] | RawData[]) {
        if (!value.length) {
            return this;
        }
        if (isDataArray(value)) {
            this._push(...value);
        } else {
            this._push(...value.map((raw) => rawToData(raw)));
        }
        this.generateNodes();
        return this;
    }

    concat(s: GroupedArray) {
        if (this.empty()) {
            this.array = [...s.array];
            this.length = this.array.length;
            this.nodes = [...s.nodes];
            return this;
        }
        if (s.empty()) {
            return this;
        }
        this.push(...s.array);
        return this;
    }

    map<R>(mapFn: (value: Data, index?: number, array?: Data[]) => R, thisArg?: this): R[] {
        return this.array.map(mapFn);
    }

    forEach(callback: (value: Data, index?: number, array?: Data[]) => void, thisArg?: this) {
        this.array.forEach(callback);
    }

    find(value: Data) {
        if (this.empty()) {
            return undefined;
        }
        const idx = binarySearch(this.array, value, this.comparator);
        if (idx < 0) {
            return undefined;
        }
        return this.array[idx];
    }

    indexOf(value: Data) {
        if (this.empty()) {
            return -1;
        }
        return binarySearch(this.array, value, this.comparator);
    }

    findIndex(fn: (curr: Data, index?: number, array?: Data[])=> boolean, thisArg?: this) {
        return this.array.findIndex(fn);
    }

    reduce<U>(fn: (prev: U, curr: Data, index?: number, array?: Data[]) => U, initialValue?: U) {
        return this.array.reduce(fn, initialValue);
    }

    delete(value: Data) {
        if (this.empty()) {
            return this;
        }
        const idx = binarySearch(this.array, value, this.comparator);
        if (idx < 0) {
            return this;
        }
        this.array.splice(idx, 1);
        this.length = this.array.length;
        this.generateNodes();
    }

    deleteIndex(index: number) {
        if (this.empty()) {
            return this;
        }
        if (index < 0) {
            return this;
        }
        this.array.splice(index, 1);
        this.length = this.array.length;
        this.generateNodes();
    }
}

export default GroupedArray;