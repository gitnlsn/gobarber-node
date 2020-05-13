import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import CrudBarbershopService from '../../services/babershop/implementations/CrudBarbershopService';
import AppError from '../../errors/AppError';

/**
 * Intercepts the token at authorization header and validates it with ValidateTokenService
 */
async function identifyBarbershop(
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { user } = request;

        if (!user) {
            return next(new AppError('Unauthorized', 401));
        }

        const crudBarbershopService = container.resolve(CrudBarbershopService);

        const { barbershop } = await crudBarbershopService.retrieve({ owner: user });

        if (barbershop) {
            request.barbershop = barbershop;
        }

        return next();
    } catch (error) {
        return next(error);
    }
}

export default identifyBarbershop;
