import sendgrid from '@sendgrid/mail';

import { Response } from 'express';
import SendGridService from '../implementations/SendGridService';

jest.mock('@sendgrid/mail');

describe('SendGrid Mail Service', () => {
    let sendMock: jest.SpyInstance;
    let setApiMock: jest.SpyInstance;

    beforeAll(() => {
        sendMock = jest.spyOn(sendgrid, 'send');
        sendMock.mockImplementation(async () => ([{ statusCode: 200 } as Response]));

        setApiMock = jest.spyOn(sendgrid, 'setApiKey');
        setApiMock.mockImplementation((key) => key);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should call \'sendgrid.send\' with mail props', async () => {
        const mailService = new SendGridService('key');
        await mailService.sendMail({
            from: 'sender@mail.com',
            to: 'receiver@mail.com',
            message: 'hello receiver',
            subject: 'testing message',
        });

        expect(sendMock).toHaveBeenCalledWith(
            expect.objectContaining({
                from: 'sender@mail.com',
                to: 'receiver@mail.com',
                subject: 'testing message',
                text: 'hello receiver',
            }),
        );
    });
    it('Should call \'sendgrid.setApiKey\' with injected key', async () => {
        const mailService = new SendGridService('key');
        await mailService.sendMail({
            from: 'sender@mail.com',
            to: 'receiver@mail.com',
            message: 'hello receiver',
            subject: 'testing message',
        });

        expect(setApiMock).toHaveBeenCalledWith('key');
    });
    it('Should return \'ok\' status if http response has 200 like statusCode', async () => {
        sendMock.mockResolvedValueOnce(([{ statusCode: 201 } as Response]));
        const mailService = new SendGridService('key');
        const { status } = await mailService.sendMail({
            from: 'sender@mail.com',
            to: 'receiver@mail.com',
            message: 'hello receiver',
            subject: 'testing message',
        });

        expect(status).toBe('ok');
    });
    it('Should throw error from sendGrid', async () => {
        sendMock.mockRejectedValueOnce(new Error('Failed to send mail'));
        const mailService = new SendGridService('key');
        await expect(
            mailService.sendMail({
                from: 'sender@mail.com',
                to: 'receiver@mail.com',
                message: 'hello receiver',
                subject: 'testing message',
            }),
        ).rejects.toThrow();
    });
});
