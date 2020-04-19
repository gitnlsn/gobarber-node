import { Router, Request, Response } from 'express';
import { getRepository, createConnection } from 'typeorm';

import { getJwtSignKey } from '../services/SecurityService';

import Users from '../models/Users';
import RegisterUserService from '../services/RegisterUserService';
import AuthenticateUserService from '../services/AuthenticateUserService';
import ValidateTokenService from '../services/ValidateTokenService';

createConnection();
const routes = Router();
const jwtKey = getJwtSignKey();

/**
 * Register route
 */
routes.post('/register', async (request: Request, response: Response) => {
    const {
        email,
        password,
    } = request.body;

    const userRepo = getRepository(Users);
    const service = new RegisterUserService(userRepo);

    const userProps = await service.execute({
        email,
        password,
    });

    return response.status(200).json(userProps);
});

/**
 * Authenticate route
 */
routes.post('/authenticate', async (request: Request, response: Response) => {
    const {
        email,
        password,
    } = request.body;

    const userRepo = getRepository(Users);
    const service = new AuthenticateUserService(userRepo, jwtKey);

    const token = await service.execute({
        email,
        password,
    });

    return response.status(200).json({ token });
});

/**
 * Validate Jwt
 */
routes.post('/validate-token', async (request: Request, response: Response) => {
    const {
        token,
    } = request.body;

    const userRepo = getRepository(Users);
    const service = new ValidateTokenService(userRepo, jwtKey);

    const userId = await service.execute({
        token,
    });

    return response.status(200).json({ userId });
});


export default routes;
