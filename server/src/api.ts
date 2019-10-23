import { Router, Response } from 'express';
import { FindOptions, Op, Transaction, QueryTypes, QueryOptionsWithType, Sequelize } from 'sequelize';
import * as uniqid from 'uniqid';

import db from './models';
import { DateTime } from 'luxon';
import { verifyLogin } from './login';
import { Activity } from './models/activity';
import { TimeStats } from './models/timeStats';
import { WhereOptions } from 'sequelize';
// import { ActivityType, ActivityTypeMap } from './models/activity';
const models = db.models;

const apiRouter = Router();

export const handleError = (res: Response, err: string) => {
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

    let dateTime: WhereOptions = {};
    let lowerBound, upperBound;

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
            lowerBound = DateTime.fromSeconds(parseInt(after)).toJSDate();
            dateTime = {
                [Op.gt]: lowerBound,
            };
            findOptions.where = {
                dateTime,
            };
        } else {
            findOptions.limit = findOptions.limit || 25;
        }

        if (before) {
            upperBound = DateTime.fromSeconds(parseInt(before)).toJSDate();
            dateTime = {
                ...dateTime,
                [Op.lt]: upperBound,
            };
            findOptions.where = {
                dateTime,
            };
        }
    }

    try {
        const [activities, stats] = await db.sequelize.transaction(async t => {
            const returned = await models.Activity.findAll({
                ...findOptions,
                transaction: t,
            });
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

apiRouter.get('/daily-amounts', async (req, res) => {
    let {
        zone
    } = req.query;

    if (!zone) {
        zone = DateTime.local().offsetNameShort;
    }

    try {
        const dailyAmounts = await db.sequelize.query(`
            SELECT
                "type",
                date_trunc('day', "dateTime" AT TIME ZONE :zone) AS date,
                sum(amount)
            FROM
                activity
            GROUP BY
                date_trunc('day', "dateTime" AT TIME ZONE :zone),
                "type"
            HAVING
                sum(amount) IS NOT null
            ORDER BY date DESC;
        `, {
            replacements: {
                zone,
            },
            type: QueryTypes.SELECT,
            raw: true,
        });

        console.log(dailyAmounts);

        res.json({
            dailyAmounts,
        });

    } catch (e) {
        handleError(res, e);
    }
});

export const ApiRouter = apiRouter;
