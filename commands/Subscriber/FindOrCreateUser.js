const {SubscriberModel} = require('../../DataBase/Models/Models');

const FindOrCreate = (async (_chatId, referalChatID) =>
{
    const [_user, _created] = await SubscriberModel.findOrCreate
    ({
        where:
        {
            chatId: _chatId
        },
        defaults:
        {
            chatId: _chatId,
            passed : false,
            referals : 0,
            referal : referalChatID,
            tickets : 0
        }
    });
    const answer = {user : _user, created : _created};
    return answer;
});

const FindAllUsers = (async ()=>
{
    let userCount = await SubscriberModel.findAll();
    return userCount;
});

const FindAllUnactiveUsers = (async ()=>
{
    let userCount = await SubscriberModel.findAll({
        where :
        {
           passed : true
        }
     });
    return userCount;
});

const FindOneUser = (async (_chatId)=>
{
    const _subscriber = await SubscriberModel.findOne
    ({
        where:
        {
            chatId: _chatId
        }
    });
    return _subscriber;
});



module.exports = {FindOrCreate, FindAllUsers,FindAllUnactiveUsers,FindOneUser};