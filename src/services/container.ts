import { container } from 'tsyringe';
import dotenv from 'dotenv';
import JwtSecurityService, { newBytesWord } from './user/implementations/JwtSecurityService';
import { JwtSignInterface } from './user/interfaces/JwtSignInterface';

function registerServices(): void {
    dotenv.config();

    container.register<JwtSignInterface>(
        'JwtSecurityService',
        JwtSecurityService,
    );

    /*
        TODO: enhance security
            implement a random key manager/repository/generator
    */
    container.register<string>(
        'jwtSignKey',
        { useValue: newBytesWord(512) },
    );

    container.register<string>(
        'APPLICATION_DOMAIN_NAME',
        { useValue: process.env.APPLICATION_DOMAIN_NAME as string },
    );

    container.register<string>(
        'MAILJET_APIKEY_PUBLIC',
        { useValue: process.env.MAILJET_APIKEY_PUBLIC as string },
    );

    container.register<string>(
        'MAILJET_APIKEY_PRIVATE',
        { useValue: process.env.MAILJET_APIKEY_PRIVATE as string },
    );

    container.register<string>(
        'MAILJET_SENDER_EMAIL',
        { useValue: process.env.MAILJET_SENDER_EMAIL as string },
    );
}


export default registerServices;
