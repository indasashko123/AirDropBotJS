const {Scenes, Markup} = require('telegraf');
const {FindAllUsers} = require("../commands/Subscriber/FindOrCreateUser");
const GetAllSponsors = require("../commands/Sponsor/GetAllSponsors");
const AddSponsor = require("../commands/Sponsor/AddSponsor");
const {FindAllTickets} = require("../commands/Ticket/FindTickets");
const {FindLogsByChatId,FindAllLogs, FindLogById} = require("../commands/Log/FindLogs");



class AdminSceneGenerator
{
    GetAdminScene()
    {
        const admin = new Scenes.BaseScene("admin");
        admin.enter(async (ctx)=>
        {
            try
            {
                await ctx.reply("Привет, админ", StartButton);
            }
            catch(er)
            {
                console.log(er);
                CreateLog(ctx.chat.id,JSON.stringify(ctx),JSON.stringify(er),"Greating reply");
            }
        });


        admin.hears("GetAllSponsors", async(ctx)=>
        {
            const _sponsors = await GetAllSponsors();
            if (_sponsors !== null && _sponsors.length > 0)
            {
                for (let i = 0; i< _sponsors.length; i++)
                {
                    await ctx.reply(
                        `id:  ${_sponsors[i].id}\n`+
                        `chatId:  ${_sponsors[i].chatId}\n`+
                        `link:   ${_sponsors[i].link}\n`+
                        `name:  ${_sponsors[i].name}`);
                }
            }
            else
            {
                await ctx.reply("No sponsors?");
            }
        });
        admin.hears("GetAllUsers", async (ctx)=>
        {
            const _subscribers = await FindAllUsers();
            if (_subscribers === null || _subscribers.length === 0)
            {
                await ctx.reply("no users");
            }
            else
            {
                for (let i = 0; i< _subscribers.length; i++)
                {
                    await ctx.reply(
                      `User - ${_subscribers[i].chatId}\n` +
                      `Passed - ${_subscribers[i].passed}\n` +
                      `Referals - ${_subscribers[i].referals}\n` +
                      `Referal - ${_subscribers[i].referal}\n` +
                      `Tickets - ${_subscribers[i].tickets}\n`);
                }
            }
        });
        admin.hears("GetAllTickets", async ctx =>
        {
            const _tickets = await FindAllTickets();
            if (_tickets === null || _tickets.length === 0)
            {
                await ctx.reply("no tickets");
            }
            else
            {
                for (let i = 0; i< _tickets.length; i++)
                {
                    await ctx.reply(
                        `User - ${_tickets[i].ownerChatId}\n` +
                        `id - ${_tickets[i].id}\n`);
                }
            }
        });
        admin.hears("Рассылка", async (ctx) => 
        {
            let check = await CheckAdmin(ctx.message.chat.id);
            if (check === true)
            {
                await ctx.reply("Сообщение для рассылки ->");       
            }
        });
        admin.on('message', async ctx=>
        {
            try
            {
                let com = ctx.message.text.split("|")[0];
                if (com == "Add")
                {
                    let _link = ctx.message.text.split("|")[1];
                    let _chatId = ctx.message.text.split("|")[2];
                    let _name = ctx.message.text.split("|")[3];
                    await ctx.reply(`${_link}    ${_chatId}     ${_name}`);
                    await AddSponsor(_link,_chatId,_name);
                }
                if (com == "AllLogs")
                {
                    const logs = await FindAllLogs();
                    for (let i = 0; i<logs.length; i++)
                    {
                        await ctx.reply(` chatId - ${logs[i].chatId}\n`+
                            ` method = ${logs[i].method}\n`+
                            ` message - ${logs[i].mesage}\n`+
                            `error - ${logs[i].errorMessage}`);
                    }
                }
                if (com == "LogsChatId")
                {
                    let _chatId = ctx.message.text.split("|")[1];
                    const logs = await FindLogsByChatId(_chatId);
                    for (let i = 0; i<logs.length; i++)
                    {
                        await ctx.reply(` chatId - ${logs[i].chatId}\n`+
                               ` method = ${logs[i].method}\n`+
                               ` message - ${logs[i].mesage}\n`+
                            `error - ${logs[i].errorMessage}`);
                    }
                }
                if (com == "LogId")
                {
                    let _id = ctx.message.text.split("|")[1];
                    const log = await FindLogById(_id);
                    await ctx.reply(` chatId - ${log.chatId}\n`+
                        ` method = ${log.method}\n`+
                        ` message - ${log.mesage}\n`+
                        ` error - ${log.errorMessage}`);
                }
            }
            catch(err)
            {
                console.log(err);
            }
        await ctx.reply("Возможно, вы имели в виду другую команду?", MainBoard );
        });
    }
}

module.exports = AdminSceneGenerator;