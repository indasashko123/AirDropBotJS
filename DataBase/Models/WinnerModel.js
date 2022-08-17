const sequelize = require("../Database");
const DataTypes  = require('sequelize');




const WinnerModel = sequelize.define
('Winner',
    {
        id : {type: DataTypes.INTEGER, primaryKey:true,unique:true,autoIncrement:true},
        chatId : {type: DataTypes.STRING},
        loteryId : {type : DataTypes.INTEGER}
    },
    {} 
);



module.exports = WinnerModel;