import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import RegisterUserService, { validFullName } from '../implementations/RegisterUserService';
import User from '../../database/models/User';
import { RegiterUserInterface } from '../interfaces/RegisterUserInterface';
import { JwtSignInterface } from '../interfaces/JwtSignInterface';
import JwtSecurityService from '../implementations/JwtSecurityService';

describe('Register Service', () => {
    test('validator to full name', () => {
        expect(validFullName('john doe')).toBeTruthy();
        expect(validFullName('John Doe')).toBeTruthy();
        expect(validFullName('John doe')).toBeTruthy();
        expect(validFullName('johndoe')).toBeTruthy();
        expect(validFullName('Johndoe')).toBeTruthy();
        expect(validFullName('JohnDoe')).toBeTruthy();
    });

    describe('', () => {
        let userRepository: Repository<User>;
        let userRepoSaveSpy: jest.SpyInstance;
        let userRepoFindOneSpy: jest.SpyInstance;
        let registerService: RegiterUserInterface;
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
            userRepoFindOneSpy.mockImplementation(async () => undefined);

            signService = new JwtSecurityService('key');
            registerService = new RegisterUserService(userRepository, signService);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('Should return token with \'client\' usage property', async () => {
            const { token } = await registerService.execute({
                email: validEmail,
                password: validPassword,
            });

            const decodedToken = signService.decodeJwt(token);

            expect(decodedToken.usage).toBe('client');
        });
        it('Should return user data', async () => {
            const { user } = await registerService.execute({
                email: validEmail,
                password: validPassword,
            });

            expect(user).toHaveProperty('id', 'user id');
            expect(user).toHaveProperty('email', validEmail);
            expect(user).not.toHaveProperty('password');
        });
        it('Should save user in repository', async () => {
            await registerService.execute({
                email: validEmail,
                password: validPassword,
            });

            const saveArguments = userRepoSaveSpy.mock.calls[0][0];
            expect(saveArguments).toHaveProperty('email', validEmail);
            expect(saveArguments).toHaveProperty('password');
        });
        it('Should throw if email is invalid', async () => {
            await expect(registerService.execute({
                email: 'invalid at mail dot com',
                password: validPassword,
            })).rejects.toThrow();
        });
        it('Should throw if username is invalid', async () => {
            await expect(registerService.execute({
                name: '!nvalid U53$ $#@!$!',
                email: validEmail,
                password: validPassword,
            })).rejects.toThrow();
        });
        it('Should throw if password is invalid', async () => {
            await expect(registerService.execute({
                email: validEmail,
                password: 'invalid password',
            })).rejects.toThrow();
        });
        it('Should throw if email already exists', async () => {
            userRepoFindOneSpy.mockResolvedValueOnce(new User());
            await expect(registerService.execute({
                email: validEmail,
                password: validPassword,
            })).rejects.toThrow();
        });
    });
});
