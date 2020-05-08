import { container } from 'tsyringe';
import JwtSecurityService, { newBytesWord } from './JwtSecurityService';
import { JwtSignInterface } from '../interfaces/JwtSignInterface';


const register: () => void = () => {
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
};


export default register;
