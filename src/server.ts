import express from 'express';
import { createConnection } from 'typeorm';

import cors from 'cors';
import routes from './routes';
import errorMidleware from './errors/AppErrorMiddleware';

import registerRepositories from './database/container';
import registerServices from './services/container';

const port = process.env.PORT || 3333;

const app = express();

createConnection()
    .then((connection) => connection.runMigrations())
    .then(() => {
        registerRepositories();
        registerServices();
    });

app.use(express.json());
app.use(cors());
app.use('/user', routes.AuthenticationRoute);
app.use(errorMidleware);

app.listen(port, () => {
    /* eslint-disable-next-line no-console */
    console.log(`Listening at port ${port}`);
});
