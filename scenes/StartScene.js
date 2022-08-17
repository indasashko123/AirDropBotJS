const {Scenes} = require('telegraf');
const {SponsorModel, SubscriberModel, TicketModel} = require('../DataBase/Models/Models');
const {CheckButton, GetSponsors, MainBoard, StartButton } = require('../Keyboards/UserKeyboards');
const CheckSubscribing = require("../util/CheckSubscribing");
const {GetValues} = require("../util/Capcha");




class StartSceneGenerator 
{
    GetCreetingScene() 
    {
        const greating = new Scenes.BaseScene("greating");
        greating.enter(async (ctx)=>
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
        });
        greating.action("started", async (ctx)=>
        {
            await ctx.scene.enter("sponsorScene");
        });
        greating.on('message', async (ctx)=>
        {
            await ctx.reply("Чтобы продолжить нужно нажать кнопку СТАРТ");
        });
        return greating;
    }
    GetSponsorScene()
    {
        const sponsorScene = new Scenes.BaseScene("sponsorScene");
        sponsorScene.enter(async ctx=>
            {
                const _sponsors = await SponsorModel.findAll();
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
        let capchaString;
        capchaScene.enter(async ctx=>
        {
            let capcha = await GetValues();
            await ctx.reply(
                `Чтобы убедиться что все честно - пройдите капчу\n\n`+
                `Напишите в сообщении боту число: \n\n`+
                 `   --- ${capcha}---`);
            capchaString = capcha;
        });
        capchaScene.on('text', async (ctx)=>
        {
            if (ctx.message.text == capchaString)
            {
                const _chatId = ctx.update.message.from.id
                let check = await CheckSubscribing(_chatId, ctx);
                if (check === true)
                {
                    const _subscriber = await SubscriberModel.findOne
                    ({
                        where:
                        {
                            chatId: _chatId
                        }
                    });
                    if (_subscriber.passed === false)
                    {
                        _subscriber.passed = true;
                        _subscriber.tickets ++;
                        await _subscriber.save();
                        await TicketModel.create
                        ({
                            ownerChatId : _subscriber.chatId
                        });
                        try
                        {
                            if (_subscriber.referal != 0)
                            {
                                const _referal = await SubscriberModel.findOne
                                ({
                                    where :
                                    {
                                        chatId : _subscriber.referal
                                    }
                                });
                                _referal.tickets++;
                                await _referal.save();
                                await TicketModel.create
                                ({
                                    ownerChatId : _referal.chatId
                                });
                            }
                        }
                        catch
                        {
        
                        }
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
                   await ctx.answerCbQuery("Вы подписались не на все каналы.\n\n"+
                   " Подпишитесь на каналы пройдите капчу");
                   await ctx.scene.reenter();
                }
            }
            else
            {
                await ctx.reply("Не правильно введено число.\n\n"+
                   "Подпишитесь на каналы пройдите капчу");
                   await ctx.scene.reenter();
            }
        });
        capchaScene.on('message', async (ctx)=>
        {
            await ctx.reply("нужно пройти капчу");
            await ctx.scene.leave();
        });
        return capchaScene;
    }
    
}

module.exports = StartSceneGenerator;

