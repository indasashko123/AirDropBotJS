const GetValues = (async() =>
{



    let Answer =""; 
    for(let i=0;i<4;i++)
    {
        Answer = Answer +""+Math.floor(Math.random() * 10);
    }
    return Answer;
});

module.exports = {GetValues};