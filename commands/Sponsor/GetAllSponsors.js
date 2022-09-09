const {SponsorModel} = require('../../DataBase/Models/Models');


const GetAllSponsors = (async ()=>
{
    const _sponsors = await SponsorModel.findAll();
    return _sponsors;
});


module.exports = GetAllSponsors;