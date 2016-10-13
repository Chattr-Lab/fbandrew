var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var url = require('url');
var IMDB = require('imdb-api');

var verify_token = process.env.FB_VERIFY_TOKEN;
var token = process.env.FB_PAT;
var newsApiKey = process.env.NEWS_API_KEY;

app.use(bodyParser.json());

app.get('/webhook/', function (req, res) {

    if (req.query['hub.verify_token'] === verify_token) {
        res.send(req.query['hub.challenge']);
    }

    res.send('Error, wrong validation token');

});


app.get('/', function (req, res) {

    res.send('Hello World! This is the bot\'s root endpoint!');
    //res.send(req.query['hub.challenge'])
});



app.post('/webhook/', function (req, res) {

    var messaging_events = req.body.entry[0].messaging;

    for (var i = 0; i < messaging_events.length; i++) {

        var event = req.body.entry[0].messaging[i];
        var sender = event.sender.id;

        if (event.message && event.message.text) {
            var text = event.message.text;
            text = text.toLowerCase();
            /*if (text === 'generic') {
                sendGenericMessage(sender)
                continue
            }
            if (text.indexOf("@trump") > -1) { //if input text starts with "@trump"

                var reply= trumpSays()
                sendTextMessage(sender, "Trump says: " + reply);
            }
            else {
                sendTextMessage(sender, "Echo: " + text.substring(0, 200));
            }
            if (event.postback) {
                text = JSON.stringify(event.postback)
                sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
                continue
            }*/
            if(text){

                var input = parseText(text);

                if (input.indexOf('news') > -1) {
                    sendGenericMessage(sender,input);
                }
                else if (input.indexOf('imdb') > -1) {
                    sendGenericMessage(sender,input);
                }
                else if (input == 'greetings' || input == 'help' || input == 'random') {
                    sendTextMessage(sender,input);
                }
                else if(input == 'trump') {
                    sendTextMessage(sender,input);
                }
            }
            //sendTextMessage(sender, "Echo: " + text.substring(0, 200));
        }
    }

    res.sendStatus(200);

});

app.listen(process.env.PORT || 1337, function () {

    console.log('Facebook Messenger echoing bot started on port 1337!');

});

function parseText(text) {

    //business, entertainment, gaming, general, music, science-and-nature, sport, technology.
    var categories = ['business','entertainment','music','science','sport','technology','gaming','general'];
    var greetings = ['hey','hi','hello','whats up?'];
    var input;
    if (text.indexOf('@') == 0) {
        for (var i in categories) {
            if (text.indexOf(categories[i]) == 1) {
                input = categories [i]+' news';
                break;
            }
            else if (text.indexOf('imdb') > 0) {
                input = 'imdb ' + text.substring(6,text.length);
                console.log('parseText:' + input);
                break;
            }
            else if (text.indexOf('help') > 0) {
                input = 'help';
                break;
            }
            else if (text.indexOf('trump') > 0) {
                input = 'trump';
                break;
            }
            else {
                input = 'random';
            }

        }
    }
    else if (text) {
        for (var j in greetings) {
            //console.log(greetings[j]);
            //console.log(text);
            //console.log(text.indexOf(greetings[j]));
            //console.log(text.indexOf(greetings[j]) > -1);
            if (text.indexOf(greetings[j]) > -1) {
                input = 'greetings' ;
                break;
            }
            else if (text.indexOf('help') > -1) {
                input = 'help';
                break;
            }
            else {
                input = 'random' ;
            }
            //console.log(input);

        }
    }


    return input;
};

function sendTextMessage(sender, input) {

    var messageData;
    var greeting =["Hey!","Hello!","Hi there!"];
    var random = ["I didn't quite get it","I'm too smart to reply to that, try something else","try '@sport news' to get latest sport news"];
    var helpMenu = 'For news by category reply with one of these handles: @business, @entertainment, @music, @science, @sport, @technology, @gaming, @general';
    //console.log(input);
    if (input == 'greetings') {
        messageData = {text: greeting[Math.floor(Math.random() * greeting.length)]};
    }
    else if (input == 'random') {
        messageData = {text: random[Math.floor(Math.random() * random.length)]};
    }
    else if (input == 'help') {
        messageData = {text: helpMenu};
    }
    else if (input == 'trump') {
        messageData = {text: trumpSays()};
    }

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: messageData
        }
    }, function (error, response) {

        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }

    });

}

function categorySource(category) {
    var channel ={"sport":["espn","nfl-news","fox-sports"],
        "business":["bloomberg","business-insider","cnbc"],
        "entertainment":["buzzfeed","mashable","the-lad-bible"],
        "gaming":["ign","polygon"],
        "general":["associated-press","reuters","the-huffington-post"],
        "music": ["mtv-news","mtv-news-uk"],
        "science-and-nature": ["national-geographic","new-scientist"],
        "technology": ["engadget","recode","techradar"]};


    for (var channelcategory in channel) {

        var temp=channel[channelcategory];
        //console.log(channelcategory);
        //console.log(category);
        //console.log(channelcategory.indexOf(category));
        if(channelcategory.indexOf(category) > -1){
            return (temp[Math.floor(Math.random() * temp.length)]);
            //return (temp[0]);
        }
    }

}

function getMessageData(topNews) {
    //console.log('B4 json parse' + topNews);
    //topNews=JSON.parse(topNews);
    //stringToWorkWith = stringToWorkWith["articles"];
    console.log('Im in here');
    //console.log(topNews.status);
     var parsedData = '[';
    for (var key in topNews) {
        console.log(key);

        if (key == 'articles') {

            console.log(key.length);
            for (var k in topNews[key]) {
                console.log('k value : ' + k);

                var headline=(topNews[key][k]);
                //console.log("205 : " + headline);

                if (headline['title'] && headline['description'] && headline['urlToImage'] && headline['url']) {
                    console.log('206: ' + headline['title']);
                    if (parsedData.length != 1) {
                        parsedData = parsedData + ",";
                    }
                    parsedData = parsedData + "{";
                    parsedData = parsedData + '"title" : "' + headline['title'].replace(/[']+/g, "\\'").replace(/["]+/g, '\\"') + '",';
                    parsedData = parsedData + '"subtitle" : "' + headline['description'].replace(/[']+/g, "\\'").replace(/["]+/g, '\\"') + '",';
                    parsedData = parsedData + '"image_url" : "' + headline['urlToImage'].replace(/[']+/g, "\\'").replace(/["]+/g, '\\"') + '",';
                    parsedData = parsedData + '"buttons": [{"type": "web_url","url": "' + headline['url'].replace(/[']+/g, "\\'").replace(/["]+/g, '\\"') + '","title": "Open this in browser"}]';
                    parsedData = parsedData + '}';
                }
            }
        }
    }
    parsedData = parsedData + ']';
    //console.log(parsedData);
    return parsedData;
}

function sendGenericMessage(sender,input) {

    //https://newsapi.org/v1/articles?source=espn&sortBy=top&apiKey=e4c2fce3425949ac8a1c92d4ecbea56e
    var topNews = '';
    var baseUrl = "https://newsapi.org/v1/articles";
    var category;
    var messageData = '';
    var movie='';
    console.log(input.substring(0,input.indexOf('news')-1));
    if (input.indexOf('imdb') == 0) {
        console.log('in imdb');
        IMDB.getReq({ name: input.substring(5,input.length) },
            function(err, things)
            { movie = things;
                console.log(movie.title);
                console.log(movie.poster);
                messageData = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": {
                                "title": movie.title,
                                "subtitle": movie.year,
                                "image_url": movie.poster,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": movie.imdburl,
                                    "title": "IMDB Link"
                                }]
                            }
                        }
                    }
                }
                request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {access_token:token},
                    method: 'POST',
                    json: {
                        recipient: {id:sender},
                        message: messageData
                    }
                }, function(error, response) {
                    if (error) {
                        console.log('Error sending messages: ', error)
                    } else if (response.body.error) {
                        console.log('Error: ', response.body.error)
                    }
                })
            });


    }
    else if (category = input.substring(0,input.indexOf('news')-1)) {
        var source = categorySource(category);

        var processedUrl = baseUrl + '?source=' + source + '&sortBy=top&apiKey=' + newsApiKey;
        console.log(processedUrl);

        request({
            url: processedUrl,
            json: true
        }, function (error, response, body) {

            //console.log(body);
            if (!error && response.statusCode === 200) {
                //console.log(JSON.stringify(body));
                topNews = getMessageData(body);
                //console.log("Tp news1 : " + topNews);
                //console.log(messageData);
                messageData = '{"attachment": {"type": "template","payload": {"template_type": "generic","elements": ' + topNews + '}}}';
                //messageData = '{"attachment": {"type": "template","payload": {"template_type": "generic","elements": [{"title" : "Samsung is telling everyone to power down their Galaxy Note 7s","subtitle" : "It’s not a second recall (yet), but it may as well be.","image_url" : "https://cdn0.vox-cdn.com/thumbor/n_FJTC-1juI5OYvOzhpy8IQXez4=/0x351:3245x2176/1600x900/cdn0.vox-cdn.com/uploads/chorus_image/image/51298549/605913484.0.jpg","buttons": [{"type": "web_url","url": "http://www.recode.net/2016/10/10/13238442/samsung-turn-off-note-7","title": "Open this in browser"}]},{"title" : "Facebook’s Slack competitor, Workplace, is finally here","subtitle" : "The service formerly know as Facebook at Work has arrived.","image_url" : "https://cdn0.vox-cdn.com/thumbor/8bEBNT5r16rVF7gG97-HO-17Qd8=/0x228:3000x1916/1600x900/cdn0.vox-cdn.com/uploads/chorus_image/image/51286277/118313153.1476112900.jpg","buttons": [{"type": "web_url","url": "http://www.recode.net/2016/10/10/13226802/workplace-facebook-at-work-slack-competitor-launch","title": "Open this in browser"}]},{"title" : "Greylock has raised another $1 billion investment fund","subtitle" : "Greylock will focus on what it knows best: Software.","image_url" : "https://cdn0.vox-cdn.com/thumbor/FhoSQLuCuiGbIkHZPyXPlfYwtx8=/0x154:3000x1842/1600x900/cdn0.vox-cdn.com/uploads/chorus_image/image/51297087/604259104.0.jpg","buttons": [{"type": "web_url","url": "http://www.recode.net/2016/10/11/13235234/greylock-partners-new-fund","title": "Open this in browser"}]},{"title" : "Full transcript: Political consultant Bradley Tusk on Recode Decode","subtitle" : "Uber actually does a much better job working with government than people realize.","image_url" : "https://cdn0.vox-cdn.com/thumbor/mjkZyZtUuVeaKdhWz2E9OlozNOc=/0x100:1920x1180/1600x900/cdn0.vox-cdn.com/uploads/chorus_image/image/51299797/TuskVentures_Bradley_Tusk_5B1_5D.0.jpeg","buttons": [{"type": "web_url","url": "http://www.recode.net/2016/10/10/13231894/bradley-tusk-ventures-uber-politics-recode-decode-podcast-transcript","title": "Open this in browser"}]},{"title" : "The second presidential debate drew a huge TV audience, but not a record-breaking one","subtitle" : "66.5 million viewers.","image_url" : "https://cdn0.vox-cdn.com/thumbor/mk9EGlCh3HpT9HLtfXyjXhHv2xw=/0x0:4465x2512/1600x900/cdn0.vox-cdn.com/uploads/chorus_image/image/51295003/613703308.0.jpg","buttons": [{"type": "web_url","url": "http://www.recode.net/2016/10/10/13235830/trump-clinton-debate-ratings","title": "Open this in browser"}]},{"title" : "Samsung can’t salvage the Galaxy Note 7. Now it has to save the company’s reputation.","subtitle" : "It’s about much more than the fate of just this phone.","image_url" : "https://cdn0.vox-cdn.com/thumbor/ms2MJngAOruLjmIM4u51PnmYgcQ=/0x235:4500x2766/1600x900/cdn0.vox-cdn.com/uploads/chorus_image/image/51294725/598661650.0.jpg","buttons": [{"type": "web_url","url": "http://www.recode.net/2016/10/10/13229242/samsung-future-galaxy-note-7-recall-phone","title": "Open this in browser"}]},{"title" : "Twitter is advertising around New York City, including right near Wall Street","subtitle" : "!?","image_url" : "https://cdn0.vox-cdn.com/thumbor/SL4cpOPu2iqX1kjgwifHrJA33g4=/0x153:1632x1071/1600x900/cdn0.vox-cdn.com/uploads/chorus_image/image/51293697/Twitter_20NYC_20ads.0.jpg","buttons": [{"type": "web_url","url": "http://www.recode.net/2016/10/10/13234198/twitter-new-york-ads-subway-wall-street","title": "Open this in browser"}]},{"title" : "Facebook is going to have a hard time getting people to shop through its app","subtitle" : "Why a company’s customers don’t pick up on new features the way they’re supposed to.","image_url" : "https://cdn0.vox-cdn.com/thumbor/RJRSaIUOJyJyK0_xKBvdXRvM-0A=/0x0:4200x2363/1600x900/cdn0.vox-cdn.com/uploads/chorus_image/image/51290673/GettyImages-542161424.0.jpg","buttons": [{"type": "web_url","url": "http://www.recode.net/2016/10/10/13189980/technology-consumer-behavior-behavioral-debt-theory-facebook","title": "Open this in browser"}]}]}}}';
                console.log(messageData);
                request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {access_token:token},
                    method: 'POST',
                    json: {
                        recipient: {id:sender},
                        message: messageData
                    }
                }, function(error, response) {
                    if (error) {
                        console.log('Error sending messages: ', error)
                    } else if (response.body.error) {
                        console.log('Error: ', response.body.error)
                    }
                })
            }
        })
    }


    //messageData=getMessageData(topNews);

   /* var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Giants-Mets is dream matchup",
                    "subtitle": "You can't ask for more when you get two of the game's best pitchers battling in an elimination game. Time to break down the NL wild-card game (8 p.m. ET, ESPN/WatchESPN)",
                    "image_url": "http://a.espncdn.com/combiner/i?img=%2Fphoto%2F2016%2F0805%2Fr110586_1296x729_16%2D9.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "http://www.espn.com/mlb/story/_/page/playoffs16_NLWC5Qs",
                        "title": "Open this in browser"
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    } */

   //console.log("asdf : "+messageData.attachment.payload.elements);
    //console.log("asdf : "+JSON.parse(messageData));


}


function trumpSays() {
    var DTquotes = [
        'An ‘extremely credible source’ has called my office and told me that Barack Obama’s birth certificate is a fraud',
        'Robert Pattinson should not take back Kristen Stewart. She cheated on him like a dog & will do it again – just watch. He can do much better!',
        'Ariana Huffington is unattractive, both inside and out. I fully understand why her former husband left her for a man – he made a good decision.',
        'You know, it really doesn’t matter what the media write as long as you’ve got a young, and beautiful, piece of ass.',
        'I will build a great wall – and nobody builds walls better than me, believe me – and I’ll build them very inexpensively. I will build a great, great wall on our southern border, and I will make Mexico pay for that wall. Mark my words.',
        'When Mexico sends its people, they’re not sending the best. They’re not sending you, they’re sending people that have lots of problems and they’re bringing those problems with us. They’re bringing drugs. They’re bring crime. They’re rapists… And some, I assume, are good people.',
        'Our great African-American President hasn’t exactly had a positive impact on the thugs who are so happily and openly destroying Baltimore.',
        'If I were running ‘The View’, I’d fire Rosie O’Donnell. I mean, I’d look at her right in that fat, ugly face of hers, I’d say ‘Rosie, you’re fired.',
        'All of the women on The Apprentice flirted with me – consciously or unconsciously. That’s to be expected.',
        'One of they key problems today is that politics is such a disgrace. Good people don’t go into government.',
        'The beauty of me is that I’m very rich.',
        'It’s freezing and snowing in New York – we need global warming!',
        'I’ve said if Ivanka weren’t my daughter, perhaps I’d be dating her.',
        'My fingers are long and beautiful, as, it has been well documented, are various other parts of my body.',
        'I have never seen a thin person drinking Diet Coke.',
        'I think the only difference between me and the other candidates is that I’m more honest and my women are more beautiful.',
        'You’re disgusting.',
        'The point is, you can never be too greedy.',
        'Sorry, there is no STAR on the stage tonight!',
        'My Twitter has become so powerful that I can actually make my enemies tell the truth.',
        'My IQ is one of the highest — and you all know it! Please don\'t feel so stupid or insecure; it\'s not your fault.',
        'I have so many fabulous friends who happen to be gay, but I am a traditionalist.',
        'The other candidates — they went in, they didn’t know the air conditioning didn’t work. They sweated like dogs...How are they gonna beat ISIS? I don’t think it’s gonna happen.',
        'Look at those hands, are they small hands? And, [Republican rival Marco Rubio] referred to my hands: \'If they\'re small, something else must be small.\' I guarantee you there\'s no problem. I guarantee.',
        'Thanks sweetie. That’s nice',
        'Lyin\' Ted Cruz just used a picture of Melania from a shoot in his ad. Be careful, Lyin\' Ted, or I will spill the beans on your wife!',
        'I was down there, and I watched our police and our firemen, down on 7-Eleven, down at the World Trade Center, right after it came down',
        'The only card [Hillary Clinton] has is the woman\'s card. She\'s got nothing else to offer and frankly, if Hillary Clinton were a man, I don\'t think she\'d get 5 percent of the vote. The only thing she\'s got going is the woman\'s card, and the beautiful thing is, women don\'t like her.'];

    var randomDonaldTrumpQuote = DTquotes[Math.floor(Math.random() * DTquotes.length)];
    return 'Trump says: ' + randomDonaldTrumpQuote;

}
