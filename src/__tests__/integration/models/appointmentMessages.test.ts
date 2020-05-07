import { Repository, createConnection, Connection } from 'typeorm';
import User from '../../../database/models/User';
import Barbershop from '../../../database/models/Barbershop';
import Appointment from '../../../database/models/Appointment';
import AppointmentMessage from '../../../database/models/AppointmentMessage';

describe('Barbershop data access', () => {
    let connection: Connection;
    let usersRepository: Repository<User>;
    let shopsRepository: Repository<Barbershop>;
    let appointmentsRepository: Repository<Appointment>;
    let messageRepository: Repository<AppointmentMessage>;

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
        usersRepository = connection.getRepository(User);
        shopsRepository = connection.getRepository(Barbershop);
        appointmentsRepository = connection.getRepository(Appointment);
        messageRepository = connection.getRepository(AppointmentMessage);
    });

    afterEach(async () => {
        await connection.query('delete from appointment_messages');
        await connection.query('delete from appointments');
        await connection.query('delete from barbershops');
        await connection.query('delete from users');
    });

    afterAll(async () => {
        await connection.close();
    });

    describe('CRUD', () => {
        it('Should create message to an appointment with client user', async () => {
            /*
                Repository will be capable to register any user as author.
                A proper constraint must be checked at service layer.
            */
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

            const client = usersRepository.create();
            client.name = 'john doe';
            client.email = 'johndoe@mail.com';
            client.password = 'hash of an incredibly strong password';
            await usersRepository.save(client);

            const firstAppointment = appointmentsRepository.create();
            firstAppointment.title = 'First haircut';
            firstAppointment.shop = barbershop;
            firstAppointment.client = client;
            firstAppointment.observations = 'My hair like crazy';
            firstAppointment.startsAt = new Date('2020-05-24 15:00');
            firstAppointment.endsAt = new Date('2020-05-24 16:00');
            await appointmentsRepository.save(firstAppointment);

            const notificationMessage = messageRepository.create();
            notificationMessage.author = client;
            notificationMessage.text = 'I have great expectations for the haircut. I hope the day comes soon.';
            notificationMessage.appointment = firstAppointment;
            await messageRepository.save(notificationMessage);

            expect(notificationMessage).toHaveProperty('id');
            expect(notificationMessage).toHaveProperty('author');
            expect(notificationMessage).toHaveProperty('createdAt');
            expect(notificationMessage).toHaveProperty('updatedAt');
            expect(notificationMessage).toHaveProperty('appointment');
            expect(notificationMessage.appointment.id).toBe(firstAppointment.id);
            expect(notificationMessage.author.id).toBe(client.id);
        });

        it('Should create message to an appointment with client user', async () => {
            /*
                Repository will be capable to register any user as author.
                A proper constraint must be checked at service layer.
            */
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

            const client = usersRepository.create();
            client.name = 'john doe';
            client.email = 'johndoe@mail.com';
            client.password = 'hash of an incredibly strong password';
            await usersRepository.save(client);

            const firstAppointment = appointmentsRepository.create();
            firstAppointment.title = 'First haircut';
            firstAppointment.shop = barbershop;
            firstAppointment.client = client;
            firstAppointment.observations = 'My hair like crazy';
            firstAppointment.startsAt = new Date('2020-05-24 15:00');
            firstAppointment.endsAt = new Date('2020-05-24 16:00');
            await appointmentsRepository.save(firstAppointment);

            const questionMessage = messageRepository.create();
            questionMessage.author = client;
            questionMessage.text = 'I have great expectations for the haircut. I hope the day comes soon.';
            questionMessage.appointment = firstAppointment;
            await messageRepository.save(questionMessage);

            const answerMessage = messageRepository.create();
            answerMessage.author = shopOwner;
            answerMessage.text = 'No worries. I am the expert at haircutting. It will exceed your expectations.';
            answerMessage.appointment = firstAppointment;
            await messageRepository.save(answerMessage);

            expect(answerMessage).toHaveProperty('id');
            expect(answerMessage).toHaveProperty('author');
            expect(answerMessage).toHaveProperty('createdAt');
            expect(answerMessage).toHaveProperty('updatedAt');
            expect(answerMessage).toHaveProperty('appointment');
            expect(answerMessage.appointment.id).toBe(firstAppointment.id);
            expect(answerMessage.author.id).toBe(shopOwner.id);
        });
    });
});
