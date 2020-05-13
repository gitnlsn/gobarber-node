import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import ValidateTokenService from '../../services/user/implementations/ValidateTokenService';
import AppError from '../../errors/AppError';

/**
 * Intercepts the token at authorization header and validates it with ValidateTokenService
 */
async function authenticate(
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { authorization: authHeader } = request.headers;

        if (!authHeader) {
            return next(new AppError('Unauthorized', 401));
        }

        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer') {
            return next(new AppError('Unauthorized', 401));
        }

        const tokenValidatorService = container.resolve(ValidateTokenService);

        const { user } = await tokenValidatorService.execute({
            token,
        });

        request.clientToken = token;
        request.user = user;

        return next();
    } catch (error) {
        return next(error);
    }
}

export default authenticate;
