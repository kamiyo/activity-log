import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import * as express from 'express';
import { ApiRouter } from './api';

const app = express();

app.use(express.json())
app.use(express.static(path.join(__dirname, '../../web/build')));

app.use(/\/api\/v1/, ApiRouter);

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../web/build/index.html'));
});

const port = 8888;

app.listen(port, '127.0.0.1', () => console.log(`App listening on port ${port}`));
