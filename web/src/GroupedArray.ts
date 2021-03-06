import binarySearch from 'binary-search';
import { Data, HasDateTime, RawData, DataGroup, ActivityKeys, ActivityInfo } from './types';
import { DateTime } from 'luxon';
import { array } from 'prop-types';

export const activityTypeMap: Record<ActivityKeys, ActivityInfo> = {
    meal: { emoji: '🍼', units: 'oz' },
    poop: { emoji: '💩' },
    nurse: { emoji: '🌰' },
    bath: { emoji: '🛁' },
    sleep: { emoji: '💤', units: 'hrs' },
};

export type comparator<T> = (a: T, b: T, index?: number, array?: T[]) => number;

export const dataComp = (a: HasDateTime, b: HasDateTime): 0 | 1 | -1 => {
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

    private generateNodes(): void {
        this.nodes = [];
        if (this.length === 0) {
            return;
        }
        const max = this.array[0].dateTime.endOf('day');
        const min = this.array[this.length - 1].dateTime.startOf('day');
        for (let it = max; it >= min; it = it.minus({ days: 1 })) {
            let index = binarySearch(this.array, { dateTime: it }, this.comparator);
            if (index < 1) {
                index = (-1 * index) - 1;
            }
            this.nodes.push({
                dateTime: it.startOf('day'),
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

    empty(): boolean {
        return !this.array.length;
    }

    getSmallest(): Data {
        return this.array[this.length - 1];
    }

    set(index: number, value: Data): void {
        // instead of setting, we will remove and insert
        this.array.splice(index, 1);
        this.length = this.array.length;
        this.push(value);
    }

    private _push(...value: Data[]): void {
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

    push(...value: Data[] | RawData[]): this {
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

    concat(s: GroupedArray): this {
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

    map<R>(mapFn: (value: Data, index?: number, array?: Data[]) => R): R[] {
        return this.array.map(mapFn);
    }

    forEach(callback: (value: Data, index?: number, array?: Data[]) => void): void {
        this.array.forEach(callback);
    }

    find(value: Data): Data {
        if (this.empty()) {
            return undefined;
        }
        const idx = binarySearch(this.array, value, this.comparator);
        if (idx < 0) {
            return undefined;
        }
        return this.array[idx];
    }

    indexOf(value: Data): number {
        if (this.empty()) {
            return -1;
        }
        return binarySearch(this.array, value, this.comparator);
    }

    findIndex(fn: (curr: Data, index?: number, array?: Data[]) => boolean): number {
        return this.array.findIndex(fn);
    }

    reduce<U>(fn: (prev: U, curr: Data, index?: number, array?: Data[]) => U, initialValue?: U): U {
        return this.array.reduce(fn, initialValue);
    }

    delete(value: Data): this {
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
        return this;
    }

    deleteIndex(index: number): Data[] {
        if (this.empty()) {
            return undefined;
        }
        if (index < 0) {
            return undefined;
        }
        const deleted = this.array.splice(index, 1);
        this.length = this.array.length;
        this.generateNodes();
        return deleted;
    }
}

export default GroupedArray;