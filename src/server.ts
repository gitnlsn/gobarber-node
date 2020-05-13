import { createConnection } from 'typeorm';
import { GoBarberServer } from './app';

const port = Number(process.env.PORT) || 3333;

createConnection().then((connection) => {
    GoBarberServer({ typeormConnection: connection }).then((app) => {
        app.listen(port, () => {
            /* eslint-disable-next-line no-console */
            console.log(`Listening at port ${port}`);
        });
    }).catch((error) => {
        console.error(error);
    });
});
