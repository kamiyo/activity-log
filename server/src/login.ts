import { Router } from 'express';
import argon from 'argon2';
import * as path from 'path';

import db from './models';
import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express-serve-static-core';
import { Dictionary } from 'lodash';
const models = db.models;

const loginRouter = Router();

const jwtSecret = process.env.JWT_SECRET;
const publicPath = process.env.PUBLIC_PATH || '/';

export const verifyLogin: RequestHandler<Dictionary<string>> = async (req, res, next) => {
    const jwtCookie = req.cookies['_al_jwt'];
    if (!req.headers.authorization && !jwtCookie) {
        return res.status(401).json({
            error: 'No credentials sent.',
        });
    }
    if (!!jwtCookie) {
        try {
            const payload = jwt.verify(jwtCookie, jwtSecret, {
                issuer: 'jasboys.seanchenpiano.com',
            });
            const username = (payload as { username: string }).username
            const [user] = await models.User.findAll({
                where: {
                    username,
                },
            });
            if (!user) {
                throw 'user not found.';
            }
            if (req.method !== 'GET') {
                if (user.role !== 'write') {
                    throw 'user not authorized for request.'
                }
            }
            return next();
        } catch (err) {
            console.log(err);
            return res.status(403).json({
                error: 'Invalid credentials.',
            });
        }
    }
    if (req.headers.authorization) {
        const auth = req.headers.authorization;
        const strings = auth.split(' ');
        if (strings[1] !== process.env.DEV_API_KEY
            && req.method !== 'GET') {
            return res.status(403).json({
                error: 'Invalid credentials.',
            });
        } else {
            return next();
        }
    }
};

loginRouter.post('/login', async (req, res) => {
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
        console.log(authorized);
        if (authorized) {
            const token = jwt.sign(
                { username },
                jwtSecret,
                { issuer: 'jasboys.seanchenpiano.com', }
            );
            res.status(200).cookie('_al_jwt', token, {
                path: path.posix.join('/', publicPath, '/api'),
                maxAge: Number.MAX_SAFE_INTEGER,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            }).json({});
        } else {
            throw '';
        }

    } catch (err) {
        res.status(403).json({
            error: 'Invalid username or password.',
        });
    }
});

loginRouter.post('/logout', async (_, res) => {
    res.status(200).clearCookie('_al_jwt', {
        path: path.posix.join('/', publicPath, '/api'),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    }).json({});
});

export const LoginRouter = loginRouter;