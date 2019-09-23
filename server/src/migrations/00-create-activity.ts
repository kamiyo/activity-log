import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes) => {
    await queryInterface.createTable('activity', {
        id: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        dateTime: dataTypes.DATE,
        type: dataTypes.STRING,
        amount: dataTypes.DECIMAL(10, 2),
        createdAt: dataTypes.DATE,
        updatedAt: dataTypes.DATE,
    });
};

export const down = async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('activity');
};
