module.exports = function(server, sessionParser, store) {
	var	cookie = require('cookie'),
		cookieParser = require('cookie-parser'),
		WebSocket = require('ws'),
		Player = require('./models/PlayerModel').model;

	const logger = require('loggy');

	let wss = new WebSocket.Server({
			verifyClient: function(info, done) {
				logger.log('verifyClient() -> ', info.req.session, info.req.headers);

				if (info.req.headers.cookie || info.req.session) {
					done(info.req);
				}
			},
			server
		}),
		CLIENTS = [];

	wss.broadcast = function broadcast(data, sid, all = true) {
		logger.log('broadcast() -> ', data, sid, all);
		wss.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				if (all || client !== CLIENTS[sid]) {
					client.send(JSON.stringify(data));
				}
			}
		});
	};

	wss.on('connection', function connection(ws, req) {
		let parseCookie = cookie.parse(req.headers.cookie)['connect.sid'],
			sid = cookieParser.signedCookie(parseCookie, '$eCuRiTy');

		logger.log('Connection accepted:', req.headers, req.session);
		logger.log(`Clients Connected: ${wss.clients.size}`);

		logger.log('sid -> ', sid);

		// Save sessionID against the array of
		// clients so we can reference later
		CLIENTS[sid] = ws;

		ws.send(JSON.stringify({ action: 'connected', type: 'global' }));

		// This is the most important callback for us, we'll handle
		// all messages from users here.
		ws.on('message', function(message) {
			var data = JSON.parse(message),
				query = {
					sessionId: sid
				};

			// Process WebSocket message
			logger.log('Message received: ', data);

			switch (data.action) {
				case 'whoami':
					logger.info('websocket:onmessage:whoami -> ', query, sid);

					Player.find(query)
						.select('+sessionId +cardsInHand')
						.exec()
						.then(function(list) {
							let nuts = { action: 'whoami', type: 'players', nuts: list };

							ws.send(JSON.stringify(nuts));
						})
						.catch(function(err) {
							logger.error(err);
						});
					break;

				default:
					wss.broadcast(data);
					break;
			}
		});

		ws.on('error', function(err) {
			logger.error(err);
		});

		ws.on('close', function(connection) {
			// close user connection
			logger.info('Connection Closed:', connection);
		});
	});

	global.wss = wss;

	return wss;
};
