const {SubscriberModel,TicketModel,SponsorModel,LoteryModel,WinnerModel} = require('../DataBase/Models/Models');
const {Telegraf} = require('telegraf');
const sequelize = require('../DataBase/Database');





const CheckSubscribing = async (chatId, ctx) =>
{
    let check = true;
    const _sponsors = await SponsorModel.findAll();
    for (let i = 0; i < _sponsors.length; i++)
    {
        try
        {           
            let adminAnswer = !IsAdmin(ctx, _sponsors[i].chatId);
            if (adminAnswer === false)
            {
                continue;
            }
            const member = await ctx.telegram.getChatMember
            (
                _sponsors[i].chatId,
                `${chatId}`
            );
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

const IsAdmin = async (ctx, _chatId) =>
{
    let botId = ctx.botInfo.id;
    let isAdminBot = true;
    try
    {
        let adm = await ctx.telegram.getChatAdministrators(_chatId);
    }
    catch
    {
        isAdminBot = false;
    }
    return isAdminBot;
};



module.exports = CheckSubscribing;