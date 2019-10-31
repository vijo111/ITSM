require('dotenv-extended').load();
var builder = require('botbuilder');
var restify = require('restify');
var Swagger = require('swagger-client');
var Promise = require('bluebird');
var url = require('url');
var fs = require('fs');
var util = require('util');
var apiai = require("apiai");
var apiairecognizer = require('api-ai-recognizer');
var request = require('request');

// Swagger client for Bot Connector API
var connectorApiClient = new Swagger(
    {
        url: 'https://raw.githubusercontent.com/Microsoft/BotBuilder/master/CSharp/Library/Microsoft.Bot.Connector.Shared/Swagger/ConnectorAPI.json',
        usePromise: true
    });

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: '88675847-f42c-4696-b86c-24456a91b144',
    appPassword: '65iAuZ8fxyA2Pk2hYMa1OAS'
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector);
bot.set('localizerSettings', {
    botLocalePath: __dirname + "\\locale"
});

var recognizer = new apiairecognizer("989d72b1074d4cc7a629d1a057859770");
var intents = new builder.IntentDialog({
    recognizers: [recognizer]
});

var url = 'https://congruentsoft-my.sharepoint.com/personal/vijayanand_m_congruentindia_com/_layouts/15/guestaccess.aspx?docid=17f3761d0c2184b1fa3621f37d24a4e20&authkey=AdlmORoIncrBxFJ3XpkZO-0&e=4%3Affa3a6e1340846a6a067deb0d957eaae';

bot.dialog('/', intents);

intents.matches('smalltalk.greetings.hello', [function (session) {
    console.log('smalltalk.greetings.hello!!!!!!!!!!!!!!!!!');
    builder.Prompts.text(session, "Welcome Dr. Roger Smith. This is Liz, a virtual service executive.<br> Can I get your order #?");
}, function (session, results) {
    if (isNaN(results.response)) {
        session.replaceDialog('phonePrompt', { reprompt: true });
    } else {
        /*builder.Prompts.confirm(session, "OK, It's a Clarity Aligner, delivered on 10/04/2017. <br>Do you have any fitment problem with the aligner?");
        var card = createReceiptCard(session);
        var msg1 = new builder.Message(session).addAttachment(card);
        session.send(msg1);
        builder.Prompts.confirm(session, "Do you have any fitment problem with the aligner?"); */
        builder.Prompts.confirm(session, "Order details:  \n\n" +
        "  &nbsp;&nbsp;  \n\n"+
        "* Case ID:&nbsp; &nbsp; &nbsp;RV23DD  \n\n"+
        "* Account Name:&nbsp; &nbsp; &nbsp;Overlake Medical centre, Bellevue  \n\n"+
        "* Doctor Name:&nbsp; &nbsp; &nbsp;Dr. Roger Smith   \n\n"+  
        "* Facility Name:&nbsp; &nbsp; &nbsp;Overlake Medica   l centre, Detal care  \n\n"+
        "* Patient ID:&nbsp; &nbsp; &nbsp;WY8BP8TD6K   \n\n"+
        "* Patient Name:&nbsp; &nbsp; &nbsp;Ms. Susan Mathews (Female/35years) \n\n"+
        "  &nbsp;&nbsp;  \n\n"+
        "Do you have a fitment problem with the aligner?");
    }
}, function (session, results) {
    if (results.response) {
        session.beginDialog('/q1Yes');
    } else {
        session.beginDialog('/q1No');
    }
}
]);

//prompt order # validation
bot.dialog('phonePrompt', [
    function (session, args) {
        builder.Prompts.text(session, "Seems like an invalid order number. To help you out, I will require the correct order number.")
    }, function (session, results) {
        if (isNaN(results.response)) {
            session.replaceDialog('phonePrompt', { reprompt: true });
        } else {
            builder.Prompts.confirm(session, "Order details:  \n\n" +
            "  &nbsp;&nbsp;  \n\n"+
            "* Case ID:&nbsp; &nbsp; &nbsp;RV23DD  \n\n"+
            "* Account Name:&nbsp; &nbsp; &nbsp;Overlake Medical centre, Bellevue  \n\n"+
            "* Facility Name:&nbsp; &nbsp; &nbsp;Overlake Medica   l centre, Detal care  \n\n"+            
            "* Doctor Name:&nbsp; &nbsp; &nbsp;Dr. Roger Smith   \n\n"+  
            "* Patient ID:&nbsp; &nbsp; &nbsp;WY8BP8TD6K   \n\n"+
            "* Patient Name:&nbsp; &nbsp; &nbsp;Ms. Susan Mathews (Female/35years) \n\n"+
            "  &nbsp;&nbsp;  \n\n"+
            "Do you have a fitment problem with the aligner?");
        }
    }, function (session, results) {
        if (results.response) {
            session.beginDialog('/q1Yes');
        } else {
            session.beginDialog('/q1No');
        }
    }
]);
/*
function createReceiptCard(session) {
    return new builder.ReceiptCard(session)
        .title('Order Details')
        .facts([
           // builder.Fact.create(session, 'Product:', '3M Clarity Aligner'),
            builder.Fact.create(session, 'RV23DD', 'Case ID:' ),
            builder.Fact.create(session, 'P66WL', 'Order ID:' ),
            builder.Fact.create(session, 'Overlake Medical centre, Bellevue','Account Name:' ),
            builder.Fact.create(session, 'Dr. Roger Smith','Doctor Name:' ),            
            builder.Fact.create(session, 'Overlake Medical centre, Detal care','Bill To:' ),
            builder.Fact.create(session, 'Ms. Susan Mathews', 'Patient Name:' ),
            builder.Fact.create(session, 'WY8BP8TD6K, Female/35years', 'Patient ID:' ),
//            builder.Fact.create(session, 'Female', '35Years')
        ])
        .items([
            builder.ReceiptItem.create(session, '$ 35', '3M Clarity Aligner')
                .quantity(368)
                .image(builder.CardImage.create(session, 'D://workspace/cit/alignerBot/images/aligner.jpg'))
        ])
        .tax('$ 7')
        .total('$ 42')
}
*/
//dialog to respond
bot.dialog('/q1No', [
    function (session) {
        console.log('q1No########');
        session.send("I am afraid I am not equipped at the moment to handle problems other than aligner fitment issues. Sorry for the inconvenience. However, I will escalate the issue to a human service executive that will contact you as soon as possible. In case this is very urgent, you may call our toll free number +1-800-123-4567 and follow the voice menu options to reach out to our call center executive. Good day!");
        session.endDialog();
    }
]);

intents.matches('smalltalk.appraisal.thank_you', [function (session) {
    console.log('smalltalk.greetings.hello!!!!!!!!!!!!!!!!!');
    session.send("Welcome. Its my pleasure.");
}
]);

intents.matches('alignerissue', [function (session) {
    console.log('alignerissue!!!!!!!!!!!!!!!!!');
    session.beginDialog('/q1Yes');
}
]);

bot.dialog('/q1Yes', [
    function (session, args, next) {
        builder.Prompts.choice(session, "Let me try to fix this. For that, I require some more details. <Br> How is the aligner fitting?", "Tight|Loose|Popping out");

    }, function (session, results) {
        builder.Prompts.choice(session, "In which arch it is?", "Upper|Lower|Both", { listStyle: builder.ListStyle.button });

    }, function (session, results) {
        builder.Prompts.text(session, "what number aligner is this?");

    }, function (session, results) {
        builder.Prompts.confirm(session, "Sorry. I need to ask this standard question. <br> Did you try this with the right patient? (Y/N)");

    }, function (session, results) {
        if (results.response) {
            session.beginDialog('/q4Yes');
        } else {
            session.beginDialog('/q4No');
        }
}])

// Dialog to get user base input
bot.dialog('/q4No', [
    function (session) {
        console.log('q4No########');
        session.send("Can you please try this with the right patient and come back?");
        session.endDialog();
    }
]);

// Dialog to get user base input
bot.dialog('/q4Yes', [
    function (session) {
        console.log('q4Yes########');
        builder.Prompts.confirm(session, "Are there any attachments? (Y/N)");
    },
    function (session, results) {
        if (results.response) {
            session.beginDialog('/q5Yes');
        } else {
            session.beginDialog('/q5No');
        }
    }
]);

bot.dialog('/q5Yes', [
    function (session) {
        console.log('q5Yes########');
        builder.Prompts.confirm(session, "Did you adjust the aligner already? (Y/N)");
    },
    function (session, results) {
        if (results.response) {
            session.beginDialog('/q6Yes');
        } else {
            session.beginDialog('/q6-1No');
        }
    }
]);


bot.dialog('/q5No', [
    function (session) {
        console.log('q5No########');
        builder.Prompts.confirm(session, "Did you adjust the aligner already? (Y/N)");
    },
    function (session, results) {
        if (results.response) {
            session.beginDialog('/q6Yes');
        } else {
            session.beginDialog('/q6No');
        }
    }
]);

bot.dialog('/q6-1No', [
    function (session) {
        console.log('q6-1No########');
        session.send("Smooth the edges of the attachments, and ensure there aren't too many attachments of the appliance.<br> Can you please execute the procedure as per attached pdf and come back?");
        //uploadFileAndSend(session, './images/pdftest.pdf', 'application/pdf', 'recommendation.pdf');
        openUrl(session, url, 'application/pdf', 'recommendation.pdf');
        session.endDialog();
    }
]);

bot.dialog('/q6No', [
    function (session) {
        console.log('q6No########');
        session.send('Trim away the aligner in undercut region with trimming bur. Trim the distal of the terminal molars.<br> Can you please execute the procedure as per attached pdf and come back?');
        //uploadFileAndSend(session, './images/pdftest.pdf', 'application/pdf', 'recommendation.pdf');
        openUrl(session, url, 'application/pdf', 'recommendation.pdf');
        session.endDialog();
    }
]);

bot.dialog('/q6Yes', [
    function (session) {
        console.log('q6Yes########');
        builder.Prompts.confirm(session, "we should try the next aligner in the set. By any chance, did you try that already? (Y/N)");
    }, function (session, results) {
        if (results.response) {
            session.beginDialog('/q7aYes');
        } else {
            session.beginDialog('/q7aNo');
        }
    }
]);

bot.dialog('/q7aYes', [
    function (session) {
        console.log('q7aYes########');
        builder.Prompts.confirm(session, "Did that fit? (Y/N)");
    }, function (session, results) {
        if (results.response) {
            session.beginDialog('/q7Yes');
        } else {
            session.beginDialog('/q7No');
        }
    }
]);

bot.dialog('/q7aNo', [
    function (session) {
        console.log('q7aNo########');
        session.send('Kindly try the next set of aligner and come back?');
        session.endDialog();
    }
]);


bot.dialog('/q7Yes', [
    function (session) {
        console.log('q7Yes########');
        session.send('Can you please execute the procedure as per attached pdf and come back?');
        //uploadFileAndSend(session, './images/pdftest.pdf', 'application/pdf', 'recommendation.pdf');
        openUrl(session, url, 'application/pdf', 'recommendation.pdf');
        session.endDialog();
    }
]);

bot.dialog('/q7No', [
    function (session) {
        console.log('q7No########');
        builder.Prompts.confirm(session, "Has the patient had dental work recently? (Y/N)");
    }, function (session, results) {

        if (results.response) {
            session.beginDialog('/q8Yes');
        } else {
            session.beginDialog('/q8No');
        }
    }
]);

bot.dialog('/q8Yes', [
    function (session) {
        console.log('q8Yes########');
        session.send('Can you please execute the procedure as per attached pdf and come back?');
        //uploadFileAndSend(session, './images/pdftest.pdf', 'application/pdf', 'recommendation.pdf');
        openUrl(session, url, 'application/pdf', 'recommendation.pdf');
        session.endDialog();
    }
]);

bot.dialog('/q8No', [
    function (session) {
        console.log('q8No########');
        session.send('There may be insufficent space. Review IPR instructions.<br> Can you please execute the procedure as per attached pdf and come back?');
        //uploadFileAndSend(session, './images/pdftest.pdf', 'application/pdf', 'recommendation.pdf');
        openUrl(session, url, 'application/pdf', 'recommendation.pdf');
        session.endDialog();
    }
]);

intents.onDefault(function (session, args) {
    console.log('!!!!!!Default!!!!!!!!!!!');
    var fulfillment = builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
    console.log('!!!!!!fulfillment!!!!!!!!!!!', fulfillment);
    if (fulfillment) {
        var speech = fulfillment.entity;
        console.log('!!!!!!fulfillment.entity!!!!!!!!!!!', fulfillment.entity);
        session.send(speech);
    } else {
        session.send('Sorry...not sure how to respond to that');
    }
});

/*
bot.dialog('/q9', [
    function (session) {
        console.log('/q9########');
        builder.Prompts.confirm(session, "I hope that answered your question? (Y/N)");
    }, function (session, results) {
        if (results.response) {
            session.send("Thank you.I'm glad I was able to help you.");
            session.endDialog();
        } else {
            session.beginDialog('/q10No');
        }
    }
]);

bot.dialog('/q10No', [
    function (session) {
        console.log('q10No########');
        builder.Prompts.text(session, "Sorry. Kindly elaborate your concern one more time. I ll transfer it to human executive.");
    }, function (session, results) {
        session.send("Your concern is noted and concern ID is 9999, human executive will contact you shortly.<Br> Thank you for your patience. <br> Have a great day.");
        session.endDialog();
    }
]);
*/

// Sends attachment using an Internet url
function openUrl(session, url, contentType, attachmentFileName) {
    var msg = new builder.Message(session)
        .addAttachment({
            contentUrl: url,
            contentType: contentType,
            name: attachmentFileName
        });

    session.send(msg);
}

// Uploads a file using the Connector API and sends attachment
function uploadFileAndSend(session, filePath, contentType, attachmentFileName) {

    // read file content and upload
    fs.readFile(filePath, function (err, data) {
        if (err) {
            return session.send('Oops. Error reading file.');
        }
        
        console.log('11-----------------data--',data);
        console.log('11-----------------contentType--',contentType);
        console.log('11-----------------attachmentFileName--',attachmentFileName);
        console.log('11-----------------connector--',connector);
        console.log('11-----------------connectorApiClient--',connectorApiClient);
        //console.log('11-----------------session.message.address.serviceUrl--',serviceurl);
        console.log('11-----------------session.message.address.conversation.id--',session.message.address.conversation.id);
        //console.log('11-----------------attachmentUrl--',attachmentUrl);
        
        

        // Upload file data using helper function
        uploadAttachment(
            data,
            contentType,
            attachmentFileName,
            connector,
            connectorApiClient,
            session.message.address.serviceUrl,
            session.message.address.conversation.id)
            .then(function (attachmentUrl) {
                // Send Message with Attachment obj using returned Url
                console.log('1-----------------attachmentUrl--',attachmentUrl);
                console.log('2-----------------contentType--',contentType);
                console.log('3-----------------attachmentFileName--',attachmentFileName);
                var msg = new builder.Message(session)
                    .addAttachment({
                        contentUrl: attachmentUrl,
                        contentType: contentType,
                        name: attachmentFileName
                    });

                session.send(msg);
            })
            .catch(function (err) {
                console.log('Error uploading file', err.message);
                session.send('Oops. Error uploading file. ' + err);
            });
    });
}


// Uploads file to Connector API and returns Attachment URLs
function uploadAttachment(fileData, contentType, fileName, connector, connectorApiClient, baseServiceUrl, conversationId) {

    var base64 = Buffer.from(fileData).toString('base64');
    //console.log('-----------------base64--',base64);
    // Inject the connector's JWT token into to the Swagger client
    function addTokenToClient(connector, clientPromise) {
        // ask the connector for the token. If it expired, a new token will be requested to the API
        var obtainToken = Promise.promisify(connector.addAccessToken.bind(connector));
        //console.log('-----------------obtainToken--',obtainToken);
        var options = {};
        return Promise.all([clientPromise, obtainToken(options)]).then(function (values) {
            var client = values[0];
            var hasToken = !!options.headers.Authorization;
            console.log('-----------------hasToken--',hasToken);
            if (hasToken) {
                var authHeader = options.headers.Authorization;
                client.clientAuthorizations.add('AuthorizationBearer', new Swagger.ApiKeyAuthorization('Authorization', authHeader, 'header'));
            }
            return client;
        });
    }

    // 1. inject the JWT from the connector to the client on every call
    return addTokenToClient(connector, connectorApiClient).then(function (client) {
        // 2. override API client host and schema (https://api.botframework.com) with channel's serviceHost (e.g.: https://slack.botframework.com or http://localhost:NNNN)
        var serviceUrl = url.parse(baseServiceUrl);
        console.log('-----------------serviceUrl--',serviceUrl);
        var serviceScheme = serviceUrl.protocol.split(':')[0];
        console.log('-----------------serviceScheme--',serviceScheme);
        client.setSchemes([serviceScheme]);
        console.log('-----------------[serviceScheme]--',[serviceScheme]);
        client.setHost(serviceUrl.host);
        console.log('-----------------serviceUrl.host--',serviceUrl.host);

        // 3. POST /v3/conversations/{conversationId}/attachments
        var uploadParameters = {
            conversationId: conversationId,
            attachmentUpload: {
                type: contentType,
                name: fileName,
                originalBase64: base64
            }
        };

        return client.Conversations.Conversations_UploadAttachment(uploadParameters)
            .then(function (res) {
                var serviceurl = 'https://smba.trafficmanager.net/apis';
                var attachmentId = res.obj.id;
                var attachmentUrl = serviceUrl;
                console.log('-----------------2attachmentUrl --',attachmentUrl.pathname );
                attachmentUrl.pathname = util.format('/v3/attachments/%s/views/%s', attachmentId, 'original');
                console.log('-----------------attachmentUrl.pathname --',attachmentUrl.pathname );
                attachmentUrl = serviceurl+attachmentUrl.pathname;
                return attachmentUrl;
            });
    });
}