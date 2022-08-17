const sequelize = require("../Database");
const DataTypes  = require('sequelize');


const LoteryModel = sequelize.define
('Lotery',
    {
        id : {type: DataTypes.INTEGER, primaryKey:true,unique:true,autoIncrement:true},
        dateStart : {type: DataTypes.DATE},
        dateEnd : {type: DataTypes.DATE}
    },
    {} 
);
module.exports = LoteryModel;