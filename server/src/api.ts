import { Router, Response } from 'express';
import { Sequelize, FindOptions, Op, WhereAttributeHash, WhereValue } from 'sequelize';
import * as uniqid from 'uniqid';
import jwt from 'jsonwebtoken';

import db from './models';
import { DateTime } from 'luxon';
import { verifyLogin } from './login';
const models = db.models;

const apiRouter = Router();

const handleError = (res: Response, err: string) => {
    res.status(500).json({ error: err });
}

apiRouter.use(verifyLogin);

apiRouter.get('/activities', async (req, res) => {
    const {
        before,
        after,
    } = req.query;

    const findOptions: FindOptions = {
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        order: [
            ['dateTime', 'DESC'],
        ],
    };

    const dateTime: any = {};

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

    try {
        let activities = await models.Activity.findAll(findOptions);
        if (activities.length === 0) {
            activities = await models.Activity.findAll({
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
                order: [
                    ['dateTime', 'DESC'],
                ],
                limit: 20,
            });
        }
        res.json({ activities });
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
        await models.Activity.create({
            id,
            dateTime,
            type,
            notes,
            amount: amount ? parseFloat(amount) : null,
        });

        const [created] = await models.Activity.findAll({
            where: {
                id,
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt'],
            },
        });

        res.json({
            activities: (!!after && DateTime.fromJSDate(created.dateTime) > DateTime.fromSeconds(parseInt(after)))
                ? [created]
                : [],
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
        await models.Activity.update({
            dateTime,
            type,
            notes,
            amount: amount ? parseFloat(amount) : null,
        }, {
            where: { id },
        });

        const [updated] = await models.Activity.findAll({
            where: {
                id,
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt'],
            },
        });

        res.json({
            activities: (!!after && DateTime.fromJSDate(updated.dateTime) > DateTime.fromSeconds(parseInt(after)))
                ? [updated]
                : [],
            updated,
        });
    } catch (err) {
        handleError(res, err);
    }
});

apiRouter.delete('/activities/:id', async (req, res) => {
    try {
        await models.Activity.destroy({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).json({});
    } catch (err) {
        handleError(res, err);
    }
});

export const ApiRouter = apiRouter;
