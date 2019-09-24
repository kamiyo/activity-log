import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const {
    DB_NAME: database,
    DB_USER: username,
    DB_PASS: password,
    DB_HOST: host,
    DB_PORT: port,
    DB_DIALECT: dialect,
} = process.env;

console.log(dialect);

module.exports = {
    development: {
        database,
        username,
        password,
        host,
        port,
        dialect,
    },
    production: {
        database,
        username,
        password,
        host,
        port,
        dialect,
    },
};
