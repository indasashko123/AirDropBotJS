const {SubscriberModel} = require('../../DataBase/Models/Models');


const AddPassedReferal = (async (_chatId)=>
{
    const _referal = await SubscriberModel.findOne
    ({
        where :
        {
            chatId : _chatId
        }
    });
    _referal.tickets++;
    await _referal.save();
    return _referal;
});

module.exports = AddPassedReferal;