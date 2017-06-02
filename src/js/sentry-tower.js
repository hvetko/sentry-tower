var SentryTower = SentryTower || {};

SentryTower.APIHandler = {
	/**
	 * Return array of sentry query URLs
	 *
	 * @returns {string[]}
	 */
	getWatchURLs: function () {
		return [
			'https://sentry.gygadmin.com/api/0/projects/production/gygcore/issues/?query=is%3Aunresolved+tour_item&limit=25&sort=date&statsPeriod=24h&shortIdLookup=1',
			'https://sentry.gygadmin.com/api/0/projects/production/gygcore/issues/?query=is%3Aunresolved+tourItem&limit=25&sort=date&statsPeriod=24h&shortIdLookup=1',
			'https://sentry.gygadmin.com/api/0/projects/production/gygcore/issues/?query=is%3Aunresolved+assigned%3Ame&limit=25&sort=date&statsPeriod=24h&shortIdLookup=1',
			'', '\n'
		];
	},

	/**
	 * Run API requests
	 */
	run: function () {
		var self = this;

		$.each(self.getWatchURLs(), function (key, url) {
			if (url.trim()) {
				self.apiRequest(url);
			}
		});
	},

	/**
	 * API requester
	 *
	 * @param queryURL
	 */
	apiRequest: function (queryURL) {
		var self = this;
		var storage = SentryTower.storageHandler;
		storage.init();

		$.ajax({
			url: queryURL,
			data: {
				format: 'json'
			},
			error: function () {
				self.processError();
			},
			success: function (responseData) {
				storage.setResult(queryURL, responseData);
			},
			type: 'GET'
		});
	},

	/**
	 * Process API request error
	 *
	 * @param msg
	 */
	processError: function (msg) {
		console.error('ERROR:', msg);
	}

};

SentryTower.storageHandler = {
	storage: chrome.storage.local,
	isRunning: false,
	results: {},

	init: function () {
		this.storage.get('isRunning', function (result) {
			this.isRunning = !!(result.isRunning);
		});
	},

	/**
	 * Cleans out the search query from the query URL
	 *
	 * @param url
	 * @returns {*}
	 */
	getQuery: function (url) {
		var results = new RegExp('[\?&]query=([^&#]*)').exec(url);

		if (results === null) {
			return null;
		} else {
			return results[1] || 0;
		}
	},

	setResult: function (queryUrl, data) {
		var unreadCount = 0;

		$.each(data, function (key, value) {
			if (value.hasSeen === false) {
				unreadCount += 1;
			}
		});

		var query = this.getQuery(queryUrl);
		this.results[query] = {
			count: data.length,
			unreadCount: unreadCount,
			data: data
		};

		this.storage.set({results: this.results});
	}
};

