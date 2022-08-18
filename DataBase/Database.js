const {Sequelize, DataTypes} = require('sequelize');
module.exports = new Sequelize(
    'tgbot',
    'root',
    '97EPVOy0gdug',
    {
        host:'localhost',
        posr:'3306',
        dialect: "mysql"
    }
)
