import { container } from 'tsyringe';
import { Repository, getRepository } from 'typeorm';
import Users from './models/Users';

const registerRepositories: () => void = () => {
    /* User Repository into container */
    container.register<Repository<Users>>(
        'UsersRepository',
        { useValue: getRepository(Users) },
    );
};

export default registerRepositories;
