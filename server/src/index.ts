import * as dotenv from 'dotenv';
import * as path from 'path';
import helmet from 'helmet';
import mustacheExpress from 'mustache-express';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import { ApiRouter } from './api';
import { LoginRouter } from './login';

const port = parseInt(process.env.EXPRESS_PORT);

const app = express();

app.set('trusted-proxy', 'loopback');
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.engine('html', mustacheExpress(path.resolve(__dirname, '../../web/build'), '.html'));
app.set('view engine', 'html')
app.set('views', path.resolve(__dirname, '../../web/build'));
app.disable('view cache');

const csrfProtection = csurf({
    value: (req) => {
        return req.cookies['XSRF-TOKEN'] || '';
    },
    cookie: {
        key: '_csrf',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: true,
        domain: process.env.NODE_ENV === 'production' ? 'jasboys.seanchenpiano.com' : 'localhost',
        path: path.join('/', process.env.PUBLIC_PATH || ''),
    },
});
const parseForm = express.urlencoded({ extended: false });

app.use(/\/api\/v1/, parseForm, csrfProtection, ApiRouter);
app.use(/\/auth/, parseForm, csrfProtection, LoginRouter);

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.get('/', csrfProtection, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
        secure: process.env.NODE_ENV === 'production',
        sameSite: true,
        httpOnly: true,
        domain: process.env.NODE_ENV === 'production' ? 'jasboys.seanchenpiano.com' : 'localhost',
        path: path.join('/', process.env.PUBLIC_PATH || ''),
    });
    res.render('index', { csrfToken: req.csrfToken() });
});

app.use(express.static(path.join(__dirname, '../../web/build')));

app.listen(port, '127.0.0.1', () => console.log(`App listening on port ${port}`));
