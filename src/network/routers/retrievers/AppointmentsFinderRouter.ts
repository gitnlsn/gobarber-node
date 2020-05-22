import {
    Router,
    Request,
    Response,
    NextFunction,
} from 'express';
import { container } from 'tsyringe';
import CrudAppointmentService from '../../../services/appointments/implementations/CrudAppointmentService';
import { RetrieveAllAppointmentInput } from '../../../services/appointments/interfaces/RetrieveAppointment';
import CrudBarberServiceService from '../../../services/baberservice/implementations/CrudBarberServiceService';
import CrudBarbershopService from '../../../services/babershop/implementations/CrudBarbershopService';
import CrudServiceTypeService from '../../../services/barberServiceType/implementations/CrudBarbershopService';
import AppError from '../../../errors/AppError';

const router = Router();

router.get('/', async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            available,
            serviceId,
            providerId,
            serviceTypeId,
            from,
            to,
        } = request.query;

        const crudAppoitmentService = container.resolve(CrudAppointmentService);
        const crudBarberServiceService = container.resolve(CrudBarberServiceService);
        const crudBarbershopService = container.resolve(CrudBarbershopService);
        const crudServiceTypeService = container.resolve(CrudServiceTypeService);

        /* Parsing params */
        const args = {} as RetrieveAllAppointmentInput;
        if (available === 'true') {
            args.available = true;
        } else if (available === 'false') {
            args.available = false;
        }
        if (Date.parse(from as string) && Date.parse(to as string)) {
            args.period = {
                min: new Date(from as string),
                max: new Date(to as string),
            };
        }

        if (typeof serviceId === 'string') {
            /* check if service exist and include in list */
            const {
                service: existingService,
            } = await crudBarberServiceService.retrieve({ id: serviceId });

            if (!existingService) {
                return next(new AppError(`Service ${serviceId} does not exist`));
            }

            args.serviceList = [existingService];
        } else if (typeof providerId === 'string' && typeof serviceTypeId === 'string') {
            /* check if provider and serviceType exist */
            const {
                barbershop: existingProvider,
            } = await crudBarbershopService.retrieve({ id: providerId });

            const {
                serviceType: existingServiceType,
            } = await crudServiceTypeService.retrieve({ id: serviceTypeId });

            if (!existingProvider) {
                return next(new AppError(`Barbershop ${serviceId} does not exist'`));
            }

            if (!existingServiceType) {
                return next(new AppError(`ServiceType ${serviceId} does not exist'`));
            }

            /* find services matching provider and serviceType and include in list */
            const {
                serviceList: existingServiceList,
            } = await crudBarberServiceService.retrieveAll({
                provider: existingProvider,
                type: existingServiceType,
            });

            args.serviceList = existingServiceList;
        } else if (typeof providerId === 'string') {
            /* check if provider exist */
            const {
                barbershop: existingProvider,
            } = await crudBarbershopService.retrieve({ id: providerId });

            if (!existingProvider) {
                return next(new AppError(`Barbershop ${serviceId} does not exist'`));
            }

            /* find services matching provider and include in list */
            const {
                serviceList: existingServiceList,
            } = await crudBarberServiceService.retrieveAll({
                provider: existingProvider,
            });

            args.serviceList = existingServiceList;
        } else if (typeof serviceTypeId === 'string') {
            /* check if serviceType exist */
            const {
                serviceType: existingServiceType,
            } = await crudServiceTypeService.retrieve({ id: serviceTypeId });

            if (!existingServiceType) {
                return next(new AppError(`ServiceType ${serviceId} does not exist'`));
            }

            /* find services matching provider and include in list */
            const {
                serviceList: existingServiceList,
            } = await crudBarberServiceService.retrieveAll({
                type: existingServiceType,
            });

            args.serviceList = existingServiceList;
        }

        const { appointmentList: retrievedList } = await crudAppoitmentService.retrieveAll(args);
        return response.status(200).json({ appointmentList: retrievedList });
    } catch (error) {
        return next(error);
    }
});

export default router;
