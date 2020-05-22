/* eslint-disable max-len */
import request from 'supertest';
import express from 'express';
import { Connection, createConnection } from 'typeorm';

import { createHash } from 'crypto';
import { GoBarberServer } from '../../../app';
import Barbershop from '../../../database/models/Barbershop';
import ServiceType from '../../../database/models/ServiceType';
import BarbershopService from '../../../database/models/BarbershopService';

describe('Retriever Router to Appointments', () => {
    let expressApp: express.Express;
    let connection: Connection;

    let barbershopToken: string;
    let registeredBarbershop: Barbershop;

    let anotherBarbershopToken: string;
    let anotherRegisteredBarbershop: Barbershop;

    let availableServiceType: ServiceType;
    let anotherAvailableServiceType: ServiceType;

    let choosenService: BarbershopService;

    let clientToken: string;

    beforeAll(async () => {
        connection = await createConnection();
        expressApp = await GoBarberServer({
            typeormConnection: connection,
        });

        /* Inserting serviceTypes manually since there is no designed route to create it */
        const serviceTypeRepository = connection.getRepository(ServiceType);
        availableServiceType = await serviceTypeRepository.save({
            title: 'Haircut - male',
            description: 'haircut for men',
            logoUrl: 'some male hair logo url',
        });

        anotherAvailableServiceType = await serviceTypeRepository.save({
            title: 'Haircut - female',
            description: 'haircut for women',
            logoUrl: 'some female hair logo url',
        });

        const { body: { token: firstToken } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'john1@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        barbershopToken = firstToken;

        const { body: { barbershop: firstBarbershop } } = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${barbershopToken}`)
            .send({
                barbershop: {
                    name: 'johndoes 1 shop',
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

        const { body: { barbershop: secondBarbershop } } = await request(expressApp)
            .post('/barbershop/')
            .set('Authorization', `Bearer ${anotherBarbershopToken}`)
            .send({
                barbershop: {
                    name: 'johndoes 2 shop',
                    address: 'Scissors Avenue, 3434',
                },
            });

        anotherRegisteredBarbershop = secondBarbershop;

        const { body: { token: thirdToken } } = await request(expressApp)
            .post('/user/register')
            .send({
                email: 'johnclient@mail.com',
                password: createHash('sha256').update('12345678').digest('hex'),
            });

        clientToken = thirdToken;

        /* Creating services */
        const { body: { service: service1 } } = await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${barbershopToken}`)
            .send({
                service: {
                    provider: registeredBarbershop,
                    type: availableServiceType,
                    price: 4000,
                    description: 'short haircut',
                    logo: 'short hair logo',
                },
            });

        const { body: { service: service2 } } = await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${barbershopToken}`)
            .send({
                service: {
                    provider: registeredBarbershop,
                    type: anotherAvailableServiceType,
                    price: 5000,
                    description: 'long haircut',
                    logo: 'long hair logo',
                },
            });

        choosenService = service2;

        const { body: { service: service3 } } = await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${anotherBarbershopToken}`)
            .send({
                service: {
                    provider: anotherRegisteredBarbershop,
                    type: availableServiceType,
                    price: 6000,
                    description: 'short styled haircut',
                    lgoo: 'amazing start logo',
                },
            });

        const { body: { service: service4 } } = await request(expressApp)
            .post('/barbershop/service')
            .set('Authorization', `Bearer ${anotherBarbershopToken}`)
            .send({
                service: {
                    provider: anotherRegisteredBarbershop,
                    type: anotherAvailableServiceType,
                    price: 8000,
                    description: 'long styled haircut',
                    lgoo: 'amazing start logo',
                },
            });

        /* Creating appointments */
        await request(expressApp)
            .post('/barbershop/appointment')
            .set('Authorization', `Bearer ${barbershopToken}`)
            .send({
                appointment: {
                    title: 'Short haircut 1 period',
                    startsAt: new Date('2020-05-20T16:00:00.000Z'), /* first appointment */
                    endsAt: new Date('2020-05-20T17:00:00.000Z'),
                    service: service1,
                },
            });

        await request(expressApp)
            .post('/barbershop/appointment')
            .set('Authorization', `Bearer ${barbershopToken}`)
            .send({
                appointment: {
                    title: 'Short Haircut 2 period',
                    startsAt: new Date('2020-05-20T17:00:00.000Z'), /* 1 hour later */
                    endsAt: new Date('2020-05-20T18:00:00.000Z'),
                    service: service1,
                },
            });

        await request(expressApp)
            .post('/barbershop/appointment')
            .set('Authorization', `Bearer ${barbershopToken}`)
            .send({
                appointment: {
                    title: 'Long haircut 1 period',
                    startsAt: new Date('2020-05-21T16:00:00.000Z'), /* 1 day later */
                    endsAt: new Date('2020-05-21T17:00:00.000Z'),
                    service: service2,
                },
            });

        await request(expressApp)
            .post('/barbershop/appointment')
            .set('Authorization', `Bearer ${barbershopToken}`)
            .send({
                appointment: {
                    title: 'Long Haircut 2 period',
                    startsAt: new Date('2020-05-21T17:00:00.000Z'), /* 1 day + 1 hour later */
                    endsAt: new Date('2020-05-21T18:00:00.000Z'),
                    service: service2,
                },
            });

        await request(expressApp)
            .post('/barbershop/appointment')
            .set('Authorization', `Bearer ${anotherBarbershopToken}`) /* other barbershop */
            .send({
                appointment: {
                    title: 'Short styled Haircut 1 period',
                    startsAt: new Date('2020-05-20T16:00:00.000Z'), /* same first datetime */
                    endsAt: new Date('2020-05-20T17:00:00.000Z'),
                    service: service3,
                },
            });

        const { body: { appointment: appointmentToAccept } } = await request(expressApp)
            .post('/barbershop/appointment')
            .set('Authorization', `Bearer ${anotherBarbershopToken}`)
            .send({
                appointment: {
                    title: 'Long styled Haircut 2 period',
                    startsAt: new Date('2020-05-20T17:00:00.000Z'), /* 1 hour later */
                    endsAt: new Date('2020-05-20T18:00:00.000Z'),
                    service: service4,
                },
            });

        /* User accepts appointment */
        await request(expressApp)
            .put(`/client/appointment/accept/${appointmentToAccept.id}`)
            .set('Authorization', `Bearer ${clientToken}`);
    });

    afterAll(async () => {
        await connection.query('delete from barbershop_services');
        await connection.query('delete from service_types');
        await connection.query('delete from barbershops');
        await connection.query('delete from users');
        await connection.close();
    });

    describe('Default behaviour', () => {
        test('GET "/appointments" retrieves all', async () => {
            const response = await request(expressApp)
                .get('/appointments');

            expect(response.status).toBe(200);
            const { appointmentList } = response.body;

            expect(Array.isArray(appointmentList)).toBeTruthy();
            expect(appointmentList.length).toBe(6);
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short haircut 1 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short Haircut 2 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long haircut 1 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long Haircut 2 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short styled Haircut 1 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long styled Haircut 2 period' }));
        });
    });

    describe('Filtering', () => {
        test('GET "/appointments?from=:date&to=date" filters by date', async () => {
            const response = await request(expressApp)
                .get('/appointments?from=2020-05-20&to=2020-05-21');

            expect(response.status).toBe(200);
            const { appointmentList } = response.body;

            expect(Array.isArray(appointmentList)).toBeTruthy();
            expect(appointmentList.length).toBe(4);
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short haircut 1 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short Haircut 2 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short styled Haircut 1 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long styled Haircut 2 period' }));
        });
        test('GET "/appointments?avaliable=true" filters accepted appointments', async () => {
            const response = await request(expressApp)
                .get('/appointments?available=true');

            expect(response.status).toBe(200);
            const { appointmentList } = response.body;

            expect(Array.isArray(appointmentList)).toBeTruthy();
            expect(appointmentList.length).toBe(5);
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short haircut 1 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short Haircut 2 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long haircut 1 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long Haircut 2 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short styled Haircut 1 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long styled Haircut 2 period' }));
        });
        test('GET "/appointments?avaliable=false" filters available appointments', async () => {
            const response = await request(expressApp)
                .get('/appointments?available=false');

            expect(response.status).toBe(200);
            const { appointmentList } = response.body;

            expect(Array.isArray(appointmentList)).toBeTruthy();
            expect(appointmentList.length).toBe(1);
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short haircut 1 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short Haircut 2 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long haircut 1 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long Haircut 2 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short styled Haircut 1 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long styled Haircut 2 period' }));
        });
        test('GET "/appointments?serviceId=:id" filters available appointments', async () => {
            const response = await request(expressApp)
                .get(`/appointments?serviceId=${choosenService.id}`);

            expect(response.status).toBe(200);
            const { appointmentList } = response.body;

            expect(Array.isArray(appointmentList)).toBeTruthy();
            expect(appointmentList.length).toBe(2);
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short haircut 1 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short Haircut 2 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long haircut 1 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long Haircut 2 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short styled Haircut 1 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long styled Haircut 2 period' }));
        });
        test('GET "/appointments?providerId=:id" filters available appointments', async () => {
            const response = await request(expressApp)
                .get(`/appointments?providerId=${registeredBarbershop.id}`);

            expect(response.status).toBe(200);
            const { appointmentList } = response.body;

            expect(Array.isArray(appointmentList)).toBeTruthy();
            expect(appointmentList.length).toBe(4);
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short haircut 1 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short Haircut 2 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long haircut 1 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long Haircut 2 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short styled Haircut 1 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long styled Haircut 2 period' }));
        });
        test('GET "/appointments?serviceTypeId=:id" filters available appointments', async () => {
            const response = await request(expressApp)
                .get(`/appointments?serviceTypeId=${availableServiceType.id}`);

            expect(response.status).toBe(200);
            const { appointmentList } = response.body;

            expect(Array.isArray(appointmentList)).toBeTruthy();
            expect(appointmentList.length).toBe(3);
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short haircut 1 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short Haircut 2 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long haircut 1 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long Haircut 2 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short styled Haircut 1 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long styled Haircut 2 period' }));
        });
        test('GET "/appointments?serviceTypeId=:typeId&providerId=:shopId" filters available appointments', async () => {
            const response = await request(expressApp)
                .get(`/appointments?serviceTypeId=${availableServiceType.id}&providerId=${registeredBarbershop.id}`);

            expect(response.status).toBe(200);
            const { appointmentList } = response.body;

            expect(Array.isArray(appointmentList)).toBeTruthy();
            expect(appointmentList.length).toBe(2);
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short haircut 1 period' }));
            expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short Haircut 2 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long haircut 1 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long Haircut 2 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Short styled Haircut 1 period' }));
            // expect(appointmentList).toContainEqual(expect.objectContaining({ title: 'Long styled Haircut 2 period' }));
        });
    });
});
