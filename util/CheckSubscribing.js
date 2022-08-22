const {SponsorModel} = require('../DataBase/Models/Models');
const {Telegraf} = require('telegraf');
const sequelize = require('../DataBase/Database');





const CheckSubscribing = async (chatId, ctx) =>
{
    const _sponsors = await SponsorModel.findAll();
    for (let i = 0; i < _sponsors.length; i++)
    {
        let isBotAdmin = await IsAdmin(ctx, _sponsors[i].chatId);
        if (isBotAdmin === true)
        {
            try
            {             
                const member = await ctx.telegram.getChatMember
                (
                    _sponsors[i].chatId,
                    `${chatId}`
                );
                if (member.status !== "member"  
                && member.status !== "administrator" 
                && member.status !== "creator")
                {
                    return false;
                } 
            } 
            catch
            {
                return false;
            }
        }
    }
    return true;
}

const IsAdmin = async (ctx, _chatId) =>
{
    
    try
    {
        await ctx.telegram.getChatAdministrators(_chatId);
        return true;
    }
    catch
    {
        return false;
    }
};



module.exports = CheckSubscribing;