const {Sequelize, DataTypes} = require('sequelize');
module.exports = new Sequelize(
    'testdb',
    'root',
    'root',
    {
        host:'localhost',
        posr:'3306',
        dialect: "mysql"
    }
)
