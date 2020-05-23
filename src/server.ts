/* eslint-disable no-console */
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import { GoBarberServer } from './app';
import database from './database';

dotenv.config();

if (process.env.VERBOSE === 'true') {
    console.log({
        NODE_PORT: process.env.NODE_PORT,

        POSTGRES_HOST: process.env.POSTGRES_HOST,
        POSTGRES_PORT: process.env.POSTGRES_PORT,
        POSTGRES_USERNAME: process.env.POSTGRES_USERNAME,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        POSTGRES_DATABASE_NAME: process.env.POSTGRES_DATABASE_NAME,

        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    });
}

createConnection(database.config).then((connection) => {
    GoBarberServer({ typeormConnection: connection }).then((app) => {
        app.listen(Number(process.env.PORT), () => {
            console.log(`Listening at port ${process.env.NODE_PORT}`);
        });
    }).catch((error) => {
        console.error(error);
    });
});
