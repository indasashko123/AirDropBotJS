const {TicketModel} = require('../../DataBase/Models/Models');

const FindAllTickets = (async()=>
{
    let ticketCount = await TicketModel.findAll();
    return ticketCount;
});

const FindUserTicket = (async (_chatId) =>
{
   let tickets = await TicketModel.findAll(
    {
        where : 
        {
            chatId  : _chatId
        }
    });
    return tickets;
});

module.exports = {FindAllTickets, FindUserTicket};