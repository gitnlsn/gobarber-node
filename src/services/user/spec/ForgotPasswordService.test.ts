import { Repository } from 'typeorm';
import User from '../../../database/models/User';
import ForgotPasswordService from '../implementations/ForgotPasswordService';
import JwtSecurityService from '../implementations/JwtSecurityService';

describe('ForgotPasswordService', () => {
    const signService = new JwtSecurityService('key');

    const userRepository = new Repository<User>();
    const mockedFindOne = jest.spyOn(userRepository, 'findOne');
    mockedFindOne.mockImplementation(async (conditions) => {
        if (!conditions) {
            return undefined;
        }

        const user = new User();
        user.id = 'userId';
        if (conditions.email) user.email = conditions.email as string;
        return user;
    });

    it('Should return token with resetPassword usage', async () => {
        const service = new ForgotPasswordService(
            userRepository,
            signService,
        );
        const { token } = await service.execute({ email: 'johndoe@mail.com' });
        const { usage } = signService.decodeJwt(token);

        expect(usage).toBe('resetPassword');
    });
    it('Should throw if email is invalid', async () => {
        const service = new ForgotPasswordService(
            userRepository,
            signService,
        );
        mockedFindOne.mockResolvedValueOnce(undefined);

        await expect(
            service.execute({ email: 'johndoe@mail.com' }),
        ).rejects.toThrow();
    });
});
