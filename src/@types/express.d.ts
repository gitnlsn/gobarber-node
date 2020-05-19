/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import User from '../database/models/User';
import Barbershop from '../database/models/Barbershop';

declare global {
    namespace Express {
        interface Request {
            clientToken: string;
            user: User;
            barbershop: Barbershop;
        }
    }
}
