import argon from 'argon2';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import db from './models';
const models = db.models;

const createUser = async (username: string, password: string) => {
    try {
        const hash = await argon.hash(password);

        const user = await models.User.create({
            username,
            hash,
        });

        console.log(`success!\n${user.username}\n${user.hash}`);
    } catch (err) {
        console.error(err);
    }
}

function main () {
    createUser(process.argv[2], process.argv[3]);
}

main();