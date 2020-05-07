import { Repository, createConnection, Connection } from 'typeorm';
import User from '../../../database/models/User';
import Barbershop from '../../../database/models/Barbershop';
import Appointment from '../../../database/models/Appointment';
import BarbershopService from '../../../database/models/BarbershopService';
import ServiceType from '../../../database/models/ServiceType';

describe('Barbershop data access', () => {
    let connection: Connection;
    let usersRepository: Repository<User>;
    let shopsRepository: Repository<Barbershop>;
    let serviceTypeRepository: Repository<ServiceType>;
    let barbershopServiceRepository: Repository<BarbershopService>;
    let appointmentsRepository: Repository<Appointment>;

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
        usersRepository = connection.getRepository(User);
        shopsRepository = connection.getRepository(Barbershop);
        serviceTypeRepository = connection.getRepository(ServiceType);
        barbershopServiceRepository = connection.getRepository(BarbershopService);
        appointmentsRepository = connection.getRepository(Appointment);
    });

    afterEach(async () => {
        await connection.query('delete from appointments');
        await connection.query('delete from barbershop_services');
        await connection.query('delete from service_types');
        await connection.query('delete from barbershops');
        await connection.query('delete from users');
    });

    afterAll(async () => {
        await connection.close();
    });

    describe('CRUD', () => {
        it('Should create appointment with no client', async () => {
            const shopOwner = usersRepository.create();
            shopOwner.name = 'john barber';
            shopOwner.email = 'johnbarber@mail.com';
            shopOwner.password = 'hash of an incredibly strong password';
            await usersRepository.save(shopOwner);

            const barbershop = shopsRepository.create();
            barbershop.name = 'Awesome barbershop';
            barbershop.owner = shopOwner;
            barbershop.slogan = 'Your hair like crazy';
            barbershop.description = 'A nice place to have a new stylishing haircut. Every day we design something new to everyday customers. You will never have the same hair twice in your life.';
            barbershop.address = 'John doe street, 432. New Yooor';
            await shopsRepository.save(barbershop);

            const serviceType = serviceTypeRepository.create();
            serviceType.title = 'Haircut';
            serviceType.description = 'Simple Haircut';
            serviceType.logoUrl = 'standard logo';
            await serviceTypeRepository.save(serviceType);

            const service = barbershopServiceRepository.create();
            service.type = serviceType;
            service.provider = barbershop;
            service.description = 'Simple Haircut';
            service.logoUrl = 'custom logo to haircut';
            service.price = 5000; /* R$50,00 */
            service.status = 'enabled';
            await barbershopServiceRepository.save(service);

            const firstAppointment = appointmentsRepository.create();
            firstAppointment.title = 'First haircut';
            firstAppointment.service = service;
            firstAppointment.observations = 'None';
            firstAppointment.startsAt = new Date('2020-05-24 15:00');
            firstAppointment.endsAt = new Date('2020-05-24 16:00');
            await appointmentsRepository.save(firstAppointment);

            expect(firstAppointment).toHaveProperty('id');
            expect(firstAppointment).toHaveProperty('title');
            expect(firstAppointment).toHaveProperty('observations');
            expect(firstAppointment).toHaveProperty('startsAt', new Date('2020-05-24 15:00'));
            expect(firstAppointment).toHaveProperty('endsAt', new Date('2020-05-24 16:00'));
            expect(firstAppointment).toHaveProperty('service');

            expect(firstAppointment.service.id).toBe(service.id);
        });
        it('Should assign client to an existing appointment', async () => {
            const shopOwner = usersRepository.create();
            shopOwner.name = 'john doe 2';
            shopOwner.email = 'johndoe2@mail.com';
            shopOwner.password = 'hash of an incredibly strong password';
            await usersRepository.save(shopOwner);

            const barbershop = shopsRepository.create();
            barbershop.name = 'Awesome barbershop';
            barbershop.owner = shopOwner;
            barbershop.slogan = 'Your hair like crazy';
            barbershop.description = 'A nice place to have a new stylishing haircut. Every day we design something new to everyday customers. You will never have the same hair twice in your life.';
            barbershop.address = 'John doe street, 432. New Yooork';
            await shopsRepository.save(barbershop);

            const serviceType = serviceTypeRepository.create();
            serviceType.title = 'Haircut';
            serviceType.description = 'Simple Haircut';
            serviceType.logoUrl = 'standard logo';
            await serviceTypeRepository.save(serviceType);

            const service = barbershopServiceRepository.create();
            service.type = serviceType;
            service.provider = barbershop;
            service.description = 'Simple Haircut';
            service.logoUrl = 'custom logo to haircut';
            service.price = 5000; /* R$50,00 */
            service.status = 'enabled';
            await barbershopServiceRepository.save(service);

            const firstAppointment = appointmentsRepository.create();
            firstAppointment.title = 'First haircut';
            firstAppointment.service = service;
            firstAppointment.observations = 'None';
            firstAppointment.startsAt = new Date('2020-05-24 15:00');
            firstAppointment.endsAt = new Date('2020-05-24 16:00');
            await appointmentsRepository.save(firstAppointment);

            const client = usersRepository.create();
            client.name = 'john doe';
            client.email = 'johndoe@mail.com';
            client.password = 'hash of an incredibly strong password';
            await usersRepository.save(client);

            firstAppointment.client = client;
            firstAppointment.observations = 'My hair like crazy';
            await appointmentsRepository.save(firstAppointment);

            expect(firstAppointment).toHaveProperty('client');
            expect(firstAppointment).toHaveProperty('observations', 'My hair like crazy');
            expect(firstAppointment.client.id).toBe(client.id);
        });
    });
});
