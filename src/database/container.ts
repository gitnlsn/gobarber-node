import { container } from 'tsyringe';
import {
    Repository,
    Connection,
} from 'typeorm';

import User from './models/User';
import Barbershop from './models/Barbershop';
import Appointment from './models/Appointment';
import BarberServicesRepository from './repositories/BarberServiceRepository';
import BarbershopsRepository from './repositories/BarbershopsRepository';
import ServiceType from './models/ServiceType';

export interface RegisterRepositoriesProps {
    typeormConnection: Connection;
}

function registerRepositories({
    typeormConnection,
}: RegisterRepositoriesProps) {
    container.register<Repository<User>>(
        'UsersRepository',
        { useValue: typeormConnection.getRepository(User) },
    );

    container.register<Repository<Barbershop>>(
        'BarbershopsRepository',
        { useValue: typeormConnection.getRepository(Barbershop) },
    );

    container.register<Repository<Appointment>>(
        'AppointmentsRepository',
        { useValue: typeormConnection.getRepository(Appointment) },
    );

    container.register<Repository<ServiceType>>(
        'ServiceTypeRepository',
        { useValue: typeormConnection.getRepository(ServiceType) },
    );

    container.register<BarberServicesRepository>(
        'BarberServicesRepository',
        { useValue: typeormConnection.getCustomRepository(BarberServicesRepository) },
    );

    container.register<BarbershopsRepository>(
        'BarbershopsRepository',
        { useValue: typeormConnection.getCustomRepository(BarbershopsRepository) },
    );
}

export default registerRepositories;
