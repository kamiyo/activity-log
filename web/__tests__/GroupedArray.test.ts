import GroupedArray, { dataComp, rawToData } from '../src/GroupedArray';
import diff from 'jest-diff';
import { Data } from '../src/types';
import { DateTime } from 'luxon';

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeSameDateTime(dateTime: DateTime): R
        }
    }
}

expect.extend({
    toBeSameDateTime(received: DateTime, expected: DateTime) {
        const pass = received.hasSame(expected, 'millisecond');
        const message = pass
            ? () =>
                this.utils.matcherHint('toBeSameDateTime', undefined, undefined, {}) +
                '\n\n' +
                `Expected: ${this.utils.printExpected(expected)}\n` +
                `Received: ${this.utils.printReceived(received)}`
            : () => {
                const diffString = diff(expected, received, {
                    expand: this.expand,
                });
                return (
                    this.utils.matcherHint('toBeSameDateTime', undefined, undefined, {}) +
                    '\n\n' +
                    (diffString && diffString.includes('- Expect')
                        ? `Difference:\n\n${diffString}`
                        : `Expected: ${this.utils.printExpected(expected)}\n` +
                        `Received: ${this.utils.printReceived(received)}`)
                );
            };

        return { actual: received, message, pass };
    }
})

describe('Comparator Function', () => {
    it('comp function: same id', () => {
        const randomId = '2340jfskajfkjh';
        const data1 = {
            id: randomId,
            dateTime: DateTime.local(2019, 1, 1, 0, 0, 0, 0),
        };
        const data2 = {
            id: randomId,
            dateTime: DateTime.local(2019, 2, 1, 0, 0, 0, 0),
        };
        expect(dataComp(data1, data2)).toBe(0);
    });

    it('comp function: unequal', () => {
        const data1 = {
            id: 'a',
            dateTime: DateTime.local(2019, 1, 1, 0, 0, 0, 0),
        };
        const data2 = {
            id: 'b',
            dateTime: DateTime.local(2019, 2, 1, 0, 0, 0, 0),
        };
        const data3 = {
            ...data1,
            id: 'c',
        };
        expect(dataComp(data1, data2)).toBe(1);
        expect(dataComp(data2, data1)).toBe(-1);
        expect(dataComp(data3, data1)).toBe(-1);
        expect(dataComp(data1, data3)).toBe(1);
    });
});

describe('GroupedArray', () => {
    const testData = [
        {
            "id": "ga8k0ski9vz",
            "dateTime": "2019-09-20T20:19:18.727Z",
            "type": null,
            "amount": null
        },
        {
            "id": "dh8k0skf5oc",
            "dateTime": "2019-09-20T20:16:55.838Z",
            "type": null,
            "amount": null
        },
        {
            "id": "dh8k0rrp8fz",
            "dateTime": "2019-09-20T17:53:02.957Z",
            "type": "meal",
            "amount": "3.30"
        },
        {
            "id": "dh8k0rrtfb9",
            "dateTime": "2019-09-20T06:56:29.305Z",
            "type": null,
            "amount": null
        },
        {
            "id": "dh8k0rrjz7a",
            "dateTime": "2019-09-20T06:49:03.023Z",
            "type": "meal",
            "amount": "4.00"
        },
        {
            "id": "dh8k0rrrk0r",
            "dateTime": "2019-09-20T05:30:29.556Z",
            "type": "meal",
            "amount": "5.00"
        },
        {
            "id": "dh8k0rrosho",
            "dateTime": "2019-09-19T19:52:00.000Z",
            "type": "poop",
            "amount": null
        },
        {
            "id": "320k0n6ia7p",
            "dateTime": "2019-09-16T21:26:00.000Z",
            "type": "meal",
            "amount": "2.50"
        },
        {
            "id": "gdkk0q6iycm",
            "dateTime": "2019-09-13T21:20:00.000Z",
            "type": "meal",
            "amount": "2.50"
        },
    ];
    const mappedData = testData.map(rawToData);
    const shuffled = (inputArray: any[]) => {
        const array = [...inputArray];
        let curr = array.length;
        let temp: any;
        let random: number;
        while (curr !== 0) {
            random = Math.floor(Math.random() * curr);
            curr -= 1;

            temp = array[curr];
            array[curr] = array[random];
            array[random] = temp;
        }
        return array;
    };
    it('new empty GroupedArray', () => {
        const ga = new GroupedArray([], dataComp);
        expect(ga.length).toBe(0);
    });
    it('new from Data array', () => {
        const ga = new GroupedArray(shuffled(mappedData), dataComp, false);
        expect(ga.array[ga.array.length - 1].id).toBe(testData[mappedData.length - 1].id);
        expect(ga.array[0].id).toBe(mappedData[0].id);
    })
    it('new GroupedArray from Array', () => {
        const ga = new GroupedArray(testData, dataComp, true);
        expect(ga.array[ga.array.length - 1].id).toBe(testData[testData.length - 1].id);
        expect(ga.array[0].id).toBe(testData[0].id);
    });
    it('sorting sorted Array', () => {
        const ga = new GroupedArray(testData, dataComp, false);
        expect(ga.array[ga.array.length - 1].id).toBe(testData[testData.length - 1].id);
        expect(ga.array[0].id).toBe(testData[0].id);
    });
    it('sorting unsorted Array', () => {
        const ga = new GroupedArray(shuffled(testData), dataComp, false);
        expect(ga.array[ga.array.length - 1].id).toBe(testData[testData.length - 1].id);
        expect(ga.array[0].id).toBe(testData[0].id);
    });
    it('pushing raw', () => {
        const ga = new GroupedArray([], dataComp);
        ga.push(testData[0]);
        expect(ga.array[0].id).toBe(testData[0].id);
    });
    it('pushing data', () => {
        const ga = new GroupedArray([], dataComp);
        ga.push(mappedData[0]);
        expect(ga.array[0].id).toBe(mappedData[0].id);
    });
    it('pushing duplicate', () => {
        const ga = new GroupedArray([], dataComp);
        ga.push(mappedData[0]);
        ga.push(mappedData[0]);
        expect(ga.length).toBe(1);
        expect(ga.array[0].id).toBe(mappedData[0].id);
    });
    it('updating', () => {
        const ga = new GroupedArray([], dataComp);
        ga.push(mappedData[0]);
        ga.push({ ...mappedData[0], type: 'meal' });
        expect(ga.length).toBe(1);
        expect(ga.array[0].id).toBe(mappedData[0].id);
        expect(ga.array[0].type).toBe('meal');
    });
    it('inserting order', () => {
        const ga = new GroupedArray([], dataComp);
        ga.push(mappedData[1]);
        expect(ga.array[0].id).toBe(mappedData[1].id);
        ga.push(mappedData[0]);
        expect(ga.array[0].id).toBe(mappedData[0].id);
        expect(ga.array[1].id).toBe(mappedData[1].id);
    });
    it('push unsorted', () => {
        const ga = new GroupedArray([], dataComp);
        ga.push(...shuffled(mappedData));
        expect(ga.array[0].id).toBe(mappedData[0].id);
        expect(ga.array[ga.length - 1].id).toBe(mappedData[mappedData.length - 1].id);
    });
    it('concat', () => {
        const ga = new GroupedArray([], dataComp);
        const ga2 = new GroupedArray(mappedData.slice(0, 3), dataComp, true);
        ga.concat(ga2);
        expect(ga.length).toBe(3);
        expect(ga.array[2].id).toBe(mappedData[2].id);
        const ga3 = new GroupedArray(mappedData.slice(3), dataComp, true);
        ga.concat(ga3);
        expect(ga.length).toBe(mappedData.length);
        expect(ga.array[ga.length - 1].id).toBe(mappedData[mappedData.length - 1].id);
        ga2.concat(new GroupedArray(mappedData.slice(2), dataComp));
        expect(ga2.length).toBe(mappedData.length);
        expect(ga2.array[ga2.length - 1].id).toBe(mappedData[mappedData.length - 1].id);
    });
    it('find', () => {
        const ga = new GroupedArray(shuffled(mappedData), dataComp, false);
        const found = ga.find(mappedData[4]);
        expect(found.id).toBe(mappedData[4].id);
    });
    it('indexOf', () => {
        const ga = new GroupedArray(shuffled(mappedData), dataComp, false);
        const idx = ga.indexOf(mappedData[4]);
        expect(idx).toBe(4);
    });
    it('delete', () => {
        const ga = new GroupedArray(shuffled(mappedData), dataComp, false);
        ga.delete(mappedData[4]);
        expect(ga.length).toBe(mappedData.length - 1);
        expect(ga.array[4].id).toBe(mappedData[5].id);
    });
    it('node correctness', () => {
        const ga = new GroupedArray(shuffled(mappedData), dataComp, false);
        expect(ga.nodes.length).toBe(8);
        expect(ga.nodes[0].dateTime).toBeSameDateTime(ga.array[0].dateTime.startOf('day'));
        expect(ga.nodes[0].index).toBe(0);
        expect(ga.nodes[1].index).toBe(6);
        expect(ga.nodes[1].dateTime).toBeSameDateTime(ga.array[6].dateTime.startOf('day'));
        expect(ga.nodes[4].index).toBe(7);
        expect(ga.nodes[4].dateTime).toBeSameDateTime(ga.array[7].dateTime.startOf('day'));
        expect(ga.nodes[7].index).toBe(8);
        expect(ga.nodes[7].dateTime).toBeSameDateTime(ga.array[8].dateTime.startOf('day'));
        ga.push({
            "id": "a",
            "dateTime": "2019-09-20T18:00:00.000Z",
            "type": "meal",
            "amount": "3.30"
        });
        expect(ga.nodes.length).toBe(8);
        expect(ga.nodes[0].dateTime).toBeSameDateTime(ga.array[0].dateTime.startOf('day'));
        expect(ga.nodes[0].index).toBe(0);
        expect(ga.nodes[1].index).toBe(7);
        expect(ga.nodes[1].dateTime).toBeSameDateTime(ga.array[7].dateTime.startOf('day'));
        expect(ga.nodes[4].index).toBe(8);
        expect(ga.nodes[4].dateTime).toBeSameDateTime(ga.array[8].dateTime.startOf('day'));
        expect(ga.nodes[7].index).toBe(9);
        expect(ga.nodes[7].dateTime).toBeSameDateTime(ga.array[9].dateTime.startOf('day'));
        ga.delete({
            id: 'a',
            dateTime: DateTime.fromISO('2019-09-20T18:00:00.000Z'),
        });
        expect(ga.nodes.length).toBe(8);
        expect(ga.nodes[0].dateTime).toBeSameDateTime(ga.array[0].dateTime.startOf('day'));
        expect(ga.nodes[0].index).toBe(0);
        expect(ga.nodes[1].index).toBe(6);
        expect(ga.nodes[1].dateTime).toBeSameDateTime(ga.array[6].dateTime.startOf('day'));
        expect(ga.nodes[4].index).toBe(7);
        expect(ga.nodes[4].dateTime).toBeSameDateTime(ga.array[7].dateTime.startOf('day'));
        expect(ga.nodes[7].index).toBe(8);
        expect(ga.nodes[7].dateTime).toBeSameDateTime(ga.array[8].dateTime.startOf('day'));
    });
    it('toGrouped', () => {
        const ga = new GroupedArray(shuffled(mappedData), dataComp);
        const map = ga.toGrouped();
        expect(map.length).toBe(ga.nodes.length);
        expect(map[0].data.length).toBe(6);
        expect(map[0].amount).toBeCloseTo(12.30);
        expect(map[1].dateTime).toBeSameDateTime(mappedData[6].dateTime.startOf('day'));
        expect(map[1].data.length).toBe(1);
        expect(map[2].data.length).toBe(0);
    })
});