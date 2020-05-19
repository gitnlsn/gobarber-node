import {
    Router,
    Request,
    Response,
    NextFunction,
} from 'express';
import { container } from 'tsyringe';
import CrudBarbershopService from '../../services/babershop/implementations/CrudBarbershopService';

const router = Router();

router.get('', async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        const crudBarbershopService = container.resolve(CrudBarbershopService);
        const { barbershopList } = await crudBarbershopService.retrieveAll();
        return response.status(200).json({ barbershopList });
    } catch (error) {
        return next(error);
    }
});

export default router;
