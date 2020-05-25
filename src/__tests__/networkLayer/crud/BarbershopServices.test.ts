import request from 'supertest';
import express from 'express';
import { Connection, createConnection } from 'typeorm';

import { createHash } from 'crypto';
import registerRepositories from '../../../database/container';
import { GoBarberServer } from '../../../app';
import registerServices from '../../../services/container';
import Barbershop from '../../../database/models/Barbershop';
import ServiceType from '../../../database/models/ServiceType';

describe('Sessions Router', () => {
    let expressApp: express.Express;
    let connection: Connection;

    let barbershopToken: string;
    let registeredBarbershop: Barbershop;

    let anotherBarbershopToken: string;

    let clientToken: string;

    let availableServiceType: ServiceType;
    let anotherAvailableServiceType: ServiceType;

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();

        registerRepositories({ typeormConnection: connection });
        registerServices();

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

        const { body: { token: firstToken } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'john@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        barbershopToken = firstToken;

        const { body: { barbershop: firstBarbershop } } = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${barbershopToken}`)
            .send({
                barbershop: {
                    name: 'johndoes shop',
                    address: 'Scissors Avenue, 3434',
                },
            });

        registeredBarbershop = firstBarbershop;

        const { body: { token: secondToken } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'john2@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        anotherBarbershopToken = secondToken;

        await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${anotherBarbershopToken}`)
            .send({
                barbershop: {
                    name: 'johndoes shop',
                    address: 'Scissors Avenue, 3434',
                },
            });


        const { body: { token: thirdToken } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'john3@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        clientToken = thirdToken;
    });

    afterEach(async () => {
        await connection.query('delete from barbershop_services');
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await connection.query('delete from service_types');
        await connection.query('delete from barbershops');
        await connection.query('delete from users');
        await connection.close();
    });

    describe('Default Behaviour', () => {
        describe('Barbershop manages its services', () => {
            test('POST "/barbershop/service" - Registers new service', async () => {
                const response = await request(expressApp)
                    .post('/barbershop/service')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: availableServiceType,
                            price: 5000,
                            title: 'Haircut 1',
                            description: 'johns amazing haircut',
                            logoUrl: 'custom logo',
                        },
                    });

                expect(response.status).toBe(200);

                const { body: { service: createdService } } = response;

                expect(createdService).toHaveProperty('id');
                expect(createdService).toHaveProperty('provider');
                expect(createdService).toHaveProperty('type');
                expect(createdService).toHaveProperty('price', 5000);
                expect(createdService).toHaveProperty('title', 'Haircut 1');
                expect(createdService).toHaveProperty('description', 'johns amazing haircut');
                expect(createdService).toHaveProperty('logoUrl', 'custom logo');

                expect(createdService.provider).toHaveProperty('id', registeredBarbershop.id);
                expect(createdService.type).toHaveProperty('id', availableServiceType.id);
            });
            test('PUT "/barbershop/service/:id" - Updates service', async () => {
                const { body: { service: createdService } } = await request(expressApp)
                    .post('/barbershop/service')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: availableServiceType,
                            price: 5000,
                            description: 'johns amazing haricut',
                            logoUrl: 'custom logo',
                        },
                    });

                /* changing male haircut to female */
                const response = await request(expressApp)
                    .put(`/barbershop/service/${createdService.id}`)
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            title: 'Haircut 1',
                            type: anotherAvailableServiceType,
                            price: 6000,
                        },
                    });


                expect(response.status).toBe(200);

                const { body: { service: updatedService } } = response;

                expect(updatedService).toHaveProperty('id');
                expect(updatedService).toHaveProperty('title', 'Haircut 1');
                expect(updatedService).toHaveProperty('type');
                expect(updatedService.type).toHaveProperty('id', anotherAvailableServiceType.id);
            });
            test('DELETE "/barbershop/service/:id" - Deletes service', async () => {
                const { body: { service: createdService } } = await request(expressApp)
                    .post('/barbershop/service')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: availableServiceType,
                            price: 5000,
                            description: 'johns amazing haricut',
                            logoUrl: 'custom logo',
                        },
                    });

                /* changing male haircut to female */
                const response = await request(expressApp)
                    .delete(`/barbershop/service/${createdService.id}`)
                    .set('Authorization', `Bearer ${barbershopToken}`);

                expect(response.status).toBe(200);

                const { body: { service: deletedService } } = response;
                expect(deletedService).toHaveProperty('id', createdService.id);
            });
            test('GET "/barbershop/service/:id" - Filters service by barbershop', async () => {
                await request(expressApp)
                    .post('/barbershop/service')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: availableServiceType,
                            price: 3000,
                            description: 'short haircut',
                            logoUrl: 'short hair logo',
                        },
                    });

                const choosenResponse = await request(expressApp)
                    .post('/barbershop/service')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: anotherAvailableServiceType,
                            price: 5000,
                            description: 'long haircut',
                            logoUrl: 'long hair logo',
                        },
                    });

                const { service: createdService } = choosenResponse.body;

                /* changing male haircut to female */
                const response = await request(expressApp)
                    .get(`/barbershop/service/${createdService.id}`)
                    .set('Authorization', `Bearer ${barbershopToken}`);


                expect(response.status).toBe(200);
                const { body: { service: existingService } } = response;

                expect(existingService).toHaveProperty('id');
                expect(existingService).toHaveProperty('provider');
                expect(existingService).toHaveProperty('type');
                expect(existingService).toHaveProperty('price', 5000);
                expect(existingService).toHaveProperty('description', 'long haircut');
                expect(existingService).toHaveProperty('logoUrl', 'long hair logo');

                expect(existingService.provider).toHaveProperty('id', registeredBarbershop.id);
                expect(existingService.type).toHaveProperty('id', anotherAvailableServiceType.id);
            });
        });

        describe('Constraints', () => {
            test('Barbershop has no constraints in number of services', async () => {
                const firstResponse = await request(expressApp)
                    .post('/barbershop/service')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: availableServiceType,
                            price: 6000,
                            description: 'long haircut',
                            logoUrl: 'custom logo',
                        },
                    });

                const secondResponse = await request(expressApp)
                    .post('/barbershop/service')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: availableServiceType,
                            price: 4000,
                            description: 'short hair cut',
                            logoUrl: 'custom logo',
                        },
                    });

                expect(firstResponse.status).toBe(200);
                expect(secondResponse.status).toBe(200);

                const { service: firstService } = firstResponse.body;
                const { service: secondService } = secondResponse.body;

                const serviceList = await connection.query(`
                    select *
                    from barbershop_services
                    where shop_id = '${registeredBarbershop.id}'
                `);

                expect(serviceList.length).toBe(2);
                expect(serviceList).toContainEqual(
                    expect.objectContaining({ id: firstService.id }),
                );
                expect(serviceList).toContainEqual(
                    expect.objectContaining({ id: secondService.id }),
                );
            });
        });
    });

    describe('Unauthorized access', () => {
        describe('Client cannot manage barbershop services', () => {
            test('POST "/barbershop/service"', async () => {
                const response = await request(expressApp)
                    .post('/barbershop/service')
                    .set('Authorization', `Bearer ${clientToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: availableServiceType,
                            price: 6000,
                            description: 'long haircut',
                            logoUrl: 'custom logo',
                        },
                    });

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
            test('PUT "/barbershop/service/:id"', async () => {
                const { body: { service: createdService } } = await request(expressApp)
                    .post('/barbershop/service')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: availableServiceType,
                            price: 5000,
                            description: 'johns amazing haricut',
                            logoUrl: 'custom logo',
                        },
                    });

                /* changing male haircut to female */
                const response = await request(expressApp)
                    .put(`/barbershop/service/${createdService.id}`)
                    .set('Authorization', `Bearer ${clientToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: anotherAvailableServiceType,
                            price: 6000,
                        },
                    });


                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
            test('DELETE "/barbershop/service/:id"', async () => {
                const { body: { service: createdService } } = await request(expressApp)
                    .post('/barbershop/service')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: availableServiceType,
                            price: 5000,
                            description: 'johns amazing haricut',
                            logoUrl: 'custom logo',
                        },
                    });

                /* changing male haircut to female */
                const response = await request(expressApp)
                    .delete(`/barbershop/service/${createdService.id}`)
                    .set('Authorization', `Bearer ${clientToken}`);

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
        });
        describe('Barbershop cannot manage another barbershop services', () => {
            test('POST "/barbershop/service"', async () => {
                const response = await request(expressApp)
                    .post('/barbershop/service')
                    .set('Authorization', `Bearer ${anotherBarbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: availableServiceType,
                            price: 6000,
                            description: 'long haircut',
                            logoUrl: 'custom logo',
                        },
                    });

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
            test('PUT "/barbershop/service/:id"', async () => {
                const { body: { service: createdService } } = await request(expressApp)
                    .post('/barbershop/service')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: availableServiceType,
                            price: 5000,
                            description: 'johns amazing haricut',
                            logoUrl: 'custom logo',
                        },
                    });

                /* changing male haircut to female */
                const response = await request(expressApp)
                    .put(`/barbershop/service/${createdService.id}`)
                    .set('Authorization', `Bearer ${anotherBarbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: anotherAvailableServiceType,
                            price: 6000,
                        },
                    });


                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
            test('DELETE "/barbershop/service/:id"', async () => {
                const { body: { service: createdService } } = await request(expressApp)
                    .post('/barbershop/service')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        service: {
                            provider: registeredBarbershop,
                            type: availableServiceType,
                            price: 5000,
                            description: 'johns amazing haricut',
                            logoUrl: 'custom logo',
                        },
                    });

                /* changing male haircut to female */
                const response = await request(expressApp)
                    .delete(`/barbershop/service/${createdService.id}`)
                    .set('Authorization', `Bearer ${anotherBarbershopToken}`);

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
        });
    });
});
