const {SubscriberModel,TicketModel,SponsorModel,LoteryModel,WinnerModel} = require('../DataBase/Models/Models');
const {Telegraf} = require('telegraf');
const sequelize = require('../DataBase/Database');





const CheckSubscribing = async (chatId, ctx) =>
{
    let check =true;
    const _sponsors = await SponsorModel.findAll();
    for (let i = 0; i < _sponsors.length; i++)
    {
        try
        {
            const member = await ctx.telegram.getChatMember
            (
                _sponsors[i].chatId,
                `${chatId}`
            );
            console.log(member);
            if (member.status !== "member" 
            && member.status !== "administrator" 
            && member.status !== "creator")
            {
                check =  false;
            } 
        }
        catch
            {
                check = false;
            }
    }
    return check;
}

module.exports = CheckSubscribing;