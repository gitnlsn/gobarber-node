import { Request, Response, NextFunction } from 'express';
import 'express-async-errors';

import AppError from './AppError';


const middleware: (
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction
) => void = (error, request, response, _) => {
    if (error instanceof AppError) {
        return response.status(error.statusCode).json({
            status: 'error',
            message: error.message,
        });
    }

    /* eslint-disable-next-line no-console */
    console.error(error);
    return response.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
};


export default middleware;
