import 'reflect-metadata';

import JwtSecurityService from '../implementations/JwtSecurityService';

describe('Security Service', () => {
    it('Should sign and decode', () => {
        const securityService = new JwtSecurityService('key');

        const token = securityService.signJwt('some id');
        const decodedToken = securityService.decodeJwt(token);

        expect(decodedToken).toHaveProperty('iat');
        expect(decodedToken).toHaveProperty('sub', 'some id');
        expect(decodedToken).toHaveProperty('exp');
    });
});
