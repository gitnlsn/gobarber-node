import { validFullName } from '../implementations/RegisterUserService';

describe('Register Service', () => {
    test('validator to full name', () => {
        expect(validFullName('john doe')).toBeTruthy();
        expect(validFullName('John Doe')).toBeTruthy();
        expect(validFullName('John doe')).toBeTruthy();
        expect(validFullName('johndoe')).toBeTruthy();
        expect(validFullName('Johndoe')).toBeTruthy();
        expect(validFullName('JohnDoe')).toBeTruthy();
    });
});
