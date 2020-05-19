import {
    Router,
    Request,
    Response,
    NextFunction,
} from 'express';
import { container } from 'tsyringe';
import identifyBarbershop from '../middlewares/IdentifyBarbershop';
import AppError from '../../errors/AppError';
import CrudAppointmentService from '../../services/appointments/implementations/CrudAppointmentService';

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

        const { appointment } = await crudAppointmentService.update({
            id: appointmentId,
            client,
            observations,
        });

        return response.status(200).json({ appointment });
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
            return next(new AppError('Barbershop can not cancel an appointment. Please contact the client, as soon as possible.'));
        }

        const crudAppointmentService = container.resolve(CrudAppointmentService);

        const {
            appointment: existingAppointment,
        } = await crudAppointmentService.retrieve({ id: appointmentId });

        if (!existingAppointment) {
            return next(new AppError(`Appointment ${appointmentId} does not exist`));
        }

        if (client.id !== existingAppointment.client.id) {
            return next(new AppError('Client can not cancel an appointment not of its own'));
        }

        const { appointment } = await crudAppointmentService.update({
            id: appointmentId,
            client: undefined,
            observations: undefined,
        });

        return response.status(200).json({ appointment });
    } catch (error) {
        return next(error);
    }
});

export default router;
