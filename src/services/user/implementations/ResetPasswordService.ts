import { Repository } from 'typeorm';
import { inject } from 'tsyringe';
import validator from 'validator';
import { hashSync } from 'bcryptjs';
import {
    ResetPasswordInterface,
    ResetPasswordInput,
    ResetPasswordOutput,
} from '../interfaces/ResetPasswordInterface';
import User from '../../../database/models/User';
import { JwtSignInterface, TokenPayload } from '../interfaces/JwtSignInterface';
import AppError from '../../../errors/AppError';


class ResetPasswordService implements ResetPasswordInterface {
    constructor(
        @inject('UsersRepository') private userRepository: Repository<User>,
        @inject('JwtSecurityService') private jwtSignService: JwtSignInterface,
    ) { }

    public async execute({
        token,
        newPassword,
    }: ResetPasswordInput): Promise<ResetPasswordOutput> {
        let decodedToken: TokenPayload;

        try {
            decodedToken = this.jwtSignService.decodeJwt(token);
        } catch (error) {
            throw new AppError('Invalid token');
        }

        const {
            usage,
            sub: userId,
        } = decodedToken;

        if (usage !== 'resetPassword') {
            throw new AppError('Invalid token');
        }

        const user = await this.userRepository.findOne({ id: userId });

        if (!user) {
            throw new AppError('No user related to the provided token');
        }

        if (!validator.isHash(newPassword, 'sha256')) {
            throw new AppError('Invalid password');
        }

        user.password = hashSync(newPassword);
        user.updatedAt = new Date();
        await this.userRepository.save(user);

        const clonedUser = { ...user };
        delete clonedUser.password;

        const clientToken = this.jwtSignService.signJwt(
            user.id,
            undefined,
            { usage: 'client' as TokenPayload['usage'] },
        );

        return {
            token: clientToken,
            user: clonedUser,
        };
    }
}

export default ResetPasswordService;
