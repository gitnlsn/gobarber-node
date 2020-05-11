import { Connection, createConnection } from 'typeorm';
import { createHash } from 'crypto';
import { container } from 'tsyringe';

import registerRepositories from '../../database/container';
import registerServices from '../../services/container';
import RegisterUserService from '../../services/user/implementations/RegisterUserService';

describe('Managing a Barbershop', () => {
    let connection: Connection;

    const userName = 'john doe';
    const userEmail = 'test@mail.com';
    const userPassword = createHash('sha256').update('password').digest('hex');

    const shopName = 'Very creative name';
    const shopAddress = 'shop address';

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
        registerRepositories();
        registerServices();
    });

    afterEach(async () => {
        await connection.query('DELETE FROM users;');
    });

    afterAll(async () => {
        await connection.close();
    });

    /* TODO */
    // test('Register barbershop account', () => {
    //     const registerUserService = container.resolve(RegisterUserService);
    //     container.resolve();
    // });
});
