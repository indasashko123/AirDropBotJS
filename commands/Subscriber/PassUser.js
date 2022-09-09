const {SubscriberModel} = require('../../DataBase/Models/Models');


const PassUser = (async (_subscriber)=>
{
    _subscriber.passed = true;
    _subscriber.tickets ++;
    await _subscriber.save();
});

module.exports = PassUser;