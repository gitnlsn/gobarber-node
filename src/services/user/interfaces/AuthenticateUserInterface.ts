import User from '../../../database/models/User';

export interface AuthenticateInput {
    email: string;
    password: string;
}

export interface AuthenticateOutput {
    user: Omit<User, 'password'>;
    token: string; /* token with clientConnect attribute */
}

export interface AuthenticateUserInterface {
    execute(userProps: AuthenticateInput): Promise<AuthenticateOutput>;
}
