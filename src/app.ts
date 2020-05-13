import 'reflect-metadata';

import express from 'express';
import { Connection } from 'typeorm';

import cors from 'cors';
import routes from './network/routers';
import errorMidleware from './errors/AppErrorMiddleware';
import AuthenticateMiddleware from './network/middlewares/AuthenticateMiddleware';

import registerRepositories from './database/container';
import registerServices from './services/container';

export interface GoBarberConfigs {
    typeormConnection: Connection;
}

export async function GoBarberServer({
    typeormConnection,
}: GoBarberConfigs): Promise<express.Express> {
    const app = express();

    await typeormConnection.runMigrations();
    registerRepositories({ typeormConnection });
    registerServices();

    app.use(express.json());
    app.use(cors());

    app.use(
        '/appointments',
        AuthenticateMiddleware,
        routes.AppointmentsRouter,
    );

    app.use(
        '/services',
        AuthenticateMiddleware,
        routes.BarberServicesRouter,
    );

    app.use(
        '/barbershop',
        AuthenticateMiddleware,
        routes.BarbershopRouter,
    );

    app.use('/user', routes.SessionRouter);

    app.use(errorMidleware);
    return app;
}
