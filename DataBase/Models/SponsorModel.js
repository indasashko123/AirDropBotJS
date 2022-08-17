const sequelize = require("../Database");
const DataTypes  = require('sequelize');

const SponsorModel = sequelize.define
('Sponsor',
    {
        id : {type: DataTypes.INTEGER, primaryKey:true,unique:true,autoIncrement:true},
        link : {type : DataTypes.STRING},
        chatId : {type: DataTypes.STRING},
        name : {type:DataTypes.STRING}
    },
    {} 
);

module.exports = SponsorModel;