import * as dotenv from 'dotenv';
import * as path from 'path';
import helmet from 'helmet';
import mustacheExpress from 'mustache-express';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import { ApiRouter } from './api';

const app = express();

app.set('trusted-proxy', 'loopback');
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.engine('html', mustacheExpress(path.resolve(__dirname, '../../web/build'), '.html'));
app.set('view engine', 'html')
app.set('views', path.resolve(__dirname, '../../web/build'));

const csrfProtection = csurf({
    cookie: {
        key: '_al_csrf',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: true,
    },
});
const parseForm = express.urlencoded({ extended: false });

app.use(/\/api\/v1/, parseForm, csrfProtection, ApiRouter);

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.get('/', csrfProtection, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), { secure: process.env.NODE_ENV === 'production', httpOnly: true });
    res.render('index', {});
});

app.use(express.static(path.join(__dirname, '../../web/build')));

const port = 8888;

app.listen(port, '127.0.0.1', () => console.log(`App listening on port ${port}`));
