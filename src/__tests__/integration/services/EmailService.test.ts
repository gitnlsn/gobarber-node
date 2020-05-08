import EmailService from '../../../services/EmailService';

jest.setTimeout(10000);
describe('Email Service', () => {
    describe('Ethereal testing mail', () => {
        it('Should send email to ethereal', async () => {
            const service = new EmailService();
            const response = await service.sendTestMail({
                message: 'testing',
                subject: 'gobarber-test mail',
                to: 'nsln-test-gobarber@mail.com',
                from: 'test-nlsn-gobarber@mail.com',
            });

            expect(response.status).toBe('ok');
            expect(response.data).toHaveProperty(
                'accepted',
                ['nsln-test-gobarber@mail.com'],
            );
        });
    });

    describe('SendGrid mail', () => {
        it.skip('Should send test email', async () => {
            const service = new EmailService();
            const response = await service.sendGridMail({
                subject: 'SendGrid testing email',
                to: 'nelsonkenzotamashrio@gmail.com',
                message: 'Hello SendGrid',
                from: 'test@mail.com',
            });
            expect(response.status).toBe('ok');
        });
    });
});
