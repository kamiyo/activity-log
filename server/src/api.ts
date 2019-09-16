import { Router, Response } from 'express';
import { Sequelize, FindOptions } from 'sequelize';

import db from './models';
const models = db.models;

const apiRouter = Router();

const handleError = (res: Response, err: string) => {
    res.status(500).json({
        status: 'failure',
        data: {
            error: err,
        },
    });
}

apiRouter.get('/activities', async (req, res) => {
    const {
        limit,
        page,
    } = req.query;

    const findOptions: FindOptions = {
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        order: [
            ['dateTime', 'DESC'],
        ],
    };

    if (limit) {
        const offset = page ? limit * (page - 1) : 0;
        findOptions.limit = limit;
        findOptions.offset = offset;
    }

    try {
        const activities = await models.Activity.findAll(findOptions);
        res.json({
            status: 'success',
            data: {
                activities,
            },
        });
    } catch (err) {
        handleError(res, err);
    }
});

apiRouter.post('/activities', async (req, res) => {
    const {
        dateTime,
        type,
        amount
    } = req.body;

    try {
        const activity = await models.Activity.create({
            dateTime,
            type,
            amount: parseFloat(amount),
        });

        res.json({
            status: 'success',
            data: {
                activities: [activity],
            },
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
        amount
    } = req.body;

    try {
        const [_, activities] = await models.Activity.update({
            dateTime,
            type,
            amount: parseFloat(amount),
        }, {
            where: { id },
        });

        res.json({
            status: 'success',
            data: {
                activities,
            },
        });
    } catch (err) {
        handleError(res, err);
    }
});

apiRouter.delete('/activities/:id', async (req, res) => {
    try {
        const numRows = await models.Activity.destroy({
            where: {
                id: req.params.id,
            },
        });
        res.json({
            status: 'success',
        });
    } catch (err) {
        handleError(res, err);
    }
});

export const ApiRouter = apiRouter;
