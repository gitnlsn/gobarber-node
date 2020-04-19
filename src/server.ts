import express from 'express';

import cors from 'cors';
import routes from './routes';
import errorMidleware from './errors/AppErrorMiddleware';

const port = process.env.PORT || 3333;

const app = express();

app.use(express.json());
app.use(cors());
app.use('/user', routes.AuthenticationRoute);
app.use(errorMidleware);

app.listen(port, () => {
    /* eslint-disable-next-line no-console */
    console.log(`Listening at port ${port}`);
});
