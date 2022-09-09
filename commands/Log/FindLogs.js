const {LogModel} = require('../../DataBase/Models/Models');


const FindLogsByChatId = (async(_chatId)=>
{
    const _logs = await LogModel.FindAll(
    {
        where : 
        {
            chatId : _chatId
        }
    })
    return _logs;
});

const FindAllLogs = (async ()=> 
{
    const _logs = await LogModel.FindAll();
    return _logs;
});


const FindLogById = (async (_id) => {
    const _log = await LogModel.FindAll(
        {
            where : 
            {
                id : _id
            }
        })
        return _log;
});

module.exports = {FindLogsByChatId,FindAllLogs, FindLogById};