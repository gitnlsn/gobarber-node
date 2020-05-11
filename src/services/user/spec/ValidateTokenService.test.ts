import { hashSync } from 'bcryptjs';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import JwtSecurityService from '../implementations/JwtSecurityService';
import User from '../../../database/models/User';
import { JwtSignInterface } from '../interfaces/JwtSignInterface';
import TokenValidatorInterface from '../interfaces/ValidateTokenInterface';
import ValidateTokenService from '../implementations/ValidateTokenService';

describe('Validate Token Service', () => {
    let userRepository: Repository<User>;
    let userRepoFindOneSpy: jest.SpyInstance;
    let signService: JwtSignInterface;
    let validateTokenService: TokenValidatorInterface;

    let validToken: string;
    const validEmail = 'valid@mail.com';
    const validPassword = createHash('sha256').update('password').digest('hex');

    beforeAll(() => {
        signService = new JwtSecurityService('key');
        validToken = signService.signJwt(
            'user id',
            undefined,
            { usage: 'client' },
        );

        userRepository = new Repository<User>();


        jest.spyOn(userRepository, 'create').mockImplementation(() => new User());

        /* mocked to return no user */
        userRepoFindOneSpy = jest.spyOn(userRepository, 'findOne');
        userRepoFindOneSpy.mockImplementation(async (conditions) => {
            if (conditions.id && conditions.id === 'user id') {
                return {
                    id: 'user id',
                    email: validEmail,
                    password: hashSync(validPassword),
                };
            }
            return undefined;
        });

        validateTokenService = new ValidateTokenService(userRepository, signService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should return same token as output', async () => {
        const {
            token: outputToken,
        } = await validateTokenService.execute({ token: validToken });

        expect(outputToken).toBe(validToken);
    });
    it('Should return user data with no password', async () => {
        const { user } = await validateTokenService.execute({
            token: validToken,
        });
        expect(user).toHaveProperty('id');
        expect(user).not.toHaveProperty('password');
    });
    it('Should throw if token is invalid', async () => {
        await expect(
            validateTokenService.execute({
                token: 'invalid toekn',
            }),
        ).rejects.toThrow();
    });
    it('Should throw if token usage is not client', async () => {
        const tokenWithNoClientUsage = signService.signJwt('user id');
        await expect(
            validateTokenService.execute({
                token: tokenWithNoClientUsage,
            }),
        ).rejects.toThrow();
    });
    it('Should throw if token subject identifies no user in repository', async () => {
        const tokenWithNoClientUsage = signService.signJwt(
            'different user id',
            undefined,
            { usage: 'client' },
        );
        await expect(
            validateTokenService.execute({
                token: tokenWithNoClientUsage,
            }),
        ).rejects.toThrow();
    });
});
