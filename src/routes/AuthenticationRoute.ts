import {
    Router, Request, Response, NextFunction,
} from 'express';

import { container } from 'tsyringe';

import RegisterUserService from '../services/user/implementations/RegisterUserService';
import AuthenticateUserService from '../services/user/implementations/AuthenticateUserService';
import ValidateTokenService from '../services/user/implementations/ValidateTokenService';

const routes = Router();

/**
 * Register route
 */
routes.post('/register', async (request: Request, response: Response, next: NextFunction) => {
    try {
        const {
            email,
            password,
        } = request.body;

        const service = container.resolve(RegisterUserService);

        const { user, token } = await service.execute({
            email,
            password,
        });

        return response.status(200).json({ user, token });
    } catch (error) {
        return next(error);
    }
});

/**
 * Authenticate route
 */
routes.post('/authenticate', async (request: Request, response: Response, next: NextFunction) => {
    try {
        const {
            email,
            password,
        } = request.body;

        const service = container.resolve(AuthenticateUserService);

        const { user, token } = await service.execute({
            email,
            password,
        });

        return response.status(200).json({ user, token });
    } catch (error) {
        return next(error);
    }
});

/**
 * Validate Jwt
 */
routes.post('/validate-token', async (request: Request, response: Response, next: NextFunction) => {
    try {
        const {
            token,
        } = request.body;

        const service = container.resolve(ValidateTokenService);

        const {
            user,
        } = await service.execute({
            token,
        });

        return response.status(200).json({ user, token });
    } catch (error) {
        return next(error);
    }
});


export default routes;
