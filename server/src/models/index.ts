import * as fs from 'fs';
import * as path from 'path';
import { Sequelize } from 'sequelize';

import sequelize from '../sequelize';
import { Model, ModelMap } from './types';

/**
 * Loops through a list of model files, and transforms them into a map that
 * maps each model name to the corresponding sequelize model.
 */

const importModels = (seq: Sequelize): ModelMap => {
    const modelMap = fs.readdirSync(__dirname).filter((file) => {
        return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
    }).reduce((out, file) => {
        const model = seq.import(path.join(__dirname, file)) as typeof Model;
        out[model.name] = model;
        return out;
    }, {} as ModelMap);

    // execute associations
    Object.keys(modelMap).forEach((modelName) => {
        if (modelMap[modelName].associate) {
            modelMap[modelName].associate(modelMap);
        }
    });

    return modelMap;
};

const db = {
    sequelize,
    // Export the function, in case we ever want to use it with
    // a different DB connection.
    importModels,
    models: importModels(sequelize),
};

export default db;
