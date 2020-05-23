import dotenv from 'dotenv';
import { ConnectionOptions } from 'typeorm';
import migrations from './migrations';
import entities from './models';

dotenv.config();

const config = {
    name: 'postgres',
    type: 'postgres',
    host: process.env.POSTGRES_HOST as string | 'localhost',
    port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
    username: process.env.POSTGRES_USERNAME as string | 'postgres',
    password: process.env.POSTGRES_PASSWORD as string | 'postgres',
    database: process.env.POSTGRES_DATABASE_NAME as string | 'gobarber',
    entities,
    migrations,
} as ConnectionOptions;

export default {
    migrations,
    entities,
    config,
};
