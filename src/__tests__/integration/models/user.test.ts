import { Repository, createConnection, Connection } from 'typeorm';
import User from '../../../database/models/User';

describe('User data access', () => {
    let connection: Connection;
    let usersRepository: Repository<User>;

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
        usersRepository = connection.getRepository(User);
    });

    afterEach(async () => {
        await connection.query('delete from users');
    });

    afterAll(async () => {
        await connection.close();
    });

    describe('CRUD', () => {
        it('Should register a common user', async () => {
            const user = usersRepository.create();
            user.name = 'john doe';
            user.email = 'johndoe@mail.com';
            user.password = 'hash of an incredibly strong password';
            const updatedUser = await usersRepository.save(user) as User;

            expect(updatedUser).toHaveProperty('id');
            expect(updatedUser).toHaveProperty('name', user.name);
            expect(updatedUser).toHaveProperty('email', user.email);
            expect(updatedUser).toHaveProperty('password', user.password);
            expect(updatedUser).toHaveProperty('createdAt');
            expect(updatedUser).toHaveProperty('updatedAt');
        });

        it('Should modify an existing user and update its attributes', async () => {
            const user = usersRepository.create();
            user.name = 'john doe';
            user.email = 'johndoe@mail.com';
            user.password = 'hash of an incredibly strong password';
            await usersRepository.save(user);

            const existingUser = await usersRepository.findOne({ email: user.email });
            if (!existingUser) {
                throw Error('User is supposed to exist');
            }
            existingUser.name = 'Peter parker';
            existingUser.email = 'spider@mail.com';
            existingUser.password = 'another hash of an incredibly strong password';
            existingUser.updatedAt = new Date();
            const updatedUser = await usersRepository.save(existingUser) as User;

            expect(updatedUser).toHaveProperty('name', existingUser.name);
            expect(updatedUser).toHaveProperty('email', existingUser.email);
            expect(updatedUser).toHaveProperty('password', existingUser.password);
            expect(updatedUser).toHaveProperty('createdAt');
            expect(updatedUser).toHaveProperty('updatedAt', existingUser.updatedAt);
        });
    });
});
