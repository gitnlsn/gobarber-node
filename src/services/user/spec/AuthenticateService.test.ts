import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { hashSync } from 'bcryptjs';
import User from '../../../database/models/User';
import { JwtSignInterface } from '../interfaces/JwtSignInterface';
import JwtSecurityService from '../implementations/JwtSecurityService';
import AuthenticateUserService from '../implementations/AuthenticateUserService';
import { AuthenticateUserInterface } from '../interfaces/AuthenticateUserInterface';

describe('Authenticate Service', () => {
    describe('', () => {
        let userRepository: Repository<User>;
        let userRepoSaveSpy: jest.SpyInstance;
        let userRepoFindOneSpy: jest.SpyInstance;
        let authService: AuthenticateUserInterface;
        let signService: JwtSignInterface;

        const validEmail = 'valid@mail.com';
        const validPassword = createHash('sha256').update('password').digest('hex');

        beforeAll(() => {
            userRepository = new Repository<User>();

            jest.spyOn(userRepository, 'create').mockImplementation(() => new User());

            userRepoSaveSpy = jest.spyOn(userRepository, 'save');
            userRepoSaveSpy.mockImplementation(async (conditions) => {
                const user = new User();
                user.id = 'user id';
                const updatedUser = { ...user, ...conditions } as User;
                return updatedUser;
            });

            /* mocked to return no user */
            userRepoFindOneSpy = jest.spyOn(userRepository, 'findOne');
            userRepoFindOneSpy.mockImplementation(async (conditions) => {
                if (conditions.email) {
                    return {
                        id: 'user id',
                        email: validEmail,
                        password: hashSync(validPassword),
                    };
                }
                return undefined;
            });

            signService = new JwtSecurityService('key');
            authService = new AuthenticateUserService(userRepository, signService);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('Should return token with \'client\' usage property', async () => {
            const { token } = await authService.execute({
                email: validEmail,
                password: validPassword,
            });

            const decodedToken = signService.decodeJwt(token);

            expect(decodedToken.usage).toBe('client');
        });
        it('Should return user data with no password', async () => {
            const { user } = await authService.execute({
                email: validEmail,
                password: validPassword,
            });

            expect(user).toHaveProperty('id', 'user id');
            expect(user).toHaveProperty('email', validEmail);
            expect(user).not.toHaveProperty('password');
        });
        it('Should throw if email is invalid', async () => {
            userRepoFindOneSpy.mockResolvedValueOnce(undefined);
            await expect(authService.execute({
                email: 'invalid at mail dot com',
                password: validPassword,
            })).rejects.toThrow();
        });
        it('Should throw if password is invalid', async () => {
            await expect(authService.execute({
                email: validEmail,
                password: 'invalid password',
            })).rejects.toThrow();
        });
    });
});
