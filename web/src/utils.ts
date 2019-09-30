import { DateTime, Duration } from 'luxon';
import * as path from 'path';
import { Interval, RawStats, Stats, BaseStats } from './types';

export const getTimeAgo = (dateTime: DateTime): string => {
    const now = DateTime.local();
    const diff = now.diff(dateTime, ['hours', 'minutes']);
    const hours = diff.hours;
    const minutes = Math.round(diff.minutes);
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
};

export const formatDuration = (dur: Duration): string => {
    const hours = dur.hours;
    const minutes = Math.round(dur.minutes);
    return `-${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
};

export const formatInterval = (interval: Interval, initial = '-'): string => {
    return Object.entries(interval).reduce((prev, [unit, amount]: [string, number]) => {
        const rounded = Math.round(amount);
        if (rounded === 0) return prev;
        const adjustedUnit = (rounded > 1) ? unit : unit.substring(0, unit.length - 1);
        return prev + ((prev === initial) ? '' : ' ') + `${rounded} ${adjustedUnit}`;
    }, initial);
};

export const getPath = (url: string): string => {
    return path.join('/', PUBLIC_PATH, url);
};

export const rawToStats = (stats: RawStats[]): Stats => {
    return stats.reduce((prev, stat) => {
        const type = stat.type;
        delete stat.type;
        Object.entries(stat as BaseStats).forEach(([key, interval]: [keyof BaseStats, Interval]) => {
            stat[key] = Duration.fromObject(interval).shiftTo('days', 'hours', 'minutes').normalize().toObject();
        });
        return ({
            ...prev,
            [type]: {
                ...stat as BaseStats,
            },
        });
    }, {} as Stats);
}
