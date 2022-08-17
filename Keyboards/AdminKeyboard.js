const { Telegraf, Markup } = require('telegraf');


const MainAdmin = Markup.keyboard
(
    [
        ['Рассылка', 'Добавить спонсора'],
    ]
);


module.exports = {MainAdmin};