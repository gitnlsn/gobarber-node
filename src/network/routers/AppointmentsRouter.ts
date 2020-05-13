import {
    Router,
    Request,
    Response,
    NextFunction,
} from 'express';
import { container } from 'tsyringe';
import identifyBarbershop from '../middlewares/IdentifyBarbershop';
import AppError from '../../errors/AppError';
import CrudBarberServiceService from '../../services/baberservice/implementations/CrudBarberServiceService';
import CrudAppointmentService from '../../services/appointments/implementations/CrudAppointmentService';
import AppointmentsVisibilityService from '../../services/appointments/implementations/AppointmentVisibilityService';

const router = Router();

router.post('/', identifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            appointment: {
                title,
                service: { id: serviceId },
                startsAt,
                endsAt,
            },
        } = request.body;

        const {
            barbershop,
        } = request;

        const crudBarberServiceService = container.resolve(CrudBarberServiceService);
        const crudAppointmentService = container.resolve(CrudAppointmentService);

        const { service } = await crudBarberServiceService.retrieve({ id: serviceId });

        if (!service) {
            return next(new AppError(`Service ${serviceId} does not exist`));
        }

        if (service.provider.id !== barbershop.id) {
            return next(new AppError('Unauthorized', 401));
        }

        const { appointment } = await crudAppointmentService.create({
            service,
            title,
            startsAt,
            endsAt,
        });

        return response.status(200).json({ appointment });
    } catch (error) {
        return next(error);
    }
});

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

router.put('/enable/:id', identifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershop: owner,
            params: {
                id: appointmentId,
            },
        } = request;

        if (!owner) {
            return next(new AppError(
                'Only barbershops may enable appointments',
            ));
        }

        const crudAppointmentService = container.resolve(CrudAppointmentService);
        const appointmentVisibilityService = container.resolve(AppointmentsVisibilityService);
        const crudBarberServiceService = container.resolve(CrudBarberServiceService);

        const {
            appointment: existingAppointment,
        } = await crudAppointmentService.retrieve({ id: appointmentId });

        if (!existingAppointment) {
            return next(new AppError(`Appointment ${appointmentId} does not exist`));
        }

        const { service } = await crudBarberServiceService.retrieve({
            id: existingAppointment.service.id,
        });

        if (!service) {
            return next(new Error('Service was supposed to exist. An appointment exists without a defined service.'));
        }

        if (service.provider.id !== owner.id) {
            return next(new AppError('Barbershop is not allowed to enable not of its own'));
        }

        const {
            appointment: enabledAppointment,
        } = await appointmentVisibilityService.enable({ id: appointmentId });

        return response.status(200).json({ appointment: enabledAppointment });
    } catch (error) {
        return next(error);
    }
});

router.put('/disable/:id', identifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershop: owner,
            params: {
                id: appointmentId,
            },
        } = request;

        if (!owner) {
            return next(new AppError(
                'Only barbershops may disable appointments',
            ));
        }

        const crudAppointmentService = container.resolve(CrudAppointmentService);
        const appointmentVisibilityService = container.resolve(AppointmentsVisibilityService);
        const crudBarberServiceService = container.resolve(CrudBarberServiceService);

        const {
            appointment: existingAppointment,
        } = await crudAppointmentService.retrieve({ id: appointmentId });

        if (!existingAppointment) {
            return next(new AppError(`Appointment ${appointmentId} does not exist`));
        }

        const { service } = await crudBarberServiceService.retrieve({
            id: existingAppointment.service.id,
        });

        if (!service) {
            return next(new Error('Service was supposed to exist. An appointment exists without a defined service.'));
        }

        if (service.provider.id !== owner.id) {
            return next(new AppError('Barbershop is not allowed to disable an appointment not of its own'));
        }

        const {
            appointment: enabledAppointment,
        } = await appointmentVisibilityService.disable({ id: appointmentId });

        return response.status(200).json({ appointment: enabledAppointment });
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', identifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershop: owner,
            params: {
                id: appointmentId,
            },
        } = request;

        const {
            title,
            startsAt,
            endsAt,
            observations,
        } = request.body;

        if (!owner) {
            return next(new AppError(
                'Only barbershops may update appointments',
            ));
        }

        const crudAppointmentService = container.resolve(CrudAppointmentService);
        const crudBarberServiceService = container.resolve(CrudBarberServiceService);

        const {
            appointment: existingAppointment,
        } = await crudAppointmentService.retrieve({ id: appointmentId });

        if (!existingAppointment) {
            return next(new AppError(`Appointment ${appointmentId} does not exist`));
        }

        const { service } = await crudBarberServiceService.retrieve({
            id: existingAppointment.service.id,
        });

        if (!service) {
            return next(new Error('Service was supposed to exist. An appointment exists without a defined service.'));
        }

        if (service.provider.id !== owner.id) {
            return next(new AppError('Barbershop is not allowed to update an appointment not of its own'));
        }

        const {
            appointment: updatedAppointment,
        } = await crudAppointmentService.update({
            id: appointmentId,
            title,
            startsAt,
            endsAt,
            observations,
        });

        return response.status(200).json({ appointment: updatedAppointment });
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', identifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershop: owner,
            params: {
                id: appointmentId,
            },
        } = request;

        if (!owner) {
            return next(new AppError(
                'Only barbershops may delete appointments',
            ));
        }

        const crudAppointmentService = container.resolve(CrudAppointmentService);
        const crudBarberServiceService = container.resolve(CrudBarberServiceService);

        const {
            appointment: existingAppointment,
        } = await crudAppointmentService.retrieve({ id: appointmentId });

        if (!existingAppointment) {
            return next(new AppError(`Appointment ${appointmentId} does not exist`));
        }

        const { service } = await crudBarberServiceService.retrieve({
            id: existingAppointment.service.id,
        });

        if (!service) {
            return next(new Error('Service was supposed to exist. An appointment exists without a defined service.'));
        }

        if (service.provider.id !== owner.id) {
            return next(new AppError('Barbershop is not allowed to delete an appointment not of its own'));
        }

        const {
            appointment: deletedAppointment,
        } = await crudAppointmentService.delete({ id: appointmentId });

        return response.status(200).json({ appointment: deletedAppointment });
    } catch (error) {
        return next(error);
    }
});

export default router;
