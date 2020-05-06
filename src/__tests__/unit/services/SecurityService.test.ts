import 'reflect-metadata';

import { container } from 'tsyringe';
import SecurityService from '../../../services/SecurityService';
import registerServices from '../../../services/container';

describe('Security Service', () => {
    beforeAll(() => {
        registerServices();
    });
    it('Should sign and decode', () => {
        const securityService = container.resolve(SecurityService);

        const token = securityService.signJwt('some id');
        const decodedToken = securityService.decodeJwt(token);

        expect(decodedToken).toHaveProperty('iat');
        expect(decodedToken).toHaveProperty('sub', 'some id');
        expect(decodedToken).toHaveProperty('exp');
    });
});
