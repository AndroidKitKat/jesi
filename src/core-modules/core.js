var jModule = {
	"name": "IRC Core",
	"description": "Core IRC client functionality",
	"core": true
};

function registerClient(msgData) {
	const pass = serverInfo.pass;
	const realname = serverInfo.user.realname;
	const ident = serverInfo.user.ident;
	const nick = serverInfo.user.nick;

	if (pass)
		ircWriter.sendCommand('PASS', pass);

	ircWriter.sendCommand('NICK', nick);
	ircWriter.sendCommand('USER', [ident, '*', '*', realname]);
}

function doPong(msgData) {
	ircWriter.sendCommand('PONG', msgData.params[0]);
}

addPreInit('registerClient');
addHook('PING', 'doPong');
