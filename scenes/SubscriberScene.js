const {Scenes, Markup} = require('telegraf');



class SubscriberScene
{
    GetUserGreatingScene()
    {
        const greating = new Scenes.BaseScene("greating");
        greating.enter(async (ctx)=>
        {
            try
            {
                await ctx.reply("Привет, админ", StartButton);
            }
            catch(er)
            {
                console.log(er);
                CreateLog(ctx.chat.id,JSON.stringify(ctx),JSON.stringify(er),"Greating reply");
            }
        });

        



    }

}

module.exports = SubscriberScene;