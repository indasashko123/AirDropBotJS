const {TicketModel} = require('../../DataBase/Models/Models');
const CreateTicket = (async (_chatId)=>
{
    await TicketModel.create
    ({
        ownerChatId : _chatId
    });
})

module.exports = CreateTicket;