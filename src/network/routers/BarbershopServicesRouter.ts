import {
    Router,
    Request,
    Response,
    NextFunction,
} from 'express';
import { container } from 'tsyringe';
import CrudBarberServiceService from '../../services/baberservice/implementations/CrudBarberServiceService';
import CrudServiceTypeService from '../../services/serviceType/implementations/CrudBarbershopService';

import AppError from '../../errors/AppError';
import BarberServiceVisibilityService from '../../services/baberservice/implementations/BarberServiceVisibilityService';
import IdentifyBarbershop from '../middlewares/IdentifyBarbershop';
import CrudBarbershopService from '../../services/babershop/implementations/CrudBarbershopService';
import { RetrieveAllBarberServiceInput } from '../../services/baberservice/interfaces/CrudBarberService';

const router = Router();

/*
    Depends on identifyBarbershop middleware
 */
router.post('/', IdentifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            service: {
                price, /* required */
                type: {
                    id: serviceTypeId, /* required */
                    /* ignore remaining props */
                },
                provider: {
                    id: barbershopId,
                },
                description,
                logo,
            },
        } = request.body;

        const { barbershop } = request;

        if (barbershopId !== barbershop.id) {
            return next(new AppError('Unauthorized', 401));
        }

        if (!price || !serviceTypeId) {
            return next(new AppError('Missing attributes for new service'));
        }

        const crudBarberServiceService = container.resolve(CrudBarberServiceService);
        const crudServiceTypeService = container.resolve(CrudServiceTypeService);

        const { serviceType } = await crudServiceTypeService.retrieve({
            id: serviceTypeId,
        });

        if (!serviceType) {
            return next(new AppError(`Provided ServiceType ${serviceTypeId} does not exist`));
        }

        const { service } = await crudBarberServiceService.create({
            provider: barbershop,
            price,
            type: serviceType,
            description,
            logo,
        });

        return response.status(200).json({ service });
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const { id } = request.params;

        const crudBarberServiceService = container.resolve(CrudBarberServiceService);

        const { service } = await crudBarberServiceService.retrieve({ id });

        return response.status(200).json({ service });
    } catch (error) {
        return next(error);
    }
});

router.get('/', async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershopId,
            serviceTypeId,
        } = request.params;

        const crudBarbershopService = container.resolve(CrudBarbershopService);
        const crudBarberServiceService = container.resolve(CrudBarberServiceService);
        const crudServiceTypeService = container.resolve(CrudServiceTypeService);

        const retrieveOptions = {} as RetrieveAllBarberServiceInput;

        if (barbershopId) {
            const { barbershop } = await crudBarbershopService.retrieve({
                id: barbershopId,
            });

            if (!barbershop) {
                return next(new AppError(`Provided barbershop ${barbershopId} does not exist`));
            }
            retrieveOptions.provider = barbershop;
        }

        if (serviceTypeId) {
            const { serviceType } = await crudServiceTypeService.retrieve({
                id: serviceTypeId,
            });

            if (!serviceType) {
                return next(new AppError(`Provided ServiceType ${serviceTypeId} does not exist`));
            }
            retrieveOptions.type = serviceType;
        }

        const { serviceList } = await crudBarberServiceService.retrieveAll(retrieveOptions);
        return response.status(200).json({ serviceList });
    } catch (error) {
        return next(error);
    }
});

router.put('/enable/:id', IdentifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershop,
            params: {
                id: serviceId,
            },
        } = request;

        if (serviceId !== barbershop.id) {
            return next(new AppError('Unauthorized', 401));
        }

        const serviceVisibilityService = container.resolve(BarberServiceVisibilityService);

        const { service: updatedService } = await serviceVisibilityService.enable({
            id: serviceId,
        });

        return response.status(200).json({ service: updatedService });
    } catch (error) {
        return next(error);
    }
});

router.put('/disable/:id', IdentifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershop,
            params: {
                id: serviceId,
            },
        } = request;

        if (serviceId !== barbershop.id) {
            return next(new AppError('Unauthorized', 401));
        }

        const serviceVisibilityService = container.resolve(BarberServiceVisibilityService);

        const { service: updatedService } = await serviceVisibilityService.disable({
            id: serviceId,
        });

        return response.status(200).json({ service: updatedService });
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', IdentifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershop,
            params: {
                id: serviceId,
            },
        } = request;

        if (serviceId !== barbershop.id) {
            return next(new AppError('Unauthorized', 401));
        }

        const {
            service: {
                price: newPrice,
                type: {
                    id: newServiceTypeId,
                },
                description: newDescription,
                logo: newLogo,
            },
        } = request.body;

        if (!newPrice && !newServiceTypeId && !newDescription && !newLogo) {
            return next(new AppError('Missing update fields.'));
        }

        const crudBarberServiceService = container.resolve(CrudBarberServiceService);
        const crudServiceTypeService = container.resolve(CrudServiceTypeService);

        const { service: currentService } = await crudBarberServiceService.retrieve({
            id: serviceId,
        });

        if (!currentService) {
            return next(new AppError(`Service ${serviceId} does not exist`));
        }

        /* Compose new service to update */
        const newService = { ...currentService };
        if (newDescription) newService.description = newDescription;
        if (newPrice) newService.price = newPrice;
        if (newLogo) newService.logoUrl = newLogo;
        if (newServiceTypeId) {
            const { serviceType: newServiceType } = await crudServiceTypeService.retrieve({
                id: newServiceTypeId,
            });
            if (!newServiceType) {
                return next(new AppError(`ServiceType ${newServiceTypeId} does not exist`));
            }
            newService.type = newServiceType;
        }

        const { service: updatedService } = await crudBarberServiceService.update({
            id: serviceId,
            ...newService,
        });

        return response.status(200).json({ service: updatedService });
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', IdentifyBarbershop, async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const {
            barbershop,
            params: {
                id: serviceId,
            },
        } = request;

        if (serviceId !== barbershop.id) {
            return next(new AppError('Unauthorized', 401));
        }

        const crudBarberServiceService = container.resolve(CrudBarberServiceService);

        const { service: deletedService } = await crudBarberServiceService.delete({
            id: serviceId,
        });

        return response.status(200).json({ service: deletedService });
    } catch (error) {
        return next(error);
    }
});

export default router;
