import { randomBytes } from 'crypto';


export const getJwtSignKey: () => string = () => randomBytes(512).toString('base64');

export default {
    getJwtSignKey,
};
