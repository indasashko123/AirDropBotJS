const GetValues = (async() =>
{
    let answer = Math.floor(Math.random() * 5);
    let answerPosition = [];
    let values =[];
    for (let i = 0; i < 3; i++)
    {
        let pos = Math.floor(Math.random() * 9);
        while (answerPosition.includes(pos))
        {
            pos = Math.floor(Math.random() * 9);
        }
        answerPosition[i] = pos;
        values[pos] = answer;
    }
    for (let j = 0; j < 9; j++)
    {
        if (!answerPosition.includes(j))
        {
            let pick = Math.floor(Math.random() * 5);
            while (pick === answer)
            {
                pick = Math.floor(Math.random() * 5);
            }
            values[j]  = pick;
        }
    }
    let captchaAnswer = new CapchaValues();
    captchaAnswer.value = values;
    captchaAnswer.answer = answer;
    return captchaAnswer;
});


class CapchaValues
{
    value;
    answer;
    Symbols = ["❤️","☠️","👑","🌵","🍏"];
    Names = ["Сердце","Череп","Корона","Кактус","Яблоко"];
}

module.exports = {GetValues};