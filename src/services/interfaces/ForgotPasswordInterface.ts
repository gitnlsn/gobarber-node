import User from '../../database/models/User';

export interface ForgotPasswordInput{
    email: string; /* jwt with resetPassword attribute */
}

export interface ForgotPasswordOutput{
    token: string; /* jwt with resetPassword attribute */
    user: Omit<User, 'password'>;
}

export interface ForgotPasswordInterface {
    /**
     * Verifies if user exists and returns a token.
     * Jwt token authenticates new password request.
     */
    execute(userData: ForgotPasswordInput): Promise<ForgotPasswordOutput>;
}

export default ForgotPasswordInterface;
