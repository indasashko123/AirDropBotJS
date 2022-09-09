const sequelize = require("../Database");
const DataTypes  = require('sequelize');


const LogModel = sequelize.define
('Log',
    {
        id : {type: DataTypes.INTEGER, primaryKey:true,unique:true,autoIncrement:true},
        date : {type: DataTypes.DATE},
        chatId : {type: DataTypes.STRING},
        message : {type :DataTypes.STRING},
        method : {type: DataTypes.STRING},
        errorMessage : {type: DataTypes.STRING}
    },
    {} 
);
module.exports = LogModel;