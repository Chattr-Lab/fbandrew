var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var url = require('url');

var verify_token = process.env.FB_VERIFY_TOKEN;
var token = process.env.FB_PAT;

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
                if (input == 'news') {
                    sendGenericMessage(sender,input);
                }
                else if ( input == 'greetings') {
                    sendTextMessage(sender,input);
                }
                else if (input == 'random') {
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
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function sendTextMessage(sender, input) {

    var messageData=input;
    console.log(input);
    var greeting =["Hey!","Hello!","Hi there!"];
    var random = ["I didn't quite get it","I'm too smart to reply to that, try something else","try '@sport news' to get latest sport news"]
    if (input == 'greetings') {
        messageData = greeting[0];
    }
    else if (input == 'random') {
        messageData = random[0];
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

function parseText(text) {

    //business, entertainment, gaming, general, music, science-and-nature, sport, technology.
    var categories = ['business','entertainment','music','science','sport','tech'];
    var greetings = ['hey','hi','hello','whats up?']
    var input;
    if (text.indexOf('@') == 0) {
        for (var i in categories) {
            if (text.indexOf(categories[i]) == 1) {
                  input = 'news';
            }
            continue;
        }
    }
    else if (text) {
        for (var j in greetings) {
            if (text.indexOf(greetings[j]) > -1) {
                input = 'greetings';
            }
            continue
        }
    }
    else {
        input = 'random'
    }

    return input;
};

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
    return randomDonaldTrumpQuote;

}

function sendGenericMessage(sender,input) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
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
    }
    request({
        url: 'https://graph.facebook.com/v2.8/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


