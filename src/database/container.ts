import { container } from 'tsyringe';
import { Repository, getRepository } from 'typeorm';

import User from './models/User';
import Barbershop from './models/Barbershop';
import Appointment from './models/Appointment';

const registerRepositories: () => void = () => {
    container.register<Repository<User>>(
        'UsersRepository',
        { useValue: getRepository(User) },
    );

    container.register<Repository<Barbershop>>(
        'BarbershopsRepository',
        { useValue: getRepository(Barbershop) },
    );

    container.register<Repository<Appointment>>(
        'AppointmentsRepository',
        { useValue: getRepository(Appointment) },
    );
};

export default registerRepositories;
