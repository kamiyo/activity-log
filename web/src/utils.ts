import { DateTime, Duration } from 'luxon';
import * as path from 'path';

export const getTimeAgo = (dateTime: DateTime) => {
    const now = DateTime.local();
    const diff = now.diff(dateTime, ['hours', 'minutes']);
    const hours = diff.hours;
    const minutes = Math.round(diff.minutes);
    return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''} ago`;
};

export const formatDuration = (dur: Duration) => {
    const hours = dur.hours;
    const minutes = Math.round(dur.minutes);
    return `-${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`;
};

export const getPath = (url: string) => {
    return path.resolve('/', PUBLIC_PATH, url);
};
