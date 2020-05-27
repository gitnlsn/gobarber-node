import express, {
    Response,
    Request,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { Connection } from 'typeorm';

/* Dependency Containers */
import registerRepositories from './database/container';
import registerServices from './services/container';

/* Routes */
import routes from './network/routers';

/* MIddlewares */
import errorMidleware from './errors/AppErrorMiddleware';
import AuthenticateMiddleware from './network/middlewares/AuthenticateMiddleware';
import ForceHttpsMiddleware from './network/middlewares/ForceHttpsMiddleware';

export interface GoBarberConfigs {
    typeormConnection: Connection;
    forceHttps?: boolean;
}

export async function GoBarberServer({
    typeormConnection,
    forceHttps,
}: GoBarberConfigs): Promise<express.Express> {
    const app = express();

    /* Build database */
    await typeormConnection.runMigrations();

    /* Regsiter dependencies in Tsyringe */
    registerRepositories({ typeormConnection });
    registerServices();

    if (forceHttps) app.use(ForceHttpsMiddleware);
    app.use(express.json());
    app.use(helmet());
    app.use(helmet.contentSecurityPolicy({
        browserSniff: false,
        directives: {
            defaultSrc: ['\'none\''],
            imgSrc: ['\'none\''],
            scriptSrc: ['\'none\''],
            styleSrc: ['\'none\''],
        },
    }));
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
        Barbershop management
            - crud to appointments
            - crud to services
            - crud to profile
     */
    app.use('/barbershop/appointment', AuthenticateMiddleware, routes.BarbershopAppointmentsRouter);
    app.use('/barbershop/service', AuthenticateMiddleware, routes.BarberServicesRouter);
    app.use('/barbershop', AuthenticateMiddleware, routes.BarbershopProfileRouter);

    /*
        Client management
            - Accept/Cancel appointment
     */
    app.use('/client/appointment', AuthenticateMiddleware, routes.BarberClientAppointmentsRouter);

    /* Authentication related routes */
    app.use('/user', routes.SessionRouter);

    app.get('/', (req: Request, res: Response) => res.status(200).json({
        status: 'ok',
        message: 'hello client',
    }));

    app.use(errorMidleware);
    return app;
}
