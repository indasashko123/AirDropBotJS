const {Telegraf, Scenes, session} = require('telegraf');
require('dotenv').config();
const sequelize = require('./DataBase/Database');
const {SubscriberModel,TicketModel,SponsorModel,LoteryModel,WinnerModel} = require('./DataBase/Models/Models');
const {MainBoard, StartButton } = require('./Keyboards/UserKeyboards');
const {MainAdmin} = require('./Keyboards/AdminKeyboard');
const StartSceneGenerator = require("./scenes/StartScene");



// Scenes
const startScene = new StartSceneGenerator();
const greatingScene = startScene.GetCreetingScene();
const sponsorsScene = startScene.GetSponsorScene();
const capchaScene = startScene.GetCapchaScene();
const passScene = startScene.GetPassScene();


// VARIABLES AND CONSTANT
const startDate = new Date(2022, 7, 14);
const bot = new Telegraf(process.env.TOKEN, {polling : true});




// db coonection
const conn = async() =>
{
    try
    {
        await sequelize.authenticate();
        await sequelize.sync();
    }
    catch (e)
    {
        console.log("ne podkluchilos", e);
    }
    try 
    {
        let sponsors = await SponsorModel.findAll();
        if (sponsors === null || sponsors.length === 0)
        {
            await SponsorModel.create(
            {
                link : "https://t.me/rs_luckytrader",
                chatId : "-1001452861940",
                name : "LackyTrader - трейдинг, деньги, инвестиции"
            });
        }
    }
    catch(err)
    {
        console.log(err);
    }
}
conn();

const stage = new Scenes.Stage([greatingScene,sponsorsScene,capchaScene, passScene]);
bot.use(session());
bot.use(stage.middleware());







bot.start(async (ctx)=>
{
    let _chatId = ctx.update.message.from.id;
    let referalChatID;
    let _referer;
    try 
    {
        referalChatID = ctx.update.message.text.split(' ')[1];
        _referer = await SubscriberModel.findOne(
            {
                where:
                {
                    chatId: referalChatID
                }
            });
            if (_referer === null)
            {
                referalChatID = 0;
            }
    }
    catch
    {
        referalChatID = 0;
    }
    const [_user, _created] = await SubscriberModel.findOrCreate
    ({
        where:
        {
            chatId: _chatId
        },
        defaults:
        {
            chatId: _chatId,
            passed : false,
            referals : 0,
            referal : referalChatID,
            tickets : 0
        }
    });
    if (_created)
    {
        if (referalChatID !==0)
        {
            _referer.referals++;
            await _referer.save();
        }
        ctx.scene.enter("greating");
    }
    else
    {
        await ctx.reply("🗣 Поспешите пригласить друзей, тем самым увеличивая свой шанс на победу.\n\n" +
            "ℹ️Бюджет розыгрыша составляет 15.000$"
            , MainBoard);
    }
});

bot.use(async (ctx, next)=>
{
    try
    {
        const _chatId = ctx.message.chat.id;
        const [_currentUser, created] = await SubscriberModel.findOrCreate
                ({
                    where:
                    {
                        chatId: _chatId
            },
            defaults:
                                {
                chatId: _chatId,
                passed : false,
                referals : 0,
                referal : 0,
                tickets : 0
                                }
                            });
        if (_currentUser.passed == false)
        {
            ctx.scene.enter("greating");
        }
        else
        {
            next(ctx);
        }
    }
    catch
    {
        try
        {
            let messageId = ctx.update.callback_query.message.message_id;
            await ctx.deleteMessage(messageId);
        }     
        catch
        {
            
        }
        try
        {
            await ctx.reply("Неизвестная команда");
        }
        catch
        {
            
        }
    }
})


// Реферальная программа
bot.hears(MainBoard.reply_markup.keyboard[0][1], async ctx =>
    {
        try
        {
            let _chatId = ctx.message.chat.id;
            let _currentUser = await SubscriberModel.findOne
            ({
                where :
                {
                    chatId : _chatId
                }
            });
            await ctx.replyWithPhoto({source : "./img/4.jpg"});
            await ctx.reply
            (
                "ℹ️Получай дополнительные билеты за приглашение активных друзей.\n\n"+
                `Мои билеты - ${_currentUser.tickets}\n\n`+
                "📌Делись своей пригласительной ссылкой с друзьями и получай дополнительный билет за каждого, кто выполнит обязательное задание.\n\n"+
                `Пригласительная ссылка:\n\n ${process.env.LINK}?start=${_currentUser.chatId} \n\n` +
                `Количество друзей - ${_currentUser.referals}`
            );
        }
         catch
         {

         }
    });

/// Техподдержка
bot.hears(MainBoard.reply_markup.keyboard[2][0], async ctx =>
    {
        await ctx.replyWithPhoto({source : "./img/2.jpg"});
        await ctx.reply("📲Техническая поддержка\n\n\n"+

        "Напишите свой вопрос: @AKR404");
    });

/// Правила
bot.hears(MainBoard.reply_markup.keyboard[0][0], async ctx =>
    {
        await ctx.replyWithPhoto({source : "./img/1.jpg"});
        await ctx.reply(
            "1 . Запрещается использовать любые  методы накруток, а так же: биржи, регистрация фэйковых аккаунтов, сервисы, боты и так далее.\n\n"+
            "2 . Допускается использование рекламы в публичных социальных сетях, телеграмм каналах и других площадках, на которых можно проверить факт на наличие публикации, по запросу администрации.\n\n"+
            "3 . Один человек, может участвовать в розыгрыше только с одного аккаунта, в случае обмана, администрация имеет право заблокировать участника и не выдавать ему приз.\n\n"+
            "4 . За выполнение обязательного задания, участник получает 1 номерной билет, который даёт ему возможность выйграть денежный приз от 1 до 15000$.\n\n"+
            "5 . За выполнение дополнительного задания или приглашение друзей, участник получает 1 номерной билет, за каждого приглашённого друга по своей ссылке, это означает, что у вас может быть сразу несколько выигрышных билетов, соотвественно и больше призов"
            );
    });
bot.hears(MainBoard.reply_markup.keyboard[1][1], async ctx =>
        {
            await ctx.replyWithPhoto({source: "./img/5.jpg"});
            await ctx.reply("Хочешь получить до 500$?\n\n"+ 
                "Просто проявляй активность на каналах наших спонсоров, пиши комментарии под постами, ставь реакции, общайся в чатах, короче будь активным и позитивным😉\n\n"+    
                "В течении всего розыгрыша, случайным образом мы будем выбирать самых активных и позитивных и дарить им  CRYPTOBOX с суммой до 500$💥\n\n"+
                "⚡️Требования:\n"+
                "– Комментарии должны быть аргументированными и по теме постов.\n"+
                "–Общаться в чатах без негатива и оскорблений.\n"+
                "–Проявлять активность у всех спонсоров.\n"+
                "–Не выключать уведомления.\n\n"+
                "💰От чего зависит бонус:\n"+
                "– Активность\n"+
                "– Позитив\n"+
                "– Вовлечённость на каналах");
        });
/// Статиcтика
bot.hears(MainBoard.reply_markup.keyboard[1][0], async ctx =>
    {
        let userCount = await SubscriberModel.findAll();
        let ticketCount = await TicketModel.findAll();
        let activeUsers = await SubscriberModel.findAll
        ({
           where :
           {
              passed : true
           }
        });
        let date = new Date();
        var timeDiff = Math.abs(date.getTime() - startDate.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        await ctx.replyWithPhoto({source : "./img/3.jpg"});
        await ctx.reply(
            "📊Статистика платформы\n\n" +
            `👥Общая аудитория: ${userCount.length} \n\n`+
            `👤Активные пользователи: ${activeUsers.length}\n\n` +
            `🎟Выдано билетов:  ${ticketCount.length}\n\n ` +
            `🗓Дней проекту: ${diffDays}`
            );
    });









// ADMIN
bot.hears(process.env.PASS, async (ctx)=>
{
    await ctx.reply("Hello, admin", await MainAdmin);
});
bot.hears("GetAllSponsors", async(ctx)=>
{
    const _sponsors = await SponsorModel.findAll();
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
bot.hears("GetAllUsers", async (ctx)=>
{
    const _subscribers = await SubscriberModel.findAll();
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
                `Tickets - ${_subscribers[i].tickets}\n`
                );
        }
    }
});
bot.hears("GetAllTickets", async ctx =>
{
    const _tickets = await TicketModel.findAll();
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
                `id - ${_tickets[i].id}\n`
                );
        }
    }
});
bot.hears("Рассылка", async (ctx) => 
{
    let check = await CheckAdmin(ctx.message.chat.id);
    if (check === true)
    {
        await ctx.reply("Сообщение для рассылки ->");       
    }
});


bot.on('message', async ctx=>
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
          await SponsorModel.create
          ({
               link : _link,
               chatId : _chatId, 
               name : _name
          });
       }
       if (com == "Del")
       {
          let _id = ctx.message.text.split("|")[1];
           
       }
   }
   catch(err)
   {
       console.log(err);
   }
   await ctx.reply("Возможно, вы имели в виду другую команду?");
});











async function CheckAdmin(chatId)
{
    for (let i = 0; i< adminChatId.length; i++)
    {
        if (adminChatId[i] == chatId)
        {
            return true;
        }
    }
    return false;
}

bot.launch();
process.once("SIGINT", ()=> bot.stop("SIGINT"));
process.once("SIGTERM", ()=> bot.stop("SIGTERM"));


