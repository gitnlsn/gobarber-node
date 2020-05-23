import { Request, Response, NextFunction } from 'express';

function redirectHttps(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const schema = (req.headers['x-forwarded-proto'] as string || '').toLowerCase();
    const hostHeader = req.headers.host;
    if (hostHeader && hostHeader.indexOf('localhost') < 0 && schema !== 'https') {
        res.redirect(`https://${req.headers.host}${req.url}`);
    } else {
        next();
    }
}

export default redirectHttps;
