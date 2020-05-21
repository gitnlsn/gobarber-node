import {
    Router,
    Request,
    Response,
    NextFunction,
} from 'express';
import { container } from 'tsyringe';
import identifyBarbershop from '../../middlewares/IdentifyBarbershop';
import AppError from '../../../errors/AppError';
import CrudAppointmentService from '../../../services/appointments/implementations/CrudAppointmentService';

const router = Router();

router.put('/accept/:id', identifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershop: confusedBarbershop,
            user: client,
            params: {
                id: appointmentId,
            },
        } = request;

        const {
            observations,
        } = request.body;

        if (confusedBarbershop) {
            return next(new AppError(
                'Barbershop can not accept an appointment with another barbershop',
            ));
        }

        const crudAppointmentService = container.resolve(CrudAppointmentService);

        const {
            appointment: existingAppointment,
        } = await crudAppointmentService.retrieve({ id: appointmentId });

        if (!existingAppointment) {
            return next(new AppError(`Appointment ${appointmentId} does not exist`));
        }

        if (existingAppointment.client) {
            return next(new AppError(`Appointment ${appointmentId} was already accepted`));
        }

        const { appointment: acceptedAppointment } = await crudAppointmentService.update({
            id: appointmentId,
            client,
            observations,
        });

        return response.status(200).json({ appointment: acceptedAppointment });
    } catch (error) {
        return next(error);
    }
});

router.put('/cancel/:id', identifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershop: confusedBarbershop,
            user: client,
            params: {
                id: appointmentId,
            },
        } = request;

        if (confusedBarbershop) {
            return next(new AppError('Unauthorized. Barbershop cannot cancel an appointment. Please contact the client, as soon as possible.', 401));
        }

        const crudAppointmentService = container.resolve(CrudAppointmentService);

        const {
            appointment: existingAppointment,
        } = await crudAppointmentService.retrieve({ id: appointmentId });

        if (!existingAppointment) {
            return next(new AppError(`Appointment ${appointmentId} does not exist`));
        }

        if (client.id !== existingAppointment.client.id) {
            return next(new AppError('Unauthorized. Appointment is not of its own', 401));
        }

        const { appointment: canceledAppointment } = await crudAppointmentService.update({
            id: appointmentId,
            client: undefined,
            observations: undefined,
        });

        return response.status(200).json({ appointment: canceledAppointment });
    } catch (error) {
        return next(error);
    }
});

export default router;
