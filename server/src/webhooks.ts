import { Router, Response } from 'express';
import * as uniqid from 'uniqid';

import db from './models';
import { verifyLogin } from './login';
import { ActivityType } from './models/activity';
import { DateTime } from 'luxon';
import { generateTimeSinceAndStats } from './api';
import { FindOptions } from 'sequelize/types';

const models = db.models;

const webhookRouter = Router();

const handleError = (res: Response, err: string) => {
    res.status(500).json({ error: err });
}

webhookRouter.use(verifyLogin);

const handleGetLatest = async (type: ActivityType): Promise<string> => {
    const [lastEvent] = await models.Activity.findAll({
        where: {
            type: type as ActivityType,
        },
        order: [['dateTime', 'desc']],
        limit: 1,
    });
    const dt = DateTime.fromJSDate(lastEvent.dateTime);
    return `The last ${type} was ${dt.toRelativeCalendar()} at ${dt.toLocaleString(DateTime.TIME_24_SIMPLE)}${lastEvent.amount ? ` of ${lastEvent.amount} ${unitMap[lastEvent.type as keyof typeof unitMap]}` : ''}.`;
};

const unitMap = {
    meal: 'ounces',
    sleep: 'hours',
};

const handleCreateEvent = async (type: ActivityType, dateTime: string, amount?: string): Promise<string> => {
    const id = uniqid.process();
    let dt = DateTime.fromISO(dateTime);
    const { hour, minute } = dt.toObject();
    const normalizedDateTime = DateTime.local().startOf('day').set({ hour, minute });
    const created = await db.sequelize.transaction(async t => {
        const newAct = await models.Activity.create({
            id,
            dateTime: normalizedDateTime,
            type,
            notes: '',
            amount: amount ? parseFloat(amount) : null,
        }, { transaction: t });
        await generateTimeSinceAndStats(t);
        return newAct;
    });
    const unit = (!!created.amount) ? unitMap[created.type as keyof typeof unitMap] : ''
    return `Okay. ${!!created.amount ? created.amount : ''} ${unit} ${created.type} at ${DateTime.fromJSDate(created.dateTime).toLocaleString(DateTime.TIME_24_SIMPLE)}, created.`;
};

const handleUpdateLatest = async (amount: number, type?: ActivityType): Promise<string> => {
    const result = await db.sequelize.transaction(async t => {
        const findOptions: FindOptions = {
            order: [['dateTime', 'desc']],
            limit: 1,
            transaction: t,
        };
        if (!!type) {
            findOptions.where = {
                type,
            };
        }
        try {
            let [latest] = await models.Activity.findAll(findOptions);
            latest = await latest.update({ amount }, { transaction: t });
            await generateTimeSinceAndStats(t);
            return latest;
        } catch (err) {
            console.log(err);
            throw err;
        }
    });
    return `Done. Updated the ${result.type} at ${DateTime.fromJSDate(result.dateTime).toLocaleString(DateTime.TIME_24_SIMPLE)} to ${result.amount ? result.amount : ''} ${unitMap[result.type as keyof typeof unitMap] || ''}.`;
}

webhookRouter.post('/list', async (req, res) => {
    try {
        console.log(req.body.queryResult);
        const command = req.body.queryResult.parameters['Command'];
        const type = req.body.queryResult.parameters['Activity-Type'];
        let response: string;
        switch (command) {
            case 'When':
                response = await handleGetLatest(type);
                break;
            case 'Add':
                response = await handleCreateEvent(type, req.body.queryResult.parameters['Time'], req.body.queryResult.parameters['Amount']);
                break;
            case 'Update':
                response = await handleUpdateLatest(req.body.queryResult.parameters['Amount'], type);
                break;
            default:
                response = '';
        }
        res.setHeader('Content-Type', 'application/json');
        res.json({
            payload: {
                google: {
                    expectUserResponse: true,
                    richResponse: {
                        items: [
                            {
                                simpleResponse: {
                                    textToSpeech: `${response} Need anything else?`,
                                }
                            }
                        ]
                    }
                }
            }
        });
    } catch (err) {
        res.status(400).json({
            error: 'Error!',
        });
    }
});

export const WebhookRouter = webhookRouter;
