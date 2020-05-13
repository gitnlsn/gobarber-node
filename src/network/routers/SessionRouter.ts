import {
    Router,
    Request,
    Response,
    NextFunction,
} from 'express';

import { container } from 'tsyringe';

import RegisterUserService from '../../services/user/implementations/RegisterUserService';
import AuthenticateUserService from '../../services/user/implementations/AuthenticateUserService';
import ValidateTokenService from '../../services/user/implementations/ValidateTokenService';
import ResetPasswordService from '../../services/user/implementations/ResetPasswordService';
import ForgotPasswordService from '../../services/user/implementations/ForgotPasswordService';
import SendGridService from '../../services/user/implementations/SendGridService';
import AppError from '../../errors/AppError';

const routes = Router();

routes.post('/register', async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
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

routes.post('/authenticate', async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
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

routes.post('/validate-token', async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
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

routes.post('/password/forgot', async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const { email } = request.body;

        const forgotService = container.resolve(ForgotPasswordService);
        const apiKey = process.env.SENDGRID_API_KEY;

        if (!apiKey) {
            console.error('SendGrid service misses api key configuration');
            return next(new AppError('Failed to send email'));
        }

        const mailService = new SendGridService(apiKey);

        const { token: resetPasswordToken } = await forgotService.execute({
            email,
        });

        mailService.sendMail({
            to: email,
            message: `link to reset password ${resetPasswordToken}`,
            subject: 'Reset Password',
            from: 'admin@mail.com',
        }).catch((rejectError) => {
            console.warn(rejectError);
        });

        return response.status(200).json({
            message: 'Recovery email was sent',
        });
    } catch (error) {
        return next(error);
    }
});

routes.post('/password/reset', async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        /*
            TODO:
                - token won't be invalidated
                - the same token may be used twice

            ALTERNATIVE:
                - Use redis to store JWT
                - Use jwt hash as resetPassword token
                - Update forgot password route

         */
        const { token, newPassword } = request.body;

        const resetPasswordService = container.resolve(ResetPasswordService);

        const {
            token: clientToken,
            user,
        } = await resetPasswordService.execute({
            newPassword,
            token,
        });

        return response.status(200).json({
            token: clientToken,
            user,
        });
    } catch (error) {
        return next(error);
    }
});

export default routes;
