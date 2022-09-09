const {SubscriberModel} = require('../../DataBase/Models/Models');

const FindReferal = (async (_referalChatID) =>
{
    try 
    {
        _referer = await SubscriberModel.findOne(
            {
                where:
                {
                    chatId: _referalChatID
                }
            });
        if (_referer === null)
        {
            _referalChatID = 0;
        }
    }
    catch
    {
        _referalChatID = 0;
    }
    const answer = 
    {
        referer : _referer,
        referalChatID : _referalChatID
    }
    return answer;
});

const FindAllReferals = (async (_referalChatId) =>
{
    _referals = await SubscriberModel.findAll(
        {
            where : 
            {
                referal : _referalChatId
            }
        });
    return _referals;
});

const FindAllReferalsPassed = (async (_referalChatId) =>
{
    _referals = await SubscriberModel.findAll(
        {
            where : 
            {
                referal : _referalChatId,
                passed : true
            }
        });
    return _referals;
});

module.exports = {FindReferal, FindAllReferals,FindAllReferalsPassed};