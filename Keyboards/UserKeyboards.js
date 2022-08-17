const { Telegraf, Markup } = require('telegraf');



const MainBoard = Markup.keyboard
(
    [
        ["❗️Правила",'👥Реферальная программа'],
        ['🧑‍💻Техподдержка', "📊Статистика"]
    ]
).resize();

const GetSponsors = (async(sponsors)=>
{ 
    let markup = [];
    for (let i=0; i<sponsors.length; i++)
    {
        markup[i] = Markup.button.url(sponsors[i].name, sponsors[i].link);
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

module.exports = {CheckButton,GetSponsors,MainBoard, StartButton};