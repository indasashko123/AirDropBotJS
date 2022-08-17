const sequelize = require("../Database");
const DataTypes  = require('sequelize');

const TicketModel = sequelize.define
('Ticket',
    {
        id : {type: DataTypes.INTEGER, primaryKey:true,unique:true,autoIncrement:true},
        ownerChatId : {type: DataTypes.STRING}
    },
    {} 
);

module.exports = TicketModel;