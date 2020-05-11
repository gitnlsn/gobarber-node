import { Repository, createConnection, Connection } from 'typeorm';
import User from '../../../database/models/User';
import Barbershop from '../../../database/models/Barbershop';

describe('Barbershop data access', () => {
    let connection: Connection;
    let usersRepository: Repository<User>;
    let shopsRepository: Repository<Barbershop>;

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
        usersRepository = connection.getRepository(User);
        shopsRepository = connection.getRepository(Barbershop);
    });

    afterEach(async () => {
        await connection.query('delete from barbershops');
        await connection.query('delete from users');
    });

    afterAll(async () => {
        await connection.close();
    });

    describe('CRUD', () => {
        it('Should register a common user as barbershop owner', async () => {
            const user = usersRepository.create();
            user.name = 'john doe';
            user.email = 'johndoe@mail.com';
            user.password = 'hash of an incredibly strong password';
            await usersRepository.save(user);

            const barbershop = shopsRepository.create();
            barbershop.name = 'Awesome barbershop';
            barbershop.owner = user;
            barbershop.slogan = 'Your hair like crazy';
            barbershop.description = 'A nice place to have a new stylishing haircut. Every day we design something new to everyday customers. You will never have the same hair twice in your life.';
            barbershop.address = 'John doe street, 432. New Yooork';
            await shopsRepository.save(barbershop);

            expect(barbershop).toHaveProperty('id');
            expect(barbershop).toHaveProperty('name');
            expect(barbershop).toHaveProperty('slogan');
            expect(barbershop).toHaveProperty('description');
            expect(barbershop).toHaveProperty('address');
            expect(barbershop).toHaveProperty('owner');
            expect(barbershop).toHaveProperty('createdAt');
            expect(barbershop).toHaveProperty('updatedAt');

            expect(barbershop.owner.id).toBe(user.id);
        });
    });
});
