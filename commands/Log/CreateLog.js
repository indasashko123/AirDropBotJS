const {LogModel} = require('../../DataBase/Models/Models');


const CreateLog = (async (_chatId,_message, _errorMessage, _method)=>
{
    try
    {
        const _log = await LogModel.create(
            {
                date : new Date(),
                chatId : _chatId,
                message : _message,
                errorMessage : _errorMessage,
                method : _method
            });
            return _log;
    }
    catch{}
});

module.exports = CreateLog;