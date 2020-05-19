import {
    Router,
    Request,
    Response,
    NextFunction,
} from 'express';
import { container } from 'tsyringe';
import CrudAppointmentService from '../../services/appointments/implementations/CrudAppointmentService';

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
        } = request.params;
        const crudAppoitmentService = container.resolve(CrudAppointmentService);
        const { appointmentList } = await crudAppoitmentService.retrieveAll({
            available: Boolean(available),
            serviceId,
            providerId,
            serviceTypeId,
            period: {
                min: new Date(from),
                max: new Date(to),
            },
        });
        return response.status(200).json({ appointmentList });
    } catch (error) {
        return next(error);
    }
});

export default router;
