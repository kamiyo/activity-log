import { DataTypes, Model, Sequelize } from 'sequelize';
import { string } from 'prop-types';

export class User extends Model {
    readonly id: string;
    readonly username: string;
    readonly hash: string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
    User.init({
        id: {
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        username: dataTypes.STRING,
        hash: dataTypes.STRING,
    }, {
        sequelize,
        tableName: 'user',
    });

    return User;
}