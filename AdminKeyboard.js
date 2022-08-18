const { Telegraf, Markup } = require('telegraf');


const MainAdmin = Markup.keyboard
(
    [
        ['Рассылка', 'Добавить спонсора'],
        ['Техподдержка','✅Регистрация']
    ]
);


module.exports = {MainAdmin};