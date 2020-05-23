export interface MailData {
    subject: string;
    message: {
        text: string;
        html?: string;
    };
    to: {
        name?: string;
        email: string;
    };
    from: {
        name?: string;
        email: string;
    };
}

export interface SendMailResult {
    status: 'ok' | 'failed';
    data: object;
}

/**
 * Encapsulates email sending. Exposes mail DTO only.
 */
export interface EmailServiceInterface {
    sendMail(mailData: MailData): Promise<SendMailResult>;
}

export default EmailServiceInterface;
