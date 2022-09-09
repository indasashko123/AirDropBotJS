const AddReferalCount = (async (_referer)=>
{
    _referer.referals++;
    await _referer.save();
});

module.exports = AddReferalCount;