declare module 'collections/sorted-set' {
    export class SortedSet<T> {
        length: number;
        Iterator: any;
        isSorted: boolean;
        isSet: boolean;
        constructor(
            values?: T[],
            equals?: (a: T, b: T) => boolean,
            compare?: (a: T, b: T) => number,
            getDefault?: any
        );
        constructClone(values?: T[]): SortedSet<T>;
        clone(depth?: number, memo?: any): SortedSet<T>;
        has(value: T): boolean;
        get(value: T): T | undefined;
        addEach(...args: any): void;
        ['delete'](value: T): boolean;
        deleteAll(value: T, equals: (...args: any[]) => any): number;
        indexOf(value: T): number;
        find(value: T): number;
        findValue(value: T): number;
        findLeast(): T;
        findLeastGreaterThan(value: T): T;
        findLeastGreaterThanOrEqual(value: T): T;
        findGreatest(): T;
        findGreatestLessThan(value: T): T;
        findGreatestLessThanOrEqual(value: T): T;
        push(...args: T[]): void;
        unshift(...args: T[]): void;
        pop(): T;
        shift(): T;
        union(collection: T[] | SortedSet<T>): SortedSet<T>;
        intersection(...args: any): SortedSet<T>;
        difference(...args: any): SortedSet<T>;
        symmetricDifference(...args: any): SortedSet<T>;
        slice(): SortedSet<T>;
        splice(index: number, length: number, ...args: any[]): SortedSet<T>;
        swap(index: number, length: number, plus: any): SortedSet<T>;
        reduce<R>(callback: (result?: R, val?: T, key?: any, collection?: SortedSet<T>) => R,
            basis?: R, thisp?: SortedSet<T>): R;
        reduceRight(
            callback: (result?: any, val?: any, key?: any, collection?: any) => any,
            basis?: any, thisp?: any
        ): any;
        min(): T;
        max(): T;
        one(): T;
        clear(): void;
        equals(that: any, equals?: (...args: any[]) => boolean): boolean;
        compare(that: any, compare?: (...args: any[]) => boolean): boolean;
        iterate(start: number, end: number): Iterator<T>;
        toJSON(): T[];
        toArray(): T[];
        map<R>(
            callback: (value: T, index: number, coll: SortedSet<T>) => R,
            thisp?: this
        ): R[];
    }
}