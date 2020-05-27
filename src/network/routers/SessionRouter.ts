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
import MailjetService from '../../services/external/email/MailjetService';

const routes = Router();

routes.post('/register', async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            name,
            email,
            password,
        } = request.body;

        const service = container.resolve(RegisterUserService);

        const { user, token } = await service.execute({
            name,
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
        const jet = container.resolve(MailjetService);
        const emailSender = container.resolve<string>('MAILJET_SENDER_EMAIL');
        const appDomainName = container.resolve<string>('APPLICATION_DOMAIN_NAME');

        const {
            token: resetPasswordToken,
            user,
        } = await forgotService.execute({ email });

        const link = `https://${appDomainName}/reset-password?token=${resetPasswordToken}`;
        jet.sendMail({
            from: {
                email: emailSender,
                name: 'Reset Password',
            },
            to: {
                email: user.email,
                name: user.name,
            },
            subject: 'Password Reset Link',
            message: {
                text: link,
                html: `<a href="${link}">${link}</a>`,
            },
        }).then((mailResponse) => {
            console.log(
                'Email was sent successfully',
                (mailResponse.data as any).Messages[0].To[0],
            );
        }).catch((err) => {
            console.error(err);
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
