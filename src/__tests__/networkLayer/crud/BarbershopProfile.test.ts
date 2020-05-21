import request from 'supertest';
import express from 'express';
import { Connection, createConnection } from 'typeorm';

import { createHash } from 'crypto';
import registerRepositories from '../../../database/container';
import { GoBarberServer } from '../../../app';
import registerServices from '../../../services/container';
import Barbershop from '../../../database/models/Barbershop';

describe('Sessions Router', () => {
    let expressApp: express.Express;
    let connection: Connection;

    let barbershopToken: string;
    let clientToken: string;
    let anotherBarbershopToken: string;

    beforeAll(async () => {
        connection = await createConnection();
        connection.runMigrations();

        registerRepositories({ typeormConnection: connection });
        registerServices();

        expressApp = await GoBarberServer({
            typeormConnection: connection,
        });

        const { body: { token: firstBarbershopToken } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'johnshop1@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        barbershopToken = firstBarbershopToken;

        const { body: { token: secondBarbershopToken } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'johnshop2@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        anotherBarbershopToken = secondBarbershopToken;

        const { body: { token: firstClientToken } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'johnclient@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        clientToken = firstClientToken;
    });

    beforeEach(async () => {
        await request(expressApp)
            .post('/barbershop')
            .set('Authorization', `Bearer ${anotherBarbershopToken}`)
            .send({
                barbershop: {
                    name: 'johndoes 2 barbershop',
                    address: 'Scissors Avenue, 3434',
                },
            });
    });

    afterEach(async () => {
        await connection.query('delete from barbershops');
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await connection.query('delete from users');
        await connection.close();
    });

    describe('Default Behaviour', () => {
        describe('Barbershop manages its profile', () => {
            test('POST "/barbershop" - Registers a barbershop', async () => {
                const response = await request(expressApp)
                    .post('/barbershop')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                        },
                    });

                expect(response.status).toBe(200);

                const { barbershop: createdBarbershop } = response.body;
                expect(createdBarbershop).toHaveProperty('id');
                expect(createdBarbershop).toHaveProperty('name', 'johndoes barbershop');
                expect(createdBarbershop).toHaveProperty('address', 'Scissors Avenue, 3434');

                const [storedBarbershop] = await connection.query(`
                    select *
                    from barbershops
                    where id = '${createdBarbershop.id}'
                `);

                expect(storedBarbershop).toHaveProperty('id');
                expect(storedBarbershop).toHaveProperty('name');
                expect(storedBarbershop).toHaveProperty('address', 'Scissors Avenue, 3434');
                expect(storedBarbershop).toHaveProperty('status', 'enabled');
                expect(storedBarbershop).toHaveProperty('created_at');
                expect(storedBarbershop).toHaveProperty('updated_at');
            });
            test('PUT "/barbershop" - Updates a barbershop', async () => {
                const { body } = await request(expressApp)
                    .post('/barbershop')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                        },
                    });

                const storedBarbershop = body.barbershop;

                const response = await request(expressApp)
                    .put(`/barbershop/${storedBarbershop.id}`)
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                            slogan: 'Your hair like crazy',
                            description: 'Have a nice haircut at johns',
                        },
                    });

                expect(response.status).toBe(200);

                const [updatedBarbershop] = await connection.query(`
                    select *
                    from barbershops
                    where id = '${storedBarbershop.id}'
                `);

                expect(updatedBarbershop).toHaveProperty('slogan', 'Your hair like crazy');
                expect(updatedBarbershop).toHaveProperty('description', 'Have a nice haircut at johns');
            });
            test.skip('PUT "/barbershop/enable/:id" "/disable/:id" - Disables and Enables barbershop', async () => {
                /* Unimplemented */
                const { body } = await request(expressApp)
                    .post('/barbershop')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                        },
                    });

                const storedBarbershop = body.barbershop;

                /* Disables */
                const disableResponse = await request(expressApp)
                    .put(`/barbershop/disable/${storedBarbershop.id}`)
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                            slogan: 'Your hair like crazy',
                            description: 'Have a nice haircut at johns',
                        },
                    });

                expect(disableResponse.status).toBe(200);

                const disabledBarbershop = disableResponse.body.barbershop;
                expect(disabledBarbershop).toHaveProperty('status', 'disabled');

                /* Enables */
                const enableResponse = await request(expressApp)
                    .put(`/barbershop/enable/${storedBarbershop.id}`)
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                            slogan: 'Your hair like crazy',
                            description: 'Have a nice haircut at johns',
                        },
                    });

                expect(enableResponse.status).toBe(200);

                const enabledBarbershop = enableResponse.body.barbershop;
                expect(enabledBarbershop).toHaveProperty('status', 'enabled');
            });
            test('DELETE "/barbershop" - Deletes a barbershop', async () => {
                const { body } = await request(expressApp)
                    .post('/barbershop')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                        },
                    });

                const storedBarbershop = body.barbershop;

                /* Deletes */
                const deleteResponse = await request(expressApp)
                    .delete(`/barbershop/${storedBarbershop.id}`)
                    .set('Authorization', `Bearer ${barbershopToken}`);

                expect(deleteResponse.status).toBe(200);

                const [deletedBarbershop] = await connection.query(`
                    select *
                    from barbershops
                    where name = '${'johndoes barbershop'}'
                `);
                expect(deletedBarbershop).toHaveProperty('status', 'deleted');
            });
            test('GET "/barbershop/:id" - Retrieve a barbershop by id', async () => {
                const { body } = await request(expressApp)
                    .post('/barbershop')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                        },
                    });

                const storedBarbershop = body.barbershop;

                /* Deletes */
                const getResponse = await request(expressApp)
                    .get(`/barbershop/${storedBarbershop.id}`)
                    .set('Authorization', `Bearer ${barbershopToken}`);

                expect(getResponse.status).toBe(200);

                const retrievedBarbershop = getResponse.body.barbershop;
                expect(retrievedBarbershop).toHaveProperty('id');
                expect(retrievedBarbershop).toHaveProperty('name', 'johndoes barbershop');
                expect(retrievedBarbershop).toHaveProperty('address', 'Scissors Avenue, 3434');
            });
        });

        describe('Constraints', () => {
            describe('User can only have one barbershop', () => {
                test('POST "/barbershop" twice', async () => {
                    const firstResponse = await request(expressApp)
                        .post('/barbershop')
                        .set('Authorization', `Bearer ${barbershopToken}`)
                        .send({
                            barbershop: {
                                name: 'johndoes barbershop',
                                address: 'Scissors Avenue, 3434',
                            },
                        });

                    const secondResponse = await request(expressApp)
                        .post('/barbershop')
                        .set('Authorization', `Bearer ${barbershopToken}`)
                        .send({
                            barbershop: {
                                name: 'johndoes barbershop',
                                address: 'Scissors Avenue, 3434',
                            },
                        });

                    expect(firstResponse.status).toBe(200);
                    expect(secondResponse.status).toBe(400);
                    expect(secondResponse.body.status).toBe('error');
                });
                test('DELETE "/barbershop/:id", then POST "/barbershop"', async () => {
                    const firstResponse = await request(expressApp)
                        .post('/barbershop')
                        .set('Authorization', `Bearer ${barbershopToken}`)
                        .send({
                            barbershop: {
                                name: 'johndoes barbershop',
                                address: 'Scissors Avenue, 3434',
                            },
                        });

                    const { barbershop: firstCreatedBarbershop } = firstResponse.body;

                    const deleteResponse = await request(expressApp)
                        .delete(`/barbershop/${firstCreatedBarbershop.id}`)
                        .set('Authorization', `Bearer ${barbershopToken}`);

                    const secondResponse = await request(expressApp)
                        .post('/barbershop')
                        .set('Authorization', `Bearer ${barbershopToken}`)
                        .send({
                            barbershop: {
                                name: 'johndoes new barbershop',
                                address: 'Scissors Avenue, 3434',
                            },
                        });

                    expect(firstResponse.status).toBe(200);
                    expect(deleteResponse.status).toBe(200);
                    expect(secondResponse.status).toBe(200);

                    const { barbershop: newBarbershop } = secondResponse.body;
                    expect(newBarbershop).toHaveProperty('id');
                    expect(newBarbershop).toHaveProperty('name', 'johndoes new barbershop');
                    expect(newBarbershop).toHaveProperty('address');
                });
            });
        });
    });

    describe('Unauthorized access', () => {
        describe('Client cannot change barbershop profile', () => {
            test('PUT "/barbershop/:id"', async () => {
                const { body } = await request(expressApp)
                    .post('/barbershop')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                        },
                    });

                const storedBarbershop = body.barbershop;

                const response = await request(expressApp)
                    .put(`/barbershop/${storedBarbershop.id}`)
                    .set('Authorization', `Bearer ${clientToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                            slogan: 'Your hair like crazy',
                            description: 'Have a nice haircut at johns',
                        },
                    });

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
            test('DELETE "/barbershop/:id"', async () => {
                const { body } = await request(expressApp)
                    .post('/barbershop')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                        },
                    });

                const storedBarbershop = body.barbershop;

                const response = await request(expressApp)
                    .delete(`/barbershop/${storedBarbershop.id}`)
                    .set('Authorization', `Bearer ${clientToken}`);

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
        });
        describe('Barbershop cannot change another barbershop profile', () => {
            test('PUT "/barbershop/:id"', async () => {
                const { body } = await request(expressApp)
                    .post('/barbershop')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                        },
                    });

                const storedBarbershop = body.barbershop;

                const response = await request(expressApp)
                    .put(`/barbershop/${storedBarbershop.id}`)
                    .set('Authorization', `Bearer ${anotherBarbershopToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                            slogan: 'Your hair like crazy',
                            description: 'Have a nice haircut at johns',
                        },
                    });

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
            test('DELETE "/barbershop/:id"', async () => {
                const { body } = await request(expressApp)
                    .post('/barbershop')
                    .set('Authorization', `Bearer ${barbershopToken}`)
                    .send({
                        barbershop: {
                            name: 'johndoes barbershop',
                            address: 'Scissors Avenue, 3434',
                        },
                    });

                const storedBarbershop = body.barbershop;

                const response = await request(expressApp)
                    .delete(`/barbershop/${storedBarbershop.id}`)
                    .set('Authorization', `Bearer ${anotherBarbershopToken}`);

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('error');
            });
        });
    });
});
