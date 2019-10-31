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
var ignoreCase = require('ignore-case');
var mysql = require('mysql');
var http = require('http');

var extServerOptions = {
    host: 'localhost',
    port: '1337',
    path: '/userTicket/',
    method: 'GET'
};


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
    appId: 'b6962122-f602-4bb9-a928-209b7ed4b04e',
    appPassword: 'pzoTXDIC05^@qghtLW378!*'
});

// Listen for messages from users 
server.post('/webhook', connector.listen());

var bot = new builder.UniversalBot(connector);
bot.set('localizerSettings', {
    botLocalePath: __dirname + "\\locale"
});

var recognizer = new apiairecognizer("989d72b1074d4cc7a629d1a057859770");
var intents = new builder.IntentDialog({
    recognizers: [recognizer]
});

var entityType = {
    "entity": ["ticket", "status", "severity", "priority"]
};


bot.dialog('/', intents);

intents.onDefault(function (session, args) {
    var fulfillment = builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
    if (fulfillment) {
        var speech = fulfillment.entity;
        session.send(speech);
    } else {
        session.send('Sorry...not sure how to respond to that');
    }
});


intents.matches('Tickets with Status', function (session, args) {
    var status = '';
    var severity = '';
    var priority = '';
    if (args.entities != null) {
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'status') {
                status = args.entities[i].entity;
            }
            if (args.entities[i].type == 'severity') {
                severity = args.entities[i].entity;
            }
            if (args.entities[i].type == 'priority') {
                priority = args.entities[i].entity;
            }
        }
    }
    if (status == '' || status == null) {
        status = 'new';
    }


    var connection = mysql.createConnection({
        host: 'localhost', //192.168.61.155
        port: '3306',
        user: 'root',
        password: 'root',
        database: 'helpdesk'
    });

    /*var entityIndex = session.message.text.toLowerCase();
    session.sendTyping();*/
    var selQuery = "SELECT TICKET_ID,TICKET_TITLE FROM HELPDESK.TICKET T, HELPDESK.STATUS S WHERE T.STATUS_ID = S.STATUS_ID AND STATUS_NAME = ? ORDER BY SEVERITY_ID DESC";
    connection.connect();
    if (connection != null) {
        connection.query(selQuery, status, function (err, rows, fields) {

            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var tickets = '';
                for (var idx in json) {
                    var item = json[idx];
                    tickets = tickets + item.TICKET_ID + '-' + item.TICKET_TITLE + '<BR>';
                }
                session.send("Please find the below recent tickets for the status '" + status + "' <Br>" + tickets);
            }

            connection.end();
        });
    }
});


intents.matches('Tickets with Status & Priority', function (session, args) {
    var status = '';
    var severity = '';
    var priority = '';
    if (args.entities != null) {
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'status') {
                status = args.entities[i].entity;
            }
            if (args.entities[i].type == 'severity') {
                severity = args.entities[i].entity;
            }
            if (args.entities[i].type == 'priority') {
                priority = args.entities[i].entity;
            }
        }
    }
    if (status == '' || status == null) {
        status = 'new';
    }
    if (priority == '' || priority == null) {
        priority = 'critical';
    }

    var connection = mysql.createConnection({
        host: 'localhost', //192.168.61.155
        port: '3306',
        user: 'root',
        password: 'root',
        database: 'helpdesk'
    });

    var params = [status, priority];
    var selQuery = "SELECT TICKET_ID,TICKET_TITLE FROM HELPDESK.TICKET T, HELPDESK.PRIORITY P, HELPDESK.STATUS S WHERE T.PRIORITY_ID =  P.PRIORITY_ID  AND T.STATUS_ID=S.STATUS_ID AND S.STATUS_NAME = ? AND P.PRIORITY_NAME = ?  ORDER BY SEVERITY_ID DESC";
    connection.connect();
    if (connection != null) {
        connection.query(selQuery, params, function (err, rows) {
            if (err) {
                throw err;
            }
            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var tickets = '';
                for (var idx in json) {
                    var item = json[idx];
                    tickets = tickets + item.TICKET_ID + '-' + item.TICKET_TITLE + '<BR>';
                }
                session.send("Please find the below " + priority + " priority tickets for the status '" + status + "'. <Br>" + tickets);
            } else {
                session.send("You dont have any tickets.");
            }
            connection.end();
        });
    }
});


intents.matches('Tickets with Status & Severity', function (session, args) {
    var status = '';
    var severity = '';
    var priority = '';
    if (args.entities != null) {
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'status') {
                status = args.entities[i].entity;
            }
            if (args.entities[i].type == 'severity') {
                severity = args.entities[i].entity;
            }
            if (args.entities[i].type == 'priority') {
                priority = args.entities[i].entity;
            }
        }
    }
    if (status == '' || status == null) {
        status = 'new';
    }
    if (severity == '' || severity == null) {
        severity = 'critical';
    }

    var connection = mysql.createConnection({
        host: 'localhost', //192.168.61.155
        port: '3306',
        user: 'root',
        password: 'root',
        database: 'helpdesk'
    });

    var params = [status, severity];
    var selQuery = "SELECT TICKET_ID,TICKET_TITLE FROM HELPDESK.TICKET T, HELPDESK.SEVERITY SE , HELPDESK.STATUS S WHERE T.SEVERITY_ID =  SE.SEVERITY_ID AND  T.STATUS_ID=S.STATUS_ID AND S.STATUS_NAME = ?  AND  SE.SEVERITY_NAME = ? ORDER BY T.PRIORITY_ID DESC";
    connection.connect();
    if (connection != null) {
        connection.query(selQuery, params, function (err, rows) {

            if (err) {
                throw err;
            }
            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var tickets = '';
                for (var idx in json) {
                    var item = json[idx];
                    tickets = tickets + item.TICKET_ID + '-' + item.TICKET_TITLE + '<BR>';
                }
                session.send("Please find the below " + severity + "severity tickets for the status '" + status + "'. <Br>" + tickets);
            } else {
                session.send("You dont have any tickets.");
            }
            connection.end();
        });
    }
});


intents.matches('My Tickets', function (session, args) {
    var status = '';
    var severity = '';
    var priority = '';
    var curUser = '';
    if (args.entities != null) {
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'status') {
                status = args.entities[i].entity;
            }
            if (args.entities[i].type == 'severity') {
                severity = args.entities[i].entity;
            }
            if (args.entities[i].type == 'priority') {
                priority = args.entities[i].entity;
            }
            if (args.entities[i].type == 'curUser') {
                curUser = 'vijay';
            }
        }
    }
    if (status == '' || status == null) {
        status = 'new';
    }
    if (severity == '' || severity == null) {
        severity = '%';
    }
    if (priority == '' || priority == null) {
        priority = '%';
    }
    var connection = mysql.createConnection({
        host: 'localhost', //192.168.61.155
        port: '3306',
        user: 'root',
        password: 'root',
        database: 'helpdesk'
    });
    var params = [status, severity, priority, curUser];

    var selQuery = "SELECT TICKET_ID,TICKET_TITLE FROM HELPDESK.TICKET T, HELPDESK.STATUS S,  HELPDESK.SEVERITY SE, HELPDESK.PRIORITY P WHERE T.STATUS_ID = S.STATUS_ID AND T.SEVERITY_ID =  SE.SEVERITY_ID AND  T.PRIORITY_ID = P.PRIORITY_ID AND S.STATUS_NAME LIKE ? AND SE.SEVERITY_NAME LIKE ? AND P.PRIORITY_NAME LIKE ? AND T.ASSIGNED_TO = ? ORDER BY T.SEVERITY_ID DESC";
    connection.connect();
    if (connection != null) {
        //connection.query(selQuery, status, severity, function (err, rows, fields) {
        connection.query(selQuery, params, function (err, rows) {

            if (err) {
                throw err;
            }
            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var tickets = '';
                for (var idx in json) {
                    var item = json[idx];
                    tickets = tickets + item.TICKET_ID + '-' + item.TICKET_TITLE + '<BR>';
                }
                session.send("Please find the below " + severity + " priority tickets for the status " + status + ". <Br>" + tickets + '-');
            } else {
                session.send("You dont have any tickets.");
            }
            connection.end();
        });
    }
});


intents.matches('Ticket Details', function (session, args) {
    var ticketId = '';
    var severity = '';
    var priority = '';
    if (args.entities != null) {
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'ticketid') {
                ticketId = args.entities[i].entity;
            }
        }
    }

    var connection = mysql.createConnection({
        host: 'localhost', //192.168.61.155
        port: '3306',
        user: 'root',
        password: 'root',
        database: 'helpdesk'
    });

    var selQuery = "SELECT TICKET_ID,TICKET_TITLE,S.STATUS_NAME,SE.SEVERITY_NAME, T.TICKET_DESC,T.ASSIGNED_TO,T.ASSET_ID FROM HELPDESK.TICKET T, HELPDESK.SEVERITY SE, HELPDESK.PRIORITY P, HELPDESK.STATUS S WHERE T.SEVERITY_ID =  SE.SEVERITY_ID AND  T.STATUS_ID=S.STATUS_ID AND T.PRIORITY_ID = P.PRIORITY_ID AND T.TICKET_ID=?";
    connection.connect();
    if (connection != null) {
        connection.query(selQuery, ticketId, function (err, rows, fields) {
            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var ticketsDetails = 'Ticket ID: ' + json[0].TICKET_ID + '<BR> Ticket Title: ' + json[0].TICKET_TITLE + '<BR> Title Desc: ' + json[0].STATUS_NAME + '<BR> Severity: ' + json[0].SEVERITY_NAME + '<BR> Assigned To: ' + json[0].ASSIGNED_TO;
                session.send("Please find the ticket details below <BR>" + ticketsDetails);
            } else {
                session.send("There is no ticket with this ID:" + ticketId);
            }
            connection.end();
        });
    }
});
