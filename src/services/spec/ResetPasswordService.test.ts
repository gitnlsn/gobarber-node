import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import User from '../../database/models/User';
import JwtSecurityService from '../implementations/JwtSecurityService';
import ResetPasswordService from '../implementations/ResetPasswordService';
import { JwtSignInterface } from '../interfaces/JwtSignInterface';


describe('ForgotPasswordService', () => {
    let signService: JwtSignInterface;
    let userRepository: Repository<User>;
    let saveSpy: jest.SpyInstance;

    let newPassword: string;
    let resetPasswordToken: string;
    let notResetPasswordToken: string;

    beforeAll(() => {
        signService = new JwtSecurityService('key');

        userRepository = new Repository<User>();
        jest.spyOn(userRepository, 'findOne').mockImplementation(async (conditions) => {
            if (!conditions) {
                return undefined;
            }

            const user = new User();
            if (conditions.id) user.id = conditions.id as string;
            return user;
        });
        saveSpy = jest.spyOn(userRepository, 'save').mockImplementation(async (conditions) => {
            const user = new User();
            const updatedUser = { ...user, ...conditions } as User;
            return updatedUser;
        });

        newPassword = createHash('sha256').update('password').digest('hex');
        resetPasswordToken = signService.signJwt(
            'user id',
            undefined,
            { usage: 'resetPassword' },
        );
        notResetPasswordToken = signService.signJwt(
            'user id',
            undefined,
            { usage: 'client' },
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should return token with \'client\' usage', async () => {
        const service = new ResetPasswordService(
            userRepository,
            signService,
        );
        const { token } = await service.execute({
            newPassword: createHash('sha256').update('password').digest('hex'),
            token: resetPasswordToken,
        });
        const { sub, usage } = signService.decodeJwt(token);

        expect(usage).toBe('client');
        expect(sub).toBe('user id');
    });
    it('Should save newPassword', async () => {
        const service = new ResetPasswordService(
            userRepository,
            signService,
        );

        await service.execute({
            newPassword,
            token: resetPasswordToken,
        });

        expect(saveSpy).toHaveBeenCalledTimes(1);
        const argument = saveSpy.mock.calls[0][0];

        expect(argument).toHaveProperty('id', 'user id');
        expect(argument).toHaveProperty('password');
    });
    it('Should throw if token is invalid', async () => {
        const service = new ResetPasswordService(
            userRepository,
            signService,
        );

        await expect(
            service.execute({
                newPassword: createHash('sha256').update('password').digest('hex'),
                token: notResetPasswordToken,
            }),
        ).rejects.toThrow();
    });
    it('Should throw if newPassword is not sha256', async () => {
        const service = new ResetPasswordService(
            userRepository,
            signService,
        );

        await expect(
            service.execute({
                newPassword: 'this is not a password hash',
                token: resetPasswordToken,
            }),
        ).rejects.toThrow();
    });
});
