import { Connection, createConnection, Repository } from 'typeorm';
import { isUuid } from 'uuidv4';
import BarbershopsRepository from '../../../database/repositories/BarbershopsRepository';
import User from '../../../database/models/User';
import Barbershop from '../../../database/models/Barbershop';

describe('Barbershop Repository', () => {
    let connection: Connection;
    let userRepository: Repository<User>;
    let shopRepository: BarbershopsRepository;

    const defaultUser = {
        email: 'user@mail.com',
        password: 'very strong password',
    } as User;

    const defaultBarbershop = {
        name: 'CrazyHair',
        description: 'Your amazing haircut',
        address: 'Hair avenue',
    } as Barbershop;

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
        userRepository = connection.manager.getRepository(User);
        shopRepository = connection.manager.getCustomRepository(BarbershopsRepository);
    });

    afterEach(async () => {
        await connection.query('delete from barbershops');
        await connection.query('delete from users');
    });

    afterAll(async () => {
        await connection.close();
    });

    it('Should create a barbershop in database if none exists', async () => {
        const savedUser = await userRepository.save(defaultUser);
        await shopRepository.save({
            ...defaultBarbershop,
            owner: savedUser,
        });

        const savedBarbershop = await connection
            .createQueryBuilder()
            .select('barbershops')
            .from(Barbershop, 'barbershops')
            .where('barbershops.user_id = :id', { id: savedUser.id })
            .getOne() as Barbershop;

        expect(isUuid(savedBarbershop.id)).toBeTruthy();
        expect(savedBarbershop).toHaveProperty('name', defaultBarbershop.name);
        expect(savedBarbershop).toHaveProperty('description', defaultBarbershop.description);
        expect(savedBarbershop).toHaveProperty('address', defaultBarbershop.address);
        expect(savedBarbershop).toHaveProperty('status', 'enabled');
        expect(savedBarbershop).toHaveProperty('slogan');
        expect(savedBarbershop).toHaveProperty('createdAt');
        expect(savedBarbershop).toHaveProperty('updatedAt');
    });

    it('Should update a barbershop in database if any exists with status \'enabled\'', async () => {
        const savedUser = await userRepository.save(defaultUser);
        await shopRepository.save({
            ...defaultBarbershop,
            owner: savedUser,
        });

        await shopRepository.save({
            ...defaultBarbershop,
            name: 'Updated shop name',
            owner: savedUser,
        });

        const storedShopList = await connection
            .createQueryBuilder()
            .select('barbershops')
            .from(Barbershop, 'barbershops')
            .where('barbershops.user_id = :id', { id: savedUser.id })
            .getMany() as Barbershop[];

        expect(storedShopList.length).toBe(1);
        expect(storedShopList[0].name).toBe('Updated shop name');
    });

    it('Should update a barbershop in database if any exists with status \'disabled\'', async () => {
        const savedUser = await userRepository.save(defaultUser);
        await shopRepository.save({
            ...defaultBarbershop,
            status: 'disabled',
            owner: savedUser,
        });

        await shopRepository.save({
            ...defaultBarbershop,
            status: 'disabled',
            name: 'Updated shop name',
            owner: savedUser,
        });

        const storedShopList = await connection
            .createQueryBuilder()
            .select('barbershops')
            .from(Barbershop, 'barbershops')
            .where('barbershops.user_id = :id', { id: savedUser.id })
            .getMany() as Barbershop[];

        expect(storedShopList.length).toBe(1);
        expect(storedShopList[0].name).toBe('Updated shop name');
    });

    it('Should create new row in database with existing user if previous shop is deleted', async () => {
        const savedUser = await userRepository.save(defaultUser);
        await shopRepository.save({
            ...defaultBarbershop,
            status: 'deleted',
            owner: savedUser,
        });

        await shopRepository.save({
            ...defaultBarbershop,
            name: 'New shop name',
            owner: savedUser,
        });

        const storedShopList = await connection
            .createQueryBuilder()
            .select('barbershops')
            .from(Barbershop, 'barbershops')
            .where('barbershops.user_id = :id', { id: savedUser.id })
            .getMany() as Barbershop[];

        expect(storedShopList.length).toBe(2);
        expect(storedShopList).toContainEqual(
            expect.objectContaining({
                name: 'New shop name',
                status: 'enabled',
            }),
        );
        expect(storedShopList).toContainEqual(
            expect.objectContaining({
                name: defaultBarbershop.name,
                status: 'deleted',
            }),
        );
    });

    it('Should disable/enable barbershop in database', async () => {
        // /* disabled barbershop are shops whose services are not open to booking */
        const savedUser = await userRepository.save(defaultUser);
        const savedShop = await shopRepository.save({
            ...defaultBarbershop,
            owner: savedUser,
        });

        await shopRepository.disable(savedShop);

        let storedShopList = await connection
            .createQueryBuilder()
            .select('barbershops')
            .from(Barbershop, 'barbershops')
            .where('barbershops.user_id = :id', { id: savedUser.id })
            .getMany() as Barbershop[];

        expect(storedShopList.length).toBe(1);
        expect(storedShopList[0].name).toBe(defaultBarbershop.name);
        expect(storedShopList[0].status).toBe('disabled');

        await shopRepository.enable(savedShop);

        storedShopList = await connection
            .createQueryBuilder()
            .select('barbershops')
            .from(Barbershop, 'barbershops')
            .where('barbershops.user_id = :id', { id: savedUser.id })
            .getMany() as Barbershop[];

        expect(storedShopList.length).toBe(1);
        expect(storedShopList[0].name).toBe(defaultBarbershop.name);
        expect(storedShopList[0].status).toBe('enabled');
    });

    it('Should not delete barbershop in database, instead set status delete', async () => {
        const savedUser = await userRepository.save(defaultUser);
        const savedShop = await shopRepository.save({
            ...defaultBarbershop,
            owner: savedUser,
        });

        await shopRepository.delete(savedShop);

        const storedShopList = await connection
            .createQueryBuilder()
            .select('barbershops')
            .from(Barbershop, 'barbershops')
            .where('barbershops.user_id = :id', { id: savedUser.id })
            .getMany() as Barbershop[];

        expect(storedShopList.length).toBe(1);
        expect(storedShopList[0].name).toBe(defaultBarbershop.name);
        expect(storedShopList[0].status).toBe('deleted');
    });

    it('Should not return deleted instances through find methods', async () => {
        const savedUser = await userRepository.save(defaultUser);
        const savedShop = await shopRepository.save({
            ...defaultBarbershop,
            owner: savedUser,
        });

        await shopRepository.delete(savedShop);

        await shopRepository.save({
            ...defaultBarbershop,
            name: 'New shop name',
            owner: savedUser,
        });

        const deletedShop = await shopRepository.findOne(
            { owner: { id: savedUser.id } },
            { relations: ['owner'] },
        );
        expect(deletedShop).not.toBe(undefined);
        expect(deletedShop?.owner.id).toBe(savedUser.id);
        expect(deletedShop?.name).toBe('New shop name');

        const deletedShopList = await shopRepository.find({
            owner: { id: savedUser.id },
            relations: ['owner'],
        });
        expect(deletedShopList.length).toBe(1);
        expect(deletedShopList[0].owner.id).toBe(savedUser.id);
        expect(deletedShopList[0].name).toBe('New shop name');
    });
});
