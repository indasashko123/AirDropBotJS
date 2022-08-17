const sequelize = require("../Database");
const DataTypes  = require('sequelize');


const SubscriberModel = sequelize.define
('Subscriber',
    {
        chatId : {type: DataTypes.STRING},
        passed : {type : DataTypes.BOOLEAN},
        referals : {type : DataTypes.INTEGER},
        referal : {type : DataTypes.INTEGER},
        tickets : {type : DataTypes.INTEGER}
    },
    {} 
);

module.exports = SubscriberModel;