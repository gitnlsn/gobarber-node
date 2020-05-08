import { Repository } from 'typeorm';
import { inject } from 'tsyringe';
import {
    ForgotPasswordInterface,
    ForgotPasswordOutput,
    ForgotPasswordInput,
} from '../interfaces/ForgotPasswordInterface';
import User from '../../database/models/User';
import { JwtSignInterface, TokenPayload } from '../interfaces/JwtSignInterface';
import AppError from '../../errors/AppError';

class ForgotPasswordService implements ForgotPasswordInterface {
    constructor(
        @inject('UsersRepository') private userRepository: Repository<User>,
        @inject('JwtSecurityService') private jwtSignService: JwtSignInterface,
    ) {}

    public async execute({
        email,
    }: ForgotPasswordInput): Promise<ForgotPasswordOutput> {
        const user = await this.userRepository.findOne({ email });

        if (!user) {
            throw new AppError('No user related to the specified email');
        }

        const clonedUser = { ...user };
        delete clonedUser.password;

        const token = this.jwtSignService.signJwt(
            user.id,
            undefined,
            { usage: 'resetPassword' as TokenPayload['usage'] },
        );

        return {
            token,
            user: clonedUser,
        };
    }
}

export default ForgotPasswordService;
