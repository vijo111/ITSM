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
        console.log('speech: ', speech);
        session.send(speech);
    } else {
        session.send('Sorry...not sure how to respond to that');
    }
});


intents.matches('Tickets with Status', function (session, args) {
    console.log('----> args: ', args);
    var status = '';
    var severity = '';
    var priority = '';
    if (args.entities != null) {
        console.log('--if--> type: ', args.entities.length);
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'status') {
                console.log("status--", status);
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
    console.log("status-", status);
    if (status == '' || status == null) {
        console.log("status-1", status);
        status='new';
    }
    console.log("status-2"+ status);
/*    if ((status.includes('new')) || (status.includes('open'))) {
        status = 'new';
    } else if ((status.includes('assigned'))) {
        status = 'assigned';
    } else if ((status.includes('progress'))) {
        status = 'in-progress';
    } else if ((status.includes('pending'))) {
        status = 'pending';
    } else if ((status.includes('resolved'))) {
        status = 'resolved';
    } else if ((status.includes('closed'))) {
        status = 'closed';
    } else if ((status.includes('invalid'))) {
        status = 'invalid';
    } else if ((status.includes('re-open'))) {
        status = 're-open';
    } else {
        status = 'new';
    }*/

    var connection = mysql.createConnection({
        host: 'localhost', //192.168.61.155
        port: '3306',
        user: 'root',
        password: 'root',
        database: 'helpdesk'
    });

    /*var entityIndex = session.message.text.toLowerCase();
    session.sendTyping();*/
    console.log("status-", status);

    var selQuery = "SELECT TICKET_ID,TICKET_TITLE FROM HELPDESK.TICKET T, HELPDESK.STATUS S WHERE T.STATUS_ID = S.STATUS_ID AND STATUS_NAME = ? ORDER BY SEVERITY_ID DESC";
    connection.connect();
    if (connection != null) {
        connection.query(selQuery, status, function (err, rows, fields) {
            console.log(" ------- SELECT LIST  -------- ");
            console.log(' err: ', err);
            console.log(' selQuery rows: ', rows);
            console.log(' selQuery rows: ', rows.length);


            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var tickets = '';
                for (var idx in json) {
                    var item = json[idx];
                    tickets = tickets + item.TICKET_ID + '-' + item.TICKET_TITLE + '<BR>';
                }
                session.send("Please find the below recent tickets for the status '" + status + "' <Br>" + tickets );
            }

            console.log(' Closing the DB connection ........ !');
            connection.end();
        });
    }
});


intents.matches('Tickets with Status & Priority', function (session, args) {
    console.log('----> args: ', args);
    var status = '';
    var severity = '';
    var priority = '';
    if (args.entities != null) {
        console.log('--if--> type: ', args.entities.length);
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
        status='new';
    }
    if (priority == '' || priority == null) {
        console.log("status-1", status);
        priority='critical';
    }
/*
    if ((status.includes('new')) || (status.includes('open'))) {
        status = 'new';
    } else if ((status.includes('assigned'))) {
        status = 'assigned';
    } else if ((status.includes('progress'))) {
        status = 'in-progress';
    } else if ((status.includes('pending'))) {
        status = 'pending';
    } else if ((status.includes('resolved'))) {
        status = 'resolved';
    } else if ((status.includes('closed'))) {
        status = 'closed';
    } else if ((status.includes('invalid'))) {
        status = 'invalid';
    } else if ((status.includes('re-open')) || (status.includes('reopen') || (status.includes('re-opened')))) {
        status = 're-open';
    } else {
        status = 'new';
    }


    if ((priority.includes('low')) || (severity.includes('low priority'))) {
        priority = 'low';
    } else if ((priority.includes('medium')) || (severity.includes('medium priority'))) {
        priority = 'medium';
    } else if ((priority.includes('high')) || (severity.includes('high priority'))) {
        priority = 'high';
    } else if ((priority.includes('critical')) || (severity.includes('Critical priority'))) {
        priority = 'critical';
    }
*/
    var connection = mysql.createConnection({
        host: 'localhost', //192.168.61.155
        port: '3306',
        user: 'root',
        password: 'root',
        database: 'helpdesk'
    });

    console.log("status-", status);
    console.log("priority-", priority);
    console.log("severity-", severity);

    var params = [status, priority];
    var selQuery = "SELECT TICKET_ID,TICKET_TITLE FROM HELPDESK.TICKET T, HELPDESK.PRIORITY P, HELPDESK.STATUS S WHERE T.PRIORITY_ID =  P.PRIORITY_ID  AND T.STATUS_ID=S.STATUS_ID AND S.STATUS_NAME = ? AND P.PRIORITY_NAME = ?  ORDER BY SEVERITY_ID DESC";
    connection.connect();
    if (connection != null) {
        connection.query(selQuery, params, function (err, rows) {
            console.log(" ------- SELECT LIST  -------- ");
            console.log(' err: ', err);
            console.log(' selQuery rows: ', rows);
            if (err) {
                console.log('error', err.message);
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
                console.log('tickets:', tickets);
                session.send("Please find the below " + priority + " priority tickets for the status " + status + ". <Br>" + tickets + '-');
            } else {
                session.send("You dont have any tickets.");
            }

            console.log(' Closing the DB connection ........ !');
            connection.end();
        });
    }
});


intents.matches('Tickets with Status & Severity', function (session, args) {
    console.log('----> args: ', args);
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
        status='new';
    }
    if (severity == '' || severity == null) {
        console.log("status-1", status);
        severity='critical';
    }
    /*
    if ((status.includes('new')) || (status.includes('open'))) {
        status = 'new';
    } else if ((status.includes('assigned'))) {
        status = 'assigned';
    } else if ((status.includes('progress'))) {
        status = 'in-progress';
    } else if ((status.includes('pending'))) {
        status = 'pending';
    } else if ((status.includes('resolved'))) {
        status = 'resolved';
    } else if ((status.includes('closed'))) {
        status = 'closed';
    } else if ((status.includes('invalid'))) {
        status = 'invalid';
    } else if ((status.includes('re-open')) || (status.includes('reopen') || (status.includes('re-opened')))) {
        status = 're-open';
    } else {
        status = 'new'
    }

    if (severity.includes('low')) {
        console.log("if-low")
    } else {
        console.log("else")
    }

    if ((severity.includes('low') || (severity.includes('low severity')))) {
        severity = 'low';
    } else if ((severity.includes('medium')) || (severity.includes('medium severity'))) {
        severity = 'medium';
    } else if ((severity.includes('high')) || (severity.includes('high severity'))) {
        severity = 'high';
    } else if ((severity.includes('critical')) || (severity.includes('critical severity'))) {
        severity = 'critical';
    } else {
        severity = 'critical';
    }
*/
    var connection = mysql.createConnection({
        host: 'localhost', //192.168.61.155
        port: '3306',
        user: 'root',
        password: 'root',
        database: 'helpdesk'
    });
    console.log("status-", status);
    console.log("priority-", priority);
    console.log("severity-", severity);
    /*var entityIndex = session.message.text.toLowerCase();
    session.sendTyping();*/
    var params = [status, severity];
    var selQuery = "SELECT TICKET_ID,TICKET_TITLE FROM HELPDESK.TICKET T, HELPDESK.SEVERITY SE , HELPDESK.STATUS S WHERE T.SEVERITY_ID =  SE.SEVERITY_ID AND  T.STATUS_ID=S.STATUS_ID AND S.STATUS_NAME = ?  AND  SE.SEVERITY_NAME = ? ORDER BY T.PRIORITY_ID DESC";
    connection.connect();
    if (connection != null) {
        connection.query(selQuery, params, function (err, rows) {
            console.log(" ------- SELECT LIST  -------- ");
            console.log(' err: ', err);
            console.log(' selQuery rows: ', rows);
            console.log(' selQuery rows length: ', rows.length);

            if (err) {
                console.log('error', err.message);
                throw err;
            }
            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var tickets = '';
                for (var idx in json) {
                    var item = json[idx];
                    tickets = tickets + item.TICKET_ID + '-' + item.TICKET_TITLE + '<BR>';
                    console.log('$$$ item: ', item);
                }
                session.send("Please find the below " + severity + "severity tickets for the status " + status + ". <Br>" + tickets + '-');
            } else {
                session.send("You dont have any tickets.");
            }
            console.log(' Closing the DB connection ........ !');
            connection.end();
        });
    }
});


intents.matches('getMyAssignedTickets', function (session, args) {
    console.log('----> args: ', args);
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

    if ((status.includes('new')) || (status.includes('open'))) {
        status = 'new';
    } else if ((status.includes('assigned'))) {
        status = 'assigned';
    } else if ((status.includes('progress'))) {
        status = 'in-progress';
    } else if ((status.includes('pending'))) {
        status = 'pending';
    } else if ((status.includes('resolved'))) {
        status = 'resolved';
    } else if ((status.includes('closed'))) {
        status = 'closed';
    } else if ((status.includes('invalid'))) {
        status = 'invalid';
    } else if ((status.includes('re-open')) || (status.includes('reopen') || (status.includes('re-opened')))) {
        status = 're-open';
    } else {
        status = 'new'
    }

    if (severity.includes('low')) {
        console.log("if-low")
    } else {
        console.log("else")
    }

    if ((severity.includes('low') || (severity.includes('low severity')))) {
        severity = 'low';
    } else if ((severity.includes('medium')) || (severity.includes('medium severity'))) {
        severity = 'medium';
    } else if ((severity.includes('high')) || (severity.includes('high severity'))) {
        severity = 'high';
    } else if ((severity.includes('critical')) || (severity.includes('critical severity'))) {
        severity = '%';
    }

    if ((priority.includes('low') || (priority.includes('low priority')))) {
        priority = 'low';
    } else if ((priority.includes('medium')) || (priority.includes('medium priority'))) {
        severity = 'medium';
    } else if ((priority.includes('high')) || (priority.includes('high priority'))) {
        priority = 'high';
    } else if ((priority.includes('critical')) || (priority.includes('critical priority'))) {
        priority = 'critical';
    } else {
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
    var selQuery = "SELECT * FROM HELPDESK.TICKET T, HELPDESK.STATUS S,  HELPDESK.SEVERITY SE, HELPDESK.PRIORITY P WHERE T.STATUS_ID = S.STATUS_ID AND T.SEVERITY_ID =  SE.SEVERITY_ID AND  T.PRIORITY_ID = P.PRIORITY_ID AND S.STATUS_NAME LIKE ? AND SE.SEVERITY_NAME LIKE ? AND P.PRIORITY_NAME LIKE ? AND T.ASSIGNED_TO = ? ORDER BY T.SEVERITY_ID DESC";
    connection.connect();
    if (connection != null) {
        //connection.query(selQuery, status, severity, function (err, rows, fields) {
        connection.query(selQuery, params, function (err, rows) {
            console.log(" ------- SELECT LIST  -------- ");
            console.log(' err: ', err);
            console.log(' selQuery rows: ', rows);
            console.log(' selQuery rows length: ', rows.length);
            if (err) {
                console.log('error', err.message);
                throw err;
            }
            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var tickets = '';
                for (var idx in json) {
                    var item = json[idx];
                    tickets = tickets + item.TICKET_ID + '-' + item.TICKET_TITLE + '<BR>';
                    console.log('$$$ item: ', item);
                }
                session.send("Please find the below " + severity + " priority tickets for the status " + status + ". <Br>" + tickets + '-');
            } else {
                session.send("You dont have any tickets.");
            }
            console.log(' Closing the DB connection ........ !');
            connection.end();
        });
    }
});


intents.matches('getTicketDetailsByID', function (session, args) {
    console.log('----> args: ', args);
    var ticketId = '';
    var severity = '';
    var priority = '';
    if (args.entities != null) {
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'ticketid') {
                ticketId = args.entities[i].entity;
                console.log('ticketId ', args.entities[i].entity);
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

    /*var entityIndex = session.message.text.toLowerCase();
    session.sendTyping();*/
    console.log('ticketId ', ticketId);
    var selQuery = "SELECT TICKET_ID,TICKET_TITLE,S.STATUS_NAME,SE.SEVERITY_NAME, T.TICKET_DESC,T.ASSIGNED_TO,T.ASSET_ID FROM HELPDESK.TICKET T, HELPDESK.SEVERITY SE, HELPDESK.PRIORITY P, HELPDESK.STATUS S WHERE T.SEVERITY_ID =  SE.SEVERITY_ID AND  T.STATUS_ID=S.STATUS_ID AND T.PRIORITY_ID = P.PRIORITY_ID AND T.TICKET_ID=?";
    connection.connect();
    if (connection != null) {
        connection.query(selQuery, ticketId, function (err, rows, fields) {
            console.log(" ------- SELECT LIST  -------- ");
            console.log(' err: ', err);
            console.log(' selQuery rows: ', rows);
            console.log(' selQuery rows length: ', rows.length);

            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var ticketsDetails = 'Ticket ID: ' + json[0].TICKET_ID + '<BR> Ticket Title: ' + json[0].TICKET_TITLE + '<BR> Title Desc: ' + json[0].STATUS_NAME + '<BR> Severity: ' + json[0].SEVERITY_NAME + '<BR> Assigned To: ' + json[0].ASSIGNED_TO;

                session.send("Please find the ticket details below <BR>" + ticketsDetails);
            } else {

                session.send("There is no ticket with this ID:" + ticketId);
            }
            console.log(' Closing the DB connection ........ !');
            connection.end();
        });
    }
});
