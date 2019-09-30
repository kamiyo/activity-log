import argon from 'argon2';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import db from './models';
const models = db.models;

const createUser = async (username: string, password: string, role: string = 'read') => {
    try {
        const hash = await argon.hash(password);

        const user = await models.User.create({
            username,
            hash,
            role,
        });

        console.log(`Success! Created ${user.username} with password '${user.hash}' and ${role} permissions.`);
    } catch (err) {
        console.error(err);
    }
}

function main () {
    createUser(process.argv[2], process.argv[3], process.argv[4]);
}

main();