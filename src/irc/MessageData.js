import IRC3Tag from './IRC3Tag';

export default class MessageData {
	constructor(data) {
		this.valid = false;
		if (typeof data !== 'string') {
			this.raw = '';
			return;
		}

		this.raw = data;
		this.prefix = '';
		this.command = '';
		this.params = [];
		this.tail = '';
		this.tags = {};
	}

	async parse() {
		const words = this.raw
			.trim()
			.split(' ')
			.filter(this.isWordValid);

		if (typeof words === 'undefined' || words == null || words.length === 0)
			return;

		let cmdIndex = this.getCommandIndex(words);
		await Promise.all([
			this.parsePrefix(words, cmdIndex),
			this.parseTags(words, cmdIndex),
			this.parseCommand(words, cmdIndex),
			this.parseParamsAndTail(words, cmdIndex)
		]);

		if ((typeof this.command === 'string' &&
		     typeof this.params === 'object' &&
		     typeof this.tail === 'string') ||
		    (this.command.length > 0 &&
		     this.params.length > 0 &&
		     this.tail.length > 0))
			this.valid = true;
	}

	isWordValid(word) {
		// TODO: Add more checks
		return typeof word === 'string' && word !== null && word.length > 0;
	}

	getCommandIndex(words) {
		// Just take the first all-caps word for now
		for (let i = 0; i < words.length; i++) {
			let match = words[i].match(/[A-Z|0-9]/g);
			if (match && match.length === words[i].length)
				return i;
		}
	}

	// TODO: These algorithms should be improved as needed

	async parsePrefix(words, cmdIndex) {
		if (cmdIndex > 0)
			this.prefix = words[cmdIndex - 1];
	}

	async parseTag(rawTag) {
		const isClient = rawTag[0] === '+';
		const tagAndKey = rawTag.split('=');
		const vendorAndKeyName = tagAndKey.split('/');
		var tagValue = tagAndKey[0];
		if (isClient)
			tagValue = tagValue.splice(1);

		const tag = new IRC3Tag({
			tag: tagAndKey[0],
			vendor: vendorAndKeyName[0],
			keyName: vendorAndKeyName[1],
			isClient: isClient
		});
		this.tags[tagValue] = tag;
	}

	async parseTags(words, cmdIndex) {
		if (cmdIndex > 1)
			var rawTags = words[cmdIndex - 2];
		else
			return;

		if (rawTags[0] !== '@')
			return;

		tagList = rawTags.slice(1).split(';');
		await tagList.forEach(parseTag);
	}

	async parseCommand(words, index) {
		this.command = words[index];
	}

	async parseParamsAndTail(words, cmdIndex) {
		for (var i = cmdIndex + 1; i < words.length && words[i][0] != ':'; i++)
			this.params.push(words[i]);

		let raw = this.raw;
		let tail = raw.slice(raw.indexOf(words[i]) + 1).trim();
		this.params.push(tail);
		this.tail = tail;
	}
}