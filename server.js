var express = require('express'),
	http = require('http'),
	path = require('path');
var app = module.exports = express();
var cors = require('cors');
app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'))
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(cors());
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.cookieSession({
	secret: process.env.COOKIE_SECRET || "Superdupersecret"
}));

var Q = require('q');

app.set('port', process.env.PORT || 3000);
http.createServer(app).listen(app.get('port'), null, function() {
	console.log("Express server listening on port " + app.get('port'));
});


var getAllRecipients = function() {
	return function(req, res, next) {

		var deferred = Q.defer();
		var mailingList = [];

		var GoogleSpreadsheet = require("google-spreadsheet");

		var my_sheet = new GoogleSpreadsheet('0Ahd8qX2N03BadG9PbXBsbGdNMzdaNC1DVURjbkZqeUE');

		// set auth to be able to edit/add/delete
		my_sheet.setAuth('node.newsletter@gmail.com', '0e9fee79-0580-4f45-bc8b-beec0962441e', function(err) {
			my_sheet.getInfo(function(err, sheet_info) {
				if (!err) {
					console.log(sheet_info.title + ' is loaded');
					// use worksheet object if you want to forget about ids
					sheet_info.worksheets[0].getRows(function(err, rows) {
						console.log(rows);
						rows.forEach(function(row) {
							mailingList.push(row['e-mail']);
						})
						res.json(rows);
						deferred.resolve(mailingList);
					})
				} else {
					deferred.reject(err);
					res.payload({
						"payload": "Invalid Request"
					});
				}
			});
		})
		return deferred.promise;
	}
}

var newsLetterHandler = function() {
	return function(req, res, next) {
		getAllRecipients()(req, res, next).then(function(resp) {
			resp.forEach(function(mailAddr) {
				sendMail(mailAddr)(req, res, next);
			})
		});
	}
}



var sendMail = function(resp) {
	return function(req, res, next) {

		var nodemailer = require("nodemailer");

		var payload = '<tbody style="max-width:500px;text-align:center;display:block;margin-left:33%"><tr> \
	<td> \
	<p style="font-size:17px;line-height:24px;font-family:Georgia,"Times New Roman",Times,serif;color:#333;margin:0px"> \
	<a name="14497f12be80dcce_14497edf9b10096f_14497be839a28543_14497bd3c3e70a9a_h_tit_1_1_nuke" href="http://links.mailing.greenpeace.org/ctt?kn=14&amp;ms=NDUyODAzNzAS1&amp;r=NzAzMzYxMTE0S0&amp;b=0&amp;j=NDAwNzE3MTMxS0&amp;mt=1&amp;rt=0" target="_blank"> \
	<img src="https://ci4.googleusercontent.com/proxy/kzdeU1gjruGxAAlXq8pn8iev5p0MKDgessn5FerQjeung7iATXFiFUMcJbuVMNyMG8B3ZfzErz7eCdofmzxuti141Yr-YB_5vHXnTDO0ZEYZRv3t=s0-d-e1-ft#http://static1.greenpeace.fr/newsletter/20140305-NL/header.jpg" height="235" alt="" style="border:0" width="624"> \
	</a> \
	</p> \
	<p style="font-size:17px;line-height:0px;font-family:Georgia,"Times New Roman",Times,serif;color:#333;margin:0px"><img src="https://ci3.googleusercontent.com/proxy/ntOIOKo581-MQ-gFHGGkdGe7QssKMZ7bJ79g1mV3Wn66x81i6Xo9eyJw5LuOwdv88mxD5hGhaCRDGNrTsLZKqhRW8QPcA8crQYMmZb77UqMJHK1iTsCOYSoUk-mrJCfnVHM=s0-d-e1-ft#http://static1.greenpeace.fr/newsletter/2013-NLNVSTATIC/icons/spacer-ten.jpg" height="10" width="624"></p> \
	<h2 style="font-weight:normal;font-size:32px;font-family:Verdana,Geneva,Arial,Helvetica,sans-serif;color:#58b006!important;margin:0px;line-height:36px">Énergie : les centrales européennes ont vieilli. Trop vieilli.</h2> \
	<p style="font-size:12px;line-height:18px;font-family:Verdana,Geneva,Arial,Helvetica,sans-serif;color:#333;margin:0px"><br>Ce 5 mars au matin, dans six pays européens (France, Suède, Belgique, Espagne, Pays-Bas et Suisse), 240 militants de Greenpeace ont pris part à des actions pour mettre en lumière les risques liés au vieillissement des centrales nucléaires. \
	<br><br> \
	<a name="14497f12be80dcce_14497edf9b10096f_14497be839a28543_14497bd3c3e70a9a_h_ttt_1_1_nuke" href="http://links.mailing.greenpeace.org/ctt?kn=12&amp;ms=NDUyODAzNzAS1&amp;r=NzAzMzYxMTE0S0&amp;b=0&amp;j=NDAwNzE3MTMxS0&amp;mt=1&amp;rt=0" style="color:#467f0d;text-decoration:none" target="_blank">Revivre les actions et AGIR</a> \
	<br><br> \
	<a name="14497f12be80dcce_14497edf9b10096f_14497be839a28543_14497bd3c3e70a9a_h_tac_1_1_main" href="http://links.mailing.greenpeace.org/ctt?kn=10&amp;ms=NDUyODAzNzAS1&amp;r=NzAzMzYxMTE0S0&amp;b=0&amp;j=NDAwNzE3MTMxS0&amp;mt=1&amp;rt=0" style="color:#467f0d;text-decoration:none" target="_blank">Partagez nos actions et suivez nos actualités</a> \
	</p> \
	</td> \
	</tr> \
	</tbody>';


		var seperatorPayload = '<table cellspacing="0" border="0" cellpadding="0" width="624"> \
	<tbody><tr> \
	<td valign="top" height="40" width="624"> \
	<p><img src="http://static1.greenpeace.fr/newsletter/2013-NLNVSTATIC/icons/line-break.jpg" height="10" width="624"></p> \
	</td> \
	</tr> \
	</tbody></table>';


		var payloadContainer = req.body.payload;
		var newsLetterDepth = payloadContainer.length,
			mailBodyContainer = [];


		var cheerio = require('cheerio');

		for (var ctr = 0; ctr < newsLetterDepth; ctr++) {
			$ = cheerio.load(payload);
			$('img').attr('src', payloadContainer[ctr].imgURL).parent('a').attr('href', payloadContainer[ctr].link);
			$('p').last().text(payloadContainer[ctr].article);
			$('h2').text(payloadContainer[ctr].title);
			payloadContainer.push($.html());
		}

		var mailGlobalString = "";

		var ctr = 0;

		payloadContainer.forEach(function(dom) {
			if (ctr > 0)
				mailGlobalString += seperatorPayload;
			mailGlobalString += dom;
		})

		// This is probably the dirtiest line of code I have commited in years.
		mailGlobalString = mailGlobalString.replace(/\[object Object\]/g, '');


		// create reusable transport method (opens pool of SMTP connections)
		var smtpTransport = nodemailer.createTransport("SMTP", {
			service: "Gmail",
			auth: {
				user: "node.newsletter@gmail.com",
				pass: "0e9fee79-0580-4f45-bc8b-beec0962441e"
			}
		});

		// setup e-mail data with unicode symbols
		var mailOptions = {
			from: "NewsLetter ✔ <node-newsletter@gmail.com>", // sender address
			to: resp, // list of receivers
			subject: "NewsLetter", // Subject line
			text: mailGlobalString, // plaintext body
			html: mailGlobalString // html body
		};

		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions, function(error, response) {
			if (error) {
				console.log(error);
			} else {
				console.log("Message sent: " + response.message);
			}
			// if you don't want to use this transport object anymore, uncomment following line
			//smtpTransport.close(); // shut down the connection pool, no more messages
		});
	}
}


app.get('/recipients/all', getAllRecipients());


app.post('/send_mail', newsLetterHandler());