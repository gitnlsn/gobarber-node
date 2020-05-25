import {
    Connection,
    createConnection,
    Repository,
    getRepository,
} from 'typeorm';
import { createHash } from 'crypto';
import { container } from 'tsyringe';

import registerRepositories from '../../database/container';
import registerServices from '../../services/container';
import RegisterUserService from '../../services/user/implementations/RegisterUserService';
import CrudBarbershopService from '../../services/babershop/implementations/CrudBarbershopService';
import CrudBarberServiceService from '../../services/baberservice/implementations/CrudBarberServiceService';
import ServiceType from '../../database/models/ServiceType';
import CrudAppointmentService from '../../services/appointments/implementations/CrudAppointmentService';

describe('Managing a Barbershop', () => {
    let connection: Connection;

    const userName = 'john doe';
    const userEmail = 'test@mail.com';
    const userPassword = createHash('sha256').update('password').digest('hex');

    const shopName = 'Very creative name';
    const shopAddress = 'shop address';

    let serviceTypeRepository: Repository<ServiceType>;
    let serviceTypeList: ServiceType[];

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
        registerRepositories({ typeormConnection: connection });
        registerServices();
        serviceTypeRepository = getRepository(ServiceType);
    });

    beforeEach(async () => {
        serviceTypeList = [];
        serviceTypeList.push(
            await serviceTypeRepository.save({
                title: 'Custom Haircut',
                description: 'client chooses the cutting style',
                logoUrl: 'scissors',
            }),
            await serviceTypeRepository.save({
                title: 'Simple Haircut',
                description: 'barber chooses client\'s haircut',
                logoUrl: 'scissors',
            }),
        );
    });

    afterEach(async () => {
        await connection.query('DELETE FROM barbershops;');
        await connection.query('DELETE FROM users;');
    });

    afterAll(async () => {
        await connection.close();
    });

    test('Register barbershop account', async () => {
        /*
            Server receives a post request to register a barbershop with:
                - shop name
                - shop address
                - email
                - password

            Server must do the following:
                - insert a user
                - insert a barbershop
                - insert a default service
        */

        const registerUserService = container.resolve(RegisterUserService);
        const crudBarbershopService = container.resolve(CrudBarbershopService);
        const crudBarberServiceService = container.resolve(CrudBarberServiceService);

        const { user } = await registerUserService.execute({
            name: userName,
            email: userEmail,
            password: userPassword,
        });

        const { barbershop } = await crudBarbershopService.create({
            owner: user,
            address: shopAddress,
            name: shopName,
        });

        const { service } = await crudBarberServiceService.create({
            provider: barbershop,
            price: 5000,
            type: serviceTypeList[0],
        });

        const [storedBarbershop] = await connection.query(`
            select *
            from barbershops
            where user_id = '${user.id}';
        `);

        expect(storedBarbershop).toHaveProperty('name', barbershop.name);
        expect(storedBarbershop).toHaveProperty('description', null);
        expect(storedBarbershop).toHaveProperty('address', barbershop.address);
        expect(storedBarbershop).toHaveProperty('status', 'enabled');
        expect(storedBarbershop).toHaveProperty('slogan', null);
        expect(storedBarbershop).toHaveProperty('created_at');
        expect(storedBarbershop).toHaveProperty('updated_at');

        const [storedService] = await connection.query(`
            select *
            from barbershop_services
            where shop_id = '${barbershop.id}';
        `);

        expect(storedService).toHaveProperty('price', service.price);
        expect(storedService).toHaveProperty('service_id', service.type.id);
        expect(storedService).toHaveProperty('shop_id', service.provider.id);
    });

    test('Registered barbershop may create available appointments', async () => {
        const registerUserService = container.resolve(RegisterUserService);
        const crudBarbershopService = container.resolve(CrudBarbershopService);
        const crudBarberServiceService = container.resolve(CrudBarberServiceService);
        const crudAppointmentService = container.resolve(CrudAppointmentService);

        const { user } = await registerUserService.execute({
            name: userName,
            email: userEmail,
            password: userPassword,
        });

        const { barbershop } = await crudBarbershopService.create({
            owner: user,
            address: shopAddress,
            name: shopName,
        });

        const { service } = await crudBarberServiceService.create({
            provider: barbershop,
            price: 5000,
            type: serviceTypeList[0],
        });

        const { appointment } = await crudAppointmentService.create({
            service,
            startsAt: new Date(2020, 6, 10, 15),
            endsAt: new Date(2020, 6, 10, 16),
        });

        const [storedAppointment] = await connection.query(`
            select *
            from appointments
            where service_id = '${service.id}';
        `);

        expect(storedAppointment).toHaveProperty('starts_at', appointment.startsAt);
        expect(storedAppointment).toHaveProperty('ends_at', appointment.endsAt);
        expect(storedAppointment).toHaveProperty('user_id', null);
        expect(storedAppointment).toHaveProperty('service_id', appointment.service.id);
    });

    test('Registered appointment may be accepted by user', async () => {
        const registerUserService = container.resolve(RegisterUserService);
        const crudBarbershopService = container.resolve(CrudBarbershopService);
        const crudBarberServiceService = container.resolve(CrudBarberServiceService);
        const crudAppointmentService = container.resolve(CrudAppointmentService);

        const { user } = await registerUserService.execute({
            name: userName,
            email: userEmail,
            password: userPassword,
        });

        const { barbershop } = await crudBarbershopService.create({
            owner: user,
            address: shopAddress,
            name: shopName,
        });

        const { service } = await crudBarberServiceService.create({
            provider: barbershop,
            price: 5000,
            type: serviceTypeList[0],
        });

        const { appointment } = await crudAppointmentService.create({
            service,
            startsAt: new Date(2020, 6, 10, 15),
            endsAt: new Date(2020, 6, 10, 16),
        });

        const { user: client } = await registerUserService.execute({
            name: 'john doe',
            email: 'johndoe@mail.com',
            password: userPassword,
        });

        await crudAppointmentService.update({
            id: appointment.id,
            client,
        });

        const [updatedAppointment] = await connection.query(`
            select *
            from appointments
            where service_id = '${service.id}';
        `);

        expect(updatedAppointment).toHaveProperty('starts_at', appointment.startsAt);
        expect(updatedAppointment).toHaveProperty('ends_at', appointment.endsAt);
        expect(updatedAppointment).toHaveProperty('user_id', client.id);
        expect(updatedAppointment).toHaveProperty('service_id', appointment.service.id);
    });
});
