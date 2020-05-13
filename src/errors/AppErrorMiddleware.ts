import { Request, Response, NextFunction } from 'express';
import 'express-async-errors';

import AppError from './AppError';


const middleware: (
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction
) => void = (error, request, response, _) => {
    if (error.name === 'AppError') {
        return response.status((error as AppError).statusCode).json({
            status: 'error',
            message: error.message,
        });
    }

    console.error(error);
    /* eslint-disable-next-line no-console */
    return response.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
};


export default middleware;
