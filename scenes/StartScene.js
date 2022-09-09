const {Scenes, Markup} = require('telegraf');
const {CheckButton, GetSponsors, MainBoard, StartButton,GetCaptcha } = require('../Keyboards/UserKeyboards');
const CheckSubscribing = require("../util/CheckSubscribing");
const {GetValues} = require("../util/Capcha");


const CreateTicket = require('../commands/Ticket/CreateTicket');
const {FindOneUser} = require("../commands/Subscriber/FindOrCreateUser");
const PassUser = require("../commands/Subscriber/PassUser");
const AddPassedReferal = require("../commands/Subscriber/AddPassedReferal");
const GetAllSponsors = require("../commands/Sponsor/GetAllSponsors");
const CreateLog = require("../commands/Log/CreateLog");



class StartSceneGenerator 
{
    GetCreetingScene() 
    {
        const greating = new Scenes.BaseScene("greating");
        greating.enter(async (ctx)=>
        {
            try
            {
                await ctx.reply(
                    "Привет, счастливчик👋🏻\n\n "+
                    "Тебе выпал шанс! Забрать денежный приз до 15.000$🤑\n\n"+
                    "Главный приз - 5.000$\n"+
                    "И 999 счастливчиков получат CRYPTOBOX\n"+
                    "От 1 до 5.000$ 🔥 \n\n"+
                    "Просто выполни лёгкое задание, а именно, подпишись на все каналы которые я выдам тебе списком.📋"+
                    "За это задание, ты получишь 1 лотерейный билет 🎟 \n\n "+
                    "Зови всех своих друзей, и за каждого приглашённого получай ещё 1 🎟\n\n"+
                    "Чем больше билетов, тем больше шансов на победу !🗽", StartButton);
            }
            catch(er)
            {
                console.log(er);
                CreateLog(ctx.chat.id,JSON.stringify(ctx),JSON.stringify(er),"Greating reply");
            }

        });
        greating.action("started", async (ctx)=>
        {
            await ctx.scene.enter("sponsorScene");
        });
        greating.on('message', async (ctx)=>
        {
            await ctx.reply("Чтобы продолжить нужно нажать кнопку - \"Принять участие\"");
        });
        return greating;
    }
    GetSponsorScene()
    {
        const sponsorScene = new Scenes.BaseScene("sponsorScene");
        sponsorScene.enter(async ctx=>
            {
                const _sponsors = await GetAllSponsors();
                await ctx.reply(
                "Готов испытать свою удачу ?🤩 Тогда подписывайся на все каналы, перечисленные ниже и нажимай кнопу - Я подписался✅"
                    ,CheckButton);
                await ctx.reply("👇", await GetSponsors(_sponsors)); 
            });
        sponsorScene.hears(CheckButton.reply_markup.keyboard[0][0], async ctx =>
            {
                await ctx.scene.enter("capchaScene");
            });
        sponsorScene.on('message', async (ctx)=>
            {
                await ctx.reply("Чтобы принять участие нужно подписаться на все каналы, нажать кнопку ПРОВЕРКА и пройти капчу");
            });
        return sponsorScene;
    }
    GetCapchaScene()
    {
        const capchaScene = new Scenes.BaseScene("capchaScene");
        capchaScene.enter(async ctx=>
        {
            let capcha = await GetValues();
            await ctx.reply( `Чтобы убедиться что все честно - пройдите капчу\n\n`+
            `Выбирите все кнопки на которых изображжено : \n\n`+
            `                                  ${capcha.Symbols[capcha.answer]}${capcha.Names[capcha.answer]}${capcha.Symbols[capcha.answer]}\n`
            ,await GetCaptcha(capcha));
        });
        capchaScene.on('callback_query', async (ctx)=>
        {
            try
            {
                if (ctx.session.__scenes.state.answer === undefined)
                {
                   ctx.session.__scenes.state.answer = 0;
                }
                let messageId = ctx.update.callback_query.message.message_id;
                let data = ctx.update.callback_query.data;
                if (data.split("/")[0] === "0")
                {
                    await ctx.deleteMessage(messageId);
                    await ctx.scene.reenter();
                    ctx.session.__scenes.state.answer = 0;
                    return;
                }     
                let reply_markup = ctx.update.callback_query.message.reply_markup;
                reply_markup.inline_keyboard[data.split("/")[1]][data.split("/")[2]].text = "👍";
                reply_markup.inline_keyboard[data.split("/")[1]][data.split("/")[2]].callback_data = `0/${data.split("/")[1]}/${data.split("/")[2]}`;
                await ctx.editMessageReplyMarkup(reply_markup);
                ctx.session.__scenes.state.answer += 1;
                if (ctx.session.__scenes.state.answer == 3)
                {
                    await ctx.deleteMessage(messageId);
                    await ctx.scene.enter("passScene");
                }
            }
            catch(e)
            {
                console.log(e);
                CreateLog(ctx.chat.id,JSON.stringify(ctx),JSON.stringify(e), "Capcha callBack");
                ctx.session.__scenes.state.answer = 0;
                let messageId = ctx.update.callback_query.message.message_id;
                try
                {
                    await ctx.deleteMessage(messageId);
                }
                catch(err)
                {
                    console.log(err);
                    CreateLog(ctx.chat.id,JSON.stringify(ctx),JSON.stringify(e), "Capcha callBack delete Message");
                }
                await ctx.scene.reenter();
            }
            
        });
        capchaScene.hears("Новая капча", async (ctx)=>
        {
            ctx.session.__scenes.state.answer = 0;
            await ctx.scene.reenter(); 
        });
        capchaScene.on('message', async (ctx)=>
        {
            ctx.session.__scenes.state.answer = 0;
            await ctx.reply("нужно пройти капчу", Markup.keyboard(["Новая капча"]).resize());
        });
        return capchaScene;
    }
    GetPassScene()
    {
        const passScene = new Scenes.BaseScene("passScene");
        passScene.enter(async ctx=>
        {
            let _chatId = ctx.callbackQuery.message.chat.id;
            let check = await CheckSubscribing(_chatId, ctx);
            if (check === true)
            {
                const _subscriber = await FindOneUser(_chatId);
                await PassUser(_subscriber);
                await CreateTicket(_subscriber.chatId)
                try
                {
                    if (_subscriber.referal !== 0)
                    {
                        const _referal = await AddPassedReferal(_subscriber.referal);
                        await CreateTicket(_referal.chatId);
                    }
                }
                catch(error)
                {
                    console.log(error)
                    CreateLog(ctx.chat.id,JSON.stringify(ctx),JSON.stringify(error), "Pass Add Passed Referal");
                }
                await ctx.reply(
                    "🤑Спасибо за подписку на все каналы!\n"+
                    "💰Ваш баланс пополнен на 1 билет 🎟\n" +
                    "🗣 Поспешите пригласить друзей, тем самым увеличивая свой шанс на победу.\n\n" +
                    "ℹ️Бюджет розыгрыша составляет 15.000$"
                    , MainBoard);
                await ctx.scene.leave();    
                }
                else
                {
                   await ctx.reply("Вы подписались не на все каналы.\n\n"+
                   " Подпишитесь на каналы пройдите капчу");
                   await ctx.scene.enter("sponsorScene");
                } 
        });
        return passScene;
    }
}

module.exports = StartSceneGenerator;


                