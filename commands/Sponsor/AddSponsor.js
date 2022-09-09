const {SponsorModel} = require('../../DataBase/Models/Models');


const AddSponsor = (async (_link,_chatId,_name)=>
{
    await SponsorModel.create
    ({
         link : _link,
         chatId : _chatId, 
         name : _name
    });
});

module.exports = AddSponsor;