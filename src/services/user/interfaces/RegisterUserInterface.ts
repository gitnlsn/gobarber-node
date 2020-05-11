import User from '../../../database/models/User';

export interface RegisterUserInput {
    name?: string;
    email: string;
    password: string;
}

export interface RegisterUserOutput {
    user: User;
    token: string;
}

export interface RegisterUserInterface {
    execute(userProps: RegisterUserInput): Promise<RegisterUserOutput>;
}
