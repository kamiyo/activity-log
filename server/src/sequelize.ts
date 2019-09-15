import * as dotenv from 'dotenv';
import { Sequelize, Dialect } from 'sequelize';

dotenv.config();

const {
    DB_NAME: database,
    DB_USER: username,
    DB_PASS: password,
    DB_HOST: host,
    DB_PORT: port,
    DB_DIALECT: dialect,
} = process.env;

export default new Sequelize(
    database,
    username,
    password,
    {
        host,
        port: parseInt(port),
        dialect: dialect as Dialect,
        dialectOptions: {
            charSet: 'utf8',
            collate: 'utf8_unicode_ci',
        },
        pool: {max: 5, min: 0, idle: 10000},
        define: {
            freezeTableName: true,
            underscored: true,
        },
        logging: (str: string) => console.log(str)
    }
);
