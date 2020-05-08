import User from '../../database/models/User';

export interface TokenValidatorInput {
    token: string;
}

export interface TokenValidatorOutput {
    user: User;
    token: string;
}

export interface TokenValidatorInterface {
    execute(input: TokenValidatorInput): Promise<TokenValidatorOutput>;
}

export default TokenValidatorInterface;
