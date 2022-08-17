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
                link : "https://t.me/zxcvvcxzxxx",
                chatId : "-1001577784145",
                name : " @zxcvvcxzxxx"
            });
        }
    }
    catch(err)
    {
        console.log(err);
    }
}
conn();

const stage = new Scenes.Stage([greatingScene,sponsorsScene,capchaScene]);
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

bot.use(async (ctx, next)=>{
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
                "ℹ️Зарабатывайте билеты на приглашении активных рефералов.\n\n"+
                `Заработанно билетов - ${_currentUser.tickets}\n\n`+
                "📌Чтобы получить дополнительные билеты делитесь своей партнерской ссылкой со своими друзьями.\n\n"+
                `▶️Партнерская ссылка:\n\n ${process.env.LINK}?start=${_currentUser.chatId} \n\n` +
                `Количество рефералов - ${_currentUser.referals}`
            );
        }
         catch
         {
            
         }
    });

/// Техподдержка
bot.hears(MainBoard.reply_markup.keyboard[1][0], async ctx =>
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

/// Статичтика
bot.hears(MainBoard.reply_markup.keyboard[1][1], async ctx =>
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
            await ctx.reply(`id - ${_sponsors[i].id}`);
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



bot.on('message', async ctx=>{
   await ctx.reply("Возможно, вы имели в виду другую команду?");
});












bot.launch();
process.once("SIGINT", ()=> bot.stop("SIGINT"));
process.once("SIGTERM", ()=> bot.stop("SIGTERM"));


