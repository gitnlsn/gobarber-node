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

    /*
        General Retrievers:

        appointments
            - by availability
            - by barbershop (TODO)
            - by service (TODO)
        services
            - find by serviceType
            - find by barbershop
            - find by price range (TODO)
        barbershops
            - find by provided serviceTypes (TODO)
     */
    app.use('/appointments', routes.AppointmentsFinderRouter);
    app.use('/services', routes.BarbershopServiceFinder);
    app.use('/barbershops', routes.BarbershopProfileFinder);

    /*
        Crud to
            - barbershop appointments management
            - barbershop services management
            - barbershop profile management
     */
    app.use('/barbershop/appointment', AuthenticateMiddleware, routes.BarbershopAppointmentsRouter);
    app.use('/barbershop/service', AuthenticateMiddleware, routes.BarberServicesRouter);
    app.use('/barbershop', AuthenticateMiddleware, routes.BarbershopProfileRouter);

    /* Client Accept/Cancel routes to appointment */
    app.use('/client/appointment/', AuthenticateMiddleware, routes.BarberClientAppointmentsRouter);

    /* Authentication related routes */
    app.use('/user', routes.SessionRouter);

    app.use(errorMidleware);
    return app;
}
