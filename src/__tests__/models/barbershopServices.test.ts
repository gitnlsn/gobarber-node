import { Repository, createConnection, Connection } from 'typeorm';
import User from '../../database/models/User';
import Barbershop from '../../database/models/Barbershop';
import ServiceType from '../../database/models/ServiceType';
import BarbershopService from '../../database/models/BarbershopService';

describe('Barbershop data access', () => {
    let connection: Connection;
    let usersRepository: Repository<User>;
    let shopsRepository: Repository<Barbershop>;
    let serviceTypeRepository: Repository<ServiceType>;
    let barbershopServiceRepository: Repository<BarbershopService>;

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
        usersRepository = connection.getRepository(User);
        shopsRepository = connection.getRepository(Barbershop);
        serviceTypeRepository = connection.getRepository(ServiceType);
        barbershopServiceRepository = connection.getRepository(BarbershopService);
    });

    afterEach(async () => {
        await connection.query('delete from barbershop_services');
        await connection.query('delete from service_types');
        await connection.query('delete from barbershops');
        await connection.query('delete from users');
    });

    afterAll(async () => {
        await connection.close();
    });

    describe('CRUD', () => {
        it('Should create serviceType', async () => {
            const serviceType = serviceTypeRepository.create();
            serviceType.title = 'haircut';
            serviceType.description = 'A cut to your hair';
            serviceType.logoUrl = 'a url to the logo';
            await serviceTypeRepository.save(serviceType);

            expect(serviceType).toHaveProperty('id');
            expect(serviceType).toHaveProperty('title');
            expect(serviceType).toHaveProperty('description');
            expect(serviceType).toHaveProperty('logoUrl');
        });
        it('Should attach a service to a barbershop', async () => {
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

            const serviceType = serviceTypeRepository.create();
            serviceType.title = 'haircut';
            serviceType.description = 'A cut to your hair';
            serviceType.logoUrl = 'a url to the logo';
            await serviceTypeRepository.save(serviceType);

            const service = barbershopServiceRepository.create();
            service.type = serviceType;
            service.provider = barbershop;
            service.description = 'Simple Haircut';
            service.logoUrl = 'custom logo to haircut';
            service.price = 5000; /* R$50,00 */
            service.status = 'enabled';
            await barbershopServiceRepository.save(service);

            expect(service).toHaveProperty('id');
            expect(service).toHaveProperty('price', 5000);
            expect(service).toHaveProperty('status', 'enabled');
            expect(service).toHaveProperty('description');

            expect(service.provider.id).toBe(barbershop.id);
            expect(service.type.id).toBe(serviceType.id);
        });
        it('Should attach several service to a barbershop', async () => {
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

            const serviceType = serviceTypeRepository.create();
            serviceType.title = 'haircut';
            serviceType.description = 'A cut to your hair';
            serviceType.logoUrl = 'a url to the logo';
            await serviceTypeRepository.save(serviceType);

            const firstService = barbershopServiceRepository.create();
            firstService.type = serviceType;
            firstService.provider = barbershop;
            firstService.description = 'Simple Haircut';
            firstService.logoUrl = 'custom logo to haircut';
            firstService.price = 5000; /* R$50,00 */
            firstService.status = 'enabled';
            await barbershopServiceRepository.save(firstService);

            const secondService = barbershopServiceRepository.create();
            secondService.type = serviceType;
            secondService.provider = barbershop;
            secondService.description = 'Stylishing Haircut';
            secondService.logoUrl = 'custom logo to haircut';
            secondService.price = 10000; /* R$100,00 */
            secondService.status = 'enabled';
            await barbershopServiceRepository.save(secondService);

            expect(firstService.type).toEqual(secondService.type);
            expect(secondService.provider.id).toBe(barbershop.id);
            expect(secondService.type.id).toBe(serviceType.id);
        });
    });
});
