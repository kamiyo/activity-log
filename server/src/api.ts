import { Router, Response } from 'express';
import { FindOptions, Op, WhereOperators, Transaction, QueryTypes, QueryOptionsWithType } from 'sequelize';
import * as uniqid from 'uniqid';

import db from './models';
import { DateTime } from 'luxon';
import { verifyLogin } from './login';
import { Activity } from './models/activity';
import { TimeStats } from './models/timeStats';
// import { ActivityType, ActivityTypeMap } from './models/activity';
const models = db.models;

const apiRouter = Router();

const handleError = (res: Response, err: string) => {
    res.status(500).json({ error: err });
}

apiRouter.use(verifyLogin);

export const generateTimeSinceAndStats = async (t: Transaction): Promise<{ activities: [Activity[], number]; stats: [TimeStats[], number] }> => {
    const result = await db.sequelize.query(`
        UPDATE activity SET "timeBeforePrev" = diffs.diff
        FROM (
            SELECT
                id,
                LAG(activity."dateTime", 1) OVER (
                    PARTITION BY activity."type"
                    ORDER BY activity."dateTime" DESC
                ) - activity."dateTime" AS diff
            FROM activity
        ) AS diffs
        WHERE activity.id = diffs.id
        AND "timeBeforePrev" IS DISTINCT FROM diffs.diff
        RETURNING activity.*
    `, {
        transaction: t,
        type: QueryTypes.UPDATE,
        model: models.Activity,
        mapToModel: true,
    } as QueryOptionsWithType<QueryTypes.UPDATE>);
    const stats = await db.sequelize.query(`
        INSERT INTO "timeStats"
        SELECT
            TYPE as type,
            AVG("timeBeforePrev") AS average,
            make_interval(secs=>stddev(EXTRACT(EPOCH FROM "timeBeforePrev"))) AS stddev
        FROM activity GROUP BY "type"
        ON CONFLICT (type) DO UPDATE SET average = EXCLUDED.average, stddev = EXCLUDED.stddev
        RETURNING *
    `, {
        transaction: t,
        type: QueryTypes.UPDATE,
        model: models.TimeStats,
        mapToModel: true,
    } as QueryOptionsWithType<QueryTypes.UPDATE>);
    return {
        activities: result,
        stats,
    };
};

apiRouter.get('/activities', async (req, res) => {
    const {
        before,
        after,
        type,
        limit,
    } = req.query;

    const findOptions: FindOptions = {
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        order: [
            ['dateTime', 'DESC'],
        ],
    };

    const dateTime: WhereOperators = {};

    if (type || limit) {
        if (type) {
            findOptions.where = {
                type,
            };
        }
        if (limit) {
            findOptions.limit = limit;
        }
    } else {
        if (after && after !== 'all') {
            dateTime[Op.gt] = DateTime.fromSeconds(parseInt(after)).toJSDate();
        } else if (!after) {
            if (before) {
                dateTime[Op.gt] = DateTime.fromSeconds(parseInt(before)).minus({ days: 3 }).toJSDate();
            } else {
                dateTime[Op.gt] = DateTime.local().minus({ days: 3 }).toJSDate();
            }
        }

        if (before) {
            dateTime[Op.lt] = DateTime.fromSeconds(parseInt(before)).toJSDate();
        }

        findOptions.where = {
            dateTime,
        };
    }

    try {
        const [activities, stats] = await db.sequelize.transaction(async t => {
            let returned = await models.Activity.findAll({
                ...findOptions,
                transaction: t,
            });
            if (returned.length === 0) {
                returned = await models.Activity.findAll({
                    attributes: {
                        exclude: ['createdAt', 'updatedAt'],
                    },
                    order: [
                        ['dateTime', 'DESC'],
                    ],
                    limit: 20,
                    transaction: t,
                });
            }
            const stats = await models.TimeStats.findAll({
                transaction: t,
            });
            return [returned, stats];
        });

        res.json({ activities, stats });
    } catch (err) {
        handleError(res, err);
    }
});

apiRouter.post('/activities', async (req, res) => {
    const {
        dateTime,
        type,
        amount,
        notes,
    } = req.body;

    const {
        after
    } = req.query;

    if (!type) {
        handleError(res, 'Type cannot be null');
        return;
    }

    const id = uniqid.process();

    try {
        const [created, activities, stats] = await db.sequelize.transaction(async t => {
            const newAct = await models.Activity.create({
                id,
                dateTime: DateTime.fromISO(dateTime).startOf('minute').toISO(),
                type,
                notes,
                amount: amount ? parseFloat(amount) : null,
            }, { transaction: t });
            const {
                activities: returned,
                stats: [statistics,],
            } = await generateTimeSinceAndStats(t);
            let [changed,] = returned;

            changed = [newAct, ...changed];
            if (!!after) {
                changed = changed.filter((act) => DateTime.fromJSDate(act.dateTime) > DateTime.fromSeconds(parseInt(after)));
            }
            return [newAct, changed, statistics];
        });

        res.json({
            activities,
            stats,
            created,
        });
    } catch (err) {
        handleError(res, err);
    }
});

apiRouter.put('/activities/:id', async (req, res) => {
    const id = req.params.id;
    const {
        dateTime,
        type,
        amount,
        notes,
    } = req.body;

    const {
        after
    } = req.query;

    try {
        const [updated, activities, stats] = await db.sequelize.transaction(async (t) => {
            const [, [modified]] = await models.Activity.update({
                dateTime: DateTime.fromISO(dateTime).startOf('minute').toISO(),
                type,
                notes,
                amount: amount ? parseFloat(amount) : null,
            }, {
                where: { id },
                returning: true,
                transaction: t,
            });
            const {
                activities: returned,
                stats: [statistics,],
            } = await generateTimeSinceAndStats(t);
            let [changed,] = returned;

            changed = [modified, ...changed];
            if (!!after) {
                changed = changed.filter((act) => DateTime.fromJSDate(act.dateTime) > DateTime.fromSeconds(parseInt(after)));
            }
            return [modified, changed, statistics];
        });

        res.json({
            activities,
            stats,
            updated,
        });
    } catch (err) {
        handleError(res, err);
    }
});

apiRouter.delete('/activities/:id', async (req, res) => {
    const {
        after
    } = req.query;

    try {
        const [deleted, activities, stats] = await db.sequelize.transaction(async t => {
            const [toDelete] = await models.Activity.findAll({
                where: {
                    id: req.params.id,
                },
                transaction: t,
            });
            await models.Activity.destroy({
                where: {
                    id: req.params.id,
                },
                transaction: t,
            });
            const {
                activities: returned,
                stats: [statistics,],
            } = await generateTimeSinceAndStats(t);
            let [changed,] = returned;

            if (!!after) {
                changed = changed.filter((act) => DateTime.fromJSDate(act.dateTime) > DateTime.fromSeconds(parseInt(after)));
            }
            return [toDelete, changed, statistics];
        });

        res.json({
            deleted,
            stats,
            activities,
        });
    } catch (err) {
        handleError(res, err);
    }
});

export const ApiRouter = apiRouter;
