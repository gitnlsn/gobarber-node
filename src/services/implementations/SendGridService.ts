import 'reflect-metadata';

import sendgrid from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { singleton } from 'tsyringe';
import EmailServiceInterface, { MailData, SendMailResult } from '../interfaces/EmaiServicelInterface';

@singleton()
class SendGridService implements EmailServiceInterface {
    private sendGridKey: string;

    public withKey(sendGridKey: string): SendGridService {
        this.sendGridKey = sendGridKey;
        return this;
    }

    /**
     * Uses Ethereal to test mail
     */
    async sendTestMail({
        subject,
        message,
        to,
        from,
    }: MailData): Promise<SendMailResult> {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const info = await transporter.sendMail({
            from,
            to,
            subject,
            text: message,
        });

        const result = nodemailer.getTestMessageUrl(info);
        return {
            status: result ? 'ok' : 'failed',
            data: info,
        };
    }

    /**
     * Implementation to sendGrid
     */
    async sendGridMail({
        subject,
        message,
        to,
        from,
    }: MailData): Promise<SendMailResult> {
        sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

        const response = await sendgrid.send({
            from,
            subject,
            to,
            text: message,
        } as sendgrid.MailDataRequired);

        const [{
            statusCode,
            headers,
        }] = response;

        return {
            status: statusCode >= 200 && statusCode < 300 ? 'ok' : 'failed',
            data: headers,
        };
    }

    async sendMail(data: MailData): Promise<SendMailResult> {
        const sendGridConfigured = !!this.sendGridKey;

        if (sendGridConfigured) {
            return this.sendGridMail(data);
        }
        return this.sendTestMail({
            subject: 'GoBarber application mail service testing',
            message: 'The email service was configured not to send email to user, we did a test mail instead.',
            to: 'test@nlsn-gobarber.ga',
            from: 'test@nlsn-gobarber.ga',
        });
    }
}

export default SendGridService;
