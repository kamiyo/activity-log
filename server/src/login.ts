import { Router, Response } from 'express';
import { Sequelize, FindOptions, Op, WhereAttributeHash, WhereValue } from 'sequelize';
import * as uniqid from 'uniqid';
import omit from 'lodash/omit';
import argon from 'argon2';

import db from './models';
import { DateTime } from 'luxon';
import jwt from 'jsonwebtoken';
const models = db.models;

const apiRouter = Router();

const jwtSecret = process.env.JWT_SECRET;

apiRouter.post('/login', async (req, res) => {
    const {
        username,
        password,
    } = req.body;

    try {
        const [user] = await models.User.findAll({
            where: {
                username,
            },
        });
        if (!user) {
            throw '';
        }

        const authorized = await argon.verify(user.hash, password);

        if (authorized) {
            const token = jwt.sign(
                { username },
                jwtSecret,
                { issuer: 'jasboys.seanchenpiano.com', }
            );
            res.status(200).cookie('_al_jwt', token, {
                path: '/api',
                maxAge: Number.MAX_SAFE_INTEGER,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            });
        } else {
            throw '';
        }

    } catch (err) {
        res.status(401).json({
            error: 'Invalid username or password.',
        });
    }
});

apiRouter.post('/logout', async (req, res) => {
    res.status(200).clearCookie('_al_jwt', {
        path: '/api',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });
});
