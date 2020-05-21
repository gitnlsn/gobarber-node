import request from 'supertest';
import express from 'express';
import { Connection, createConnection } from 'typeorm';

import { createHash } from 'crypto';
import { GoBarberServer } from '../../../app';
import User from '../../../database/models/User';
import Barbershop from '../../../database/models/Barbershop';
import ServiceType from '../../../database/models/ServiceType';
import BarbershopService from '../../../database/models/BarbershopService';

describe('Appointments Router', () => {
    let expressApp: express.Express;
    let connection: Connection;

    let clientToken: string;
    let registeredClient: User;

    let anotherClientToken: string;
    let anotherRegisteredclient: User;

    let barbershopToken: string;
    let registeredBarbershop: Barbershop;

    let anotherBarbershopToken: string;
    let anotherRegisteredBarbershop: Barbershop;

    let availableServiceType: ServiceType;
    let anotherAvailableServiceType: ServiceType;

    let registeredService: BarbershopService;

    beforeAll(async () => {
        connection = await createConnection();

        /* Inserting serviceTypes manually since there is no designed route to create it */
        const serviceTypeRepository = connection.getRepository(ServiceType);
        availableServiceType = await serviceTypeRepository.save({
            title: 'Haircut - male',
            description: 'haircut for men',
            logoUrl: 'some logo url',
        });

        anotherAvailableServiceType = await serviceTypeRepository.save({
            title: 'Haircut - female',
            description: 'haircut for women',
            logoUrl: 'some female logo url',
        });

        expressApp = await GoBarberServer({
            typeormConnection: connection,
        });

        const { body: { token: firstToken, user: firstUser } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'johnclient@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        clientToken = firstToken;
        registeredClient = firstUser;

        const { body: { token: secondToken, user: secondUser } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'johnclientSecond@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        anotherClientToken = secondToken;
        anotherRegisteredclient = secondUser;

        const { body: { token: thirdToken } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'johhnshopfirst@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });


        const { body: { barbershop: firstBarbershop } } = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${thirdToken}`)
            .send({
                barbershop: {
                    name: 'johndoes shop',
                    address: 'Scissors Avenue, 3434',
                },
            });

        barbershopToken = thirdToken;
        registeredBarbershop = firstBarbershop;

        const { body: { token: forthToken } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'johnshopsecond@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });


        const { body: { barbershop: secondBarbershop } } = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${forthToken}`)
            .send({
                barbershop: {
                    name: 'johndoes second shop',
                    address: 'Scissors Avenue, 3434',
                },
            });

        anotherBarbershopToken = forthToken;
        anotherRegisteredBarbershop = secondBarbershop;

        const { body: { service } } = await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${barbershopToken}`)
            .send({
                service: {
                    provider: registeredBarbershop,
                    type: availableServiceType,
                    price: 5000,
                },
            });

        registeredService = service;
    });

    afterEach(async () => {
        await connection.query('delete from appointments');
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await connection.query('delete from barbershop_services');
        await connection.query('delete from service_types');
        await connection.query('delete from barbershops');
        await connection.query('delete from users');
        await connection.close();
    });

    describe('Default behaviour', () => {
        describe('Barbershop tasks', () => {
            test('POST /barbershop/appointment creates new available appointment', async () => {
                const response = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                expect(response.status).toBe(200);

                const { appointment: createdAppointment } = response.body;
                expect(createdAppointment).toHaveProperty('id');
                expect(createdAppointment).toHaveProperty('title', 'Haircut');
                expect(createdAppointment).toHaveProperty('startsAt', '2020-05-20T16:00:00.000Z');
                expect(createdAppointment).toHaveProperty('endsAt', '2020-05-20T17:00:00.000Z');
                expect(createdAppointment).toHaveProperty('service');
                expect(createdAppointment.service.id).toBe(registeredService.id);
            });
            test('PUT /barbershop/appointment/:id updates available appointment', async () => {
                const { body: { appointment: createdAppointment } } = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                const response = await request(expressApp)
                    .put(`/barbershop/appointment/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut with new time',
                            startsAt: new Date('2020-05-20T17:00:00.000Z'),
                            endsAt: new Date('2020-05-20T18:00:00.000Z'),
                            observations: 'some observation',
                        },
                    });

                expect(response.status).toBe(200);

                const { appointment: updatedAppointment } = response.body;
                expect(updatedAppointment).toHaveProperty('id', createdAppointment.id);
                expect(updatedAppointment).toHaveProperty('title', 'Haircut with new time');
                expect(updatedAppointment).toHaveProperty('startsAt', '2020-05-20T17:00:00.000Z');
                expect(updatedAppointment).toHaveProperty('endsAt', '2020-05-20T18:00:00.000Z');
                expect(updatedAppointment).toHaveProperty('observations', 'some observation');
            });
            test('GET /barbershop/appointment/:id retrieved specific appointment', async () => {
                const { body: { appointment: createdAppointment } } = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                const response = await request(expressApp)
                    .get(`/barbershop/appointment/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${barbershopToken}`);

                expect(response.status).toBe(200);

                const { appointment: retrievedAppointment } = response.body;
                expect(retrievedAppointment).toHaveProperty('id', createdAppointment.id);
                expect(retrievedAppointment).toHaveProperty('title', 'Haircut');
                expect(retrievedAppointment).toHaveProperty('startsAt', '2020-05-20T16:00:00.000Z');
                expect(retrievedAppointment).toHaveProperty('endsAt', '2020-05-20T17:00:00.000Z');
                expect(retrievedAppointment).toHaveProperty('client');
                expect(retrievedAppointment).toHaveProperty('service');
                expect(retrievedAppointment.service).toHaveProperty('provider');
                expect(retrievedAppointment.service).toHaveProperty('type');
            });
            test('DELETE /barbershop/appointment/:id deletes available appointment', async () => {
                const { body: { appointment: createdAppointment } } = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                const response = await request(expressApp)
                    .delete(`/barbershop/appointment/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${barbershopToken}`);

                expect(response.status).toBe(200);

                const { appointment: deletedAppointment } = response.body;
                expect(deletedAppointment).toHaveProperty('id', createdAppointment.id);
            });
        });

        describe('Client tasks', () => {
            test('PUT /client/appointment/accept/:id accepts available appointment', async () => {
                const { body: { appointment: createdAppointment } } = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                const response = await request(expressApp)
                    .put(`/client/appointment/accept/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${clientToken}`);

                expect(response.status).toBe(200);

                const { appointment: acceptedAppointment } = response.body;
                expect(acceptedAppointment).toHaveProperty('id', createdAppointment.id);
                expect(acceptedAppointment).toHaveProperty('client');
                expect(acceptedAppointment.client).toHaveProperty('id', registeredClient.id);
            });
            test('PUT /client/appointment/cancel/:id cancels accepted appointment', async () => {
                const { body: { appointment: createdAppointment } } = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                await request(expressApp)
                    .put(`/client/appointment/accept/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${clientToken}`);

                const response = await request(expressApp)
                    .put(`/client/appointment/cancel/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${clientToken}`);

                expect(response.status).toBe(200);

                const { appointment: acceptedAppointment } = response.body;
                expect(acceptedAppointment).toHaveProperty('id', createdAppointment.id);
                expect(acceptedAppointment).toHaveProperty('client', undefined);
            });
        });

        describe('Appointment Constraints', () => {
            test('PUT /client/appointment/accept/:id appointment cannot be accept more than once', async () => {
                const { body: { appointment: createdAppointment } } = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                await request(expressApp)
                    .put(`/client/appointment/accept/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${clientToken}`);

                const response = await request(expressApp)
                    .put(`/client/appointment/accept/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${anotherClientToken}`);

                expect(response.status).toBe(400);
                expect(response.body.status).toBe('error');
            });
        });
    });

    describe('Unauthorized access', () => {
        describe('Client tries to modify barbershop appointments', () => {
            test('POST /barbershop/appointment barberClient cannot create appointment', async () => {
                const response = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${clientToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
            test('PUT /barbershop/appointment barberClient cannot update appointment', async () => {
                const { body: { appointment: createdAppointment } } = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                const response = await request(expressApp)
                    .put(`/barbershop/appointment/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${clientToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
            test('DELETE /barbershop/appointment barberClient cannot delete appointment', async () => {
                const { body: { appointment: createdAppointment } } = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                const response = await request(expressApp)
                    .delete(`/barbershop/appointment/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${clientToken}`);

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
        });
        describe('Barbershop tries to modify another barbershop appointments', () => {
            test('POST /barbershop/appointment barbershop cannot create appointment not of its own shop', async () => {
                const response = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${anotherBarbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
            test('PUT /barbershop/appointment barbershop cannot update appointment not of its own', async () => {
                const { body: { appointment: createdAppointment } } = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                const response = await request(expressApp)
                    .put(`/barbershop/appointment/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${anotherBarbershopToken}`)
                    .send({
                        appointment: {
                            title: 'bla',
                            startsAt: new Date('2021-05-20T16:00:00.000Z'),
                            endsAt: new Date('2021-05-20T17:00:00.000Z'),
                            observations: 'uow',
                        },
                    });

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
            test('DELETE /barbershop/appointment barbershop cannot delete appointment not of its own', async () => {
                const { body: { appointment: createdAppointment } } = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                const response = await request(expressApp)
                    .delete(`/barbershop/appointment/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${anotherBarbershopToken}`);

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
        });
        describe('User tries to cancel someone elses appointment', () => {
            test('PUT /client/appointment/cancel/:id client cannot cancel someone else appointment', async () => {
                const { body: { appointment: createdAppointment } } = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                await request(expressApp)
                    .put(`/client/appointment/accept/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${clientToken}`);

                const response = await request(expressApp)
                    .put(`/client/appointment/cancel/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${anotherClientToken}`);

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
            test('PUT /client/appointment/cancel/:id service owner cannot cancel someone else appointment', async () => {
                const { body: { appointment: createdAppointment } } = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                await request(expressApp)
                    .put(`/client/appointment/accept/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${clientToken}`);

                const response = await request(expressApp)
                    .put(`/client/appointment/cancel/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${barbershopToken}`);

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
            test('PUT /client/appointment/cancel/:id 3rd barbershop cannot cancel someone else appointment', async () => {
                const { body: { appointment: createdAppointment } } = await request(expressApp)
                    .post('/barbershop/appointment')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        appointment: {
                            title: 'Haircut',
                            startsAt: new Date('2020-05-20T16:00:00.000Z'),
                            endsAt: new Date('2020-05-20T17:00:00.000Z'),
                            service: registeredService,
                        },
                    });

                await request(expressApp)
                    .put(`/client/appointment/accept/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${clientToken}`);

                const response = await request(expressApp)
                    .put(`/client/appointment/cancel/${createdAppointment.id}`)
                    .set('Authorization', `Bearer ${anotherBarbershopToken}`);

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
        });
    });
});
