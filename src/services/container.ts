import { container } from 'tsyringe';
import JwtSecurityService, { newBytesWord } from './user/implementations/JwtSecurityService';
import { JwtSignInterface } from './user/interfaces/JwtSignInterface';

function registerServices() {
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
}


export default registerServices;
