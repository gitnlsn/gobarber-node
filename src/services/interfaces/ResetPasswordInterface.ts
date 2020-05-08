import User from '../../database/models/User';

export interface ResetPasswordInput{
    token: string; /* jwt with resetPassword attribute */
    newPassword: string; /* new password must be a sha256 */
}

export interface ResetPasswordOutput{
    user: Omit<User, 'password'>;
    token: string; /* jwt with clientConnect attribute */
}

export interface ResetPasswordInterface {
    /**
     * Verifies if user exists and returns a token.
     * Jwt token authenticates new password request.
     */
    execute(userData: ResetPasswordInput): Promise<ResetPasswordOutput>;
}

export default ResetPasswordInterface;
