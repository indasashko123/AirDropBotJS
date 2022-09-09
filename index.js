const {Telegraf, Scenes, session} = require('telegraf');
require('dotenv').config();
const sequelize = require('./DataBase/Database');
const {MainBoard} = require('./Keyboards/UserKeyboards');
const {MainAdmin} = require('./Keyboards/AdminKeyboard');
const StartSceneGenerator = require("./scenes/StartScene");
const AdminSceneGenerator = require("./scenes/AdminScene");



// Commands
const {FindOrCreate, FindAllUsers,FindAllUnactiveUsers} = require("./commands/Subscriber/FindOrCreateUser");
const {FindReferal,FindAllReferals} = require("./commands/Subscriber/FindReferal");
const AddReferalCount = require("./commands/Subscriber/AddReferalCount");
const {FindAllTickets, FindUserTicket} = require("./commands/Ticket/FindTickets");



// Scenes
const startScene = new StartSceneGenerator();
const greatingScene = startScene.GetCreetingScene();
const sponsorsScene = startScene.GetSponsorScene();
const capchaScene = startScene.GetCapchaScene();
const passScene = startScene.GetPassScene();

// TODO: admin enter
const adminScene = new AdminSceneGenerator();
const anminGreating = adminScene.GetAdminScene();





// VARIABLES AND CONSTANT
const startDate = new Date(2022, 7, 28);
const bot = new Telegraf(process.env.TOKEN, {polling : false});




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
}
conn();

const stage = new Scenes.Stage([greatingScene,sponsorsScene,capchaScene, passScene]);
bot.use(session());
bot.use(stage.middleware());







bot.start(async (ctx)=>
{
    let _chatId = ctx.update.message.from.id;
    let _referalChatID;
    try
    {
        _referalChatID = ctx.update.message.text.split(' ')[1];
    }
    catch(e)
    {
        console.log(e);
        _referalChatID = 0;
    }
    const Referal = await FindReferal(_referalChatID);
    const CreatedUser = await FindOrCreate(_chatId, Referal.referalChatID);
    if (!CreatedUser.user.passed)
    {
        if (Referal.referalChatID !==0)
        {
           await AddReferalCount(Referal.referer);
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
        const CreatedUser = await FindOrCreate(_chatId, 0);

        if (CreatedUser.user.passed == false)
        {
            ctx.scene.enter("greating");
        }
        else
        {
            next(ctx);
        }
    }
    catch(err)
    {
        CreateLog(ctx.chat.id,JSON.stringify(ctx),JSON.stringify(err), "use findUser");
        try
        {
            let messageId = ctx.update.callback_query.message.message_id;
            await ctx.deleteMessage(messageId);
        }     
        catch(error)
        {
            CreateLog(ctx.chat.id,JSON.stringify(ctx),JSON.stringify(error), "use findUser deleteMessage");
        }
        try
        {
            await ctx.reply("Неизвестная команда");
        }
        catch(er)
        {
            CreateLog(ctx.chat.id,JSON.stringify(ctx),JSON.stringify(er), "use findUser unnownCommand");
        }
    }
})




// Реферальная программа
bot.hears(MainBoard.reply_markup.keyboard[0][1], async ctx =>
    {
        let _chatId = ctx.message.chat.id;
        try
        {
            let _ticketsCount;
            let _currentUser = await FindOrCreate(_chatId, 0);
            const _tickets = await FindUserTicket(_chatId);
            const _userReferals = await FindAllReferals(_chatId);
            if (_tickets === null)
            {
                _ticketsCount = 0;
            }
            else 
            {
                _ticketsCount = _tickets.length;
            }
            await ctx.replyWithPhoto({source : "./img/4.jpg"});
            await ctx.reply
            (
                "ℹ️Получай дополнительные билеты за приглашение активных друзей.\n\n"+
                `Мои билеты - ${_ticketsCount}\n\n`+
                "📌Делись своей пригласительной ссылкой с друзьями и получай дополнительный билет за каждого, кто выполнит обязательное задание.\n\n"+
                `Пригласительная ссылка:\n\n ${process.env.LINK}?start=${_currentUser.chatId} \n\n` +
                `Количество друзей - ${_userReferals.length}`
            ,MainBoard);
        }
        catch(er)
        {
            console.log(er);
            CreateLog(ctx.chat.id,JSON.stringify(ctx),JSON.stringify(er), "Referal Program");
        }
    });

/// Техподдержка
bot.hears(MainBoard.reply_markup.keyboard[3][0], async ctx =>
    {
        await ctx.replyWithPhoto({source : "./img/2.jpg"});
        await ctx.reply("📲Техническая поддержка\n\n\n"+

        "Напишите свой вопрос: @AKR404",MainBoard);
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
            ,MainBoard);
    });
    /// 500$
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
                "– Вовлечённость на каналах",MainBoard);
        });
/// Статиcтика
bot.hears(MainBoard.reply_markup.keyboard[1][0], async ctx =>
    {
        let userCount = await FindAllUsers();
        let ticketCount = await FindAllTickets();
        let activeUsers = await FindAllUnactiveUsers();
        let date = new Date();
        var timeDiff = Math.abs(date.getTime() - startDate.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        await ctx.replyWithPhoto({source : "./img/3.jpg"});
        await ctx.reply(
            "📊Статистика платформы\n\n" +
            `👥Общая аудитория: ${userCount.length} \n\n`+
            `👤Активные пользователи: ${activeUsers.length}\n\n` +
            `🎟Выдано билетов:  ${ticketCount.length}\n\n ` +
            `🗓Дней проекту: ${diffDays}`,MainBoard
            );
    });

/// FAQ
bot.hears(MainBoard.reply_markup.keyboard[2][0], async ctx =>
        {
            await ctx.replyWithPhoto({source : "./img/6.jpg"});
            await ctx.reply("Часто задаваемые вопросы.\n\n"+
            "1 . Когда закончится лотерея ?\n\n"+
            "Ответ:\n"+ 
            "Как только закончится раздача лотерейных билетов, всем придёт уведомление о завершении лотереи\n\n"+
            "2 . Как я узнаю, о том что мой билет был выигрышным ?\n\n"+
            "Ответ:\n"+ 
            "Вам придёт уведомление о выигрыше, если у вас несколько выигрышных билетов, значит придёт несколько уведомлений.\n\n"+      
            "3 . Сколько максимум билетов на одного человека ?\n\n"+
            "Ответ:\n"+ 
            "Количество билетов на одного человека неограниченно. Главное, все билеты должны быть получены только честным путём. (Читайте правила)\n\n"+
            "4 . Если кто-то из участников накрутит себе билетов, что тогда ?\n\n"+
            "Ответ:\n"+ 
            "Администрация всегда следит за активностью участников, если она подозрительная, участник будет заблокирован, а билеты его аннулированы.\n\n"+
            "5 . Как получить много билетов ?\n\n"+
            "Ответ:\n"+ 
            "Зайдите в раздел «Реферальная программа», приглашайте друзей по своей ссылке и получайте за каждого приглашённого дополнительный билет.\n\n"+
            "6 . Если меня заблокируют не справедливо, что делать ?\n\n"+
            "Ответ:\n"+ 
            "Нажмите кнопку «Поддержка» сообщите о своей проблеме, вам обязательно ответят, и попросят предоставить доказательства трафика.\n\n"+
            "7 . Что такое CRYPTOBOX и как его получить ?\n\n"+
            "Ответ:\n"+ 
            "Это коробка с денежным сюрпризом на криптобирже Binance. Получить ее легко, в случае выигрыша, мы предоставим всю инструкцию и поможем получить деньги на карту, для кого это сложно.",MainBoard );
        });







// ADMIN  
/// TODO: Enter Admin
bot.hears(process.env.PASS, async (ctx)=>
{
    await ctx.reply("Hello, admin", await MainAdmin);
});











bot.launch();
process.once("SIGINT", ()=> bot.stop("SIGINT"));
process.once("SIGTERM", ()=> bot.stop("SIGTERM"));


