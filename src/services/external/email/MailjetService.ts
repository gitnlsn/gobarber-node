import { injectable, inject } from 'tsyringe';
import mailjet from 'node-mailjet';
import EmailServiceInterface, { MailData, SendMailResult } from './EmaiServicelInterface';

@injectable()
class MailjetService implements EmailServiceInterface {
    private jet: mailjet.Email.Client;

    constructor(
        @inject('MAILJET_APIKEY_PUBLIC') private apikeyPublic: string,
        @inject('MAILJET_APIKEY_PRIVATE') private apikeyPrivate: string,
    ) {
        this.jet = mailjet.connect(
            apikeyPublic,
            apikeyPrivate,
        );
    }

    async sendMail({
        from,
        to,
        message,
        subject,
    }: MailData): Promise<SendMailResult> {
        const result = await this.jet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [{
                    From: {
                        Email: from.email,
                        Name: from.name,
                    },
                    To: [{
                        Email: to.email,
                        Name: to.name,
                    }],
                    Subject: subject,
                    TextPart: message.text,
                    HTMLPart: message.html,
                }],
            });

        return {
            status: (result.body as any).Messages[0].Status === 'success'
                ? 'ok'
                : 'failed',
            data: result.body,
        };
    }
}

export default MailjetService;
