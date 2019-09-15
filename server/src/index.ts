import * as express from 'express';
import * as path from 'path';

const app = express();

app.use(express.static(path.join(__dirname, '../../web/build')));

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../web/build/index.html'));
});

const port = 8888;

app.listen(port, '127.0.0.1', () => console.log(`App listening on port ${port}`));
