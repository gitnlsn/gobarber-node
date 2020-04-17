import express from 'express';
import routes from './routes';

const port = process.env.PORT || 3333;

const app = express();

app.use('/', routes);

app.listen(port, () => {
    /* eslint-disable-next-line no-console */
    console.log(`Listening at port ${port}`);
});
