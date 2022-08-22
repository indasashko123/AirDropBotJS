const { Telegraf, Markup } = require('telegraf');



const MainBoard = Markup.keyboard
(
    [
        ["❗️Правила",'👥Реферальная программа'],
        [ "📊Статистика", "🔥Получить до 500$"],
        ["🗨️Часто задаваемые вопросы"],
        ['🧑‍💻Техподдержка']
    ]
).resize();

const GetSponsors = (async(sponsors)=>
{ 
    let markup = [];
    for (let i=0; i<sponsors.length; i++)
    {
        markup[i] = [];
        markup[i][0] = Markup.button.url(sponsors[i].name, sponsors[i].link);
    }
    return Markup.inlineKeyboard(markup);

});

const CheckButton = Markup.keyboard
([
    ['✅Я подписался']
]).resize();

const StartButton = Markup.inlineKeyboard
([
    Markup.button.callback("Принять участие", "started")
]);


const GetCaptcha = (async (captcha)=>
{
    let markup = [];
    for (let i = 0; i<3;i++)
    {
        markup[i] = [];
        for (let j = 0; j<3; j++)
        {
            let pos = (i*3)+j;            
            let ans = 0;
            if (captcha.value[pos] === captcha.answer)
            {
                ans = 1;
            }
            let callback = `${ans}/${i}/${j}`;
            markup[i][j] = Markup.button.callback(captcha.Symbols[captcha.value[pos]],callback);
        }
    }
    return Markup.inlineKeyboard(markup);
});


module.exports = {CheckButton,GetSponsors,MainBoard, StartButton,GetCaptcha};