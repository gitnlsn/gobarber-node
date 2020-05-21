export interface MailData {
    subject: string;
    message: string;
    to: string;
    from: string;
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
