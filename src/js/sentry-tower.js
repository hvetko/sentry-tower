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
			'https://sentry.gygadmin.com/api/0/projects/production/gygcore/issues/?query=is%3Aunresolved+tour_to_location&limit=25&sort=date&statsPeriod=24h&shortIdLookup=1',
			'https://sentry.gygadmin.com/api/0/projects/production/gygcore/issues/?query=is%3Aunresolved+tourItem&limit=25&sort=date&statsPeriod=24h&shortIdLookup=1',
			'https://sentry.gygadmin.com/api/0/projects/production/gygcore/issues/?query=is%3Aunresolved+assigned%3Ame&limit=25&sort=date&statsPeriod=24h&shortIdLookup=1',
			'',
			'\n'
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
	 * TODO
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
	unreadIds: [],
	results: {},

	init: function () {
		this.storage.get(['isRunning', 'unreadIds'], function (result) {
			this.isRunning = !!(result.isRunning);
			if (result.unreadIds.length > 0) {
				this.unreadIds = result.unreadIds;
			}
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
		/**
		 *
		 * @param a
		 *
		 * @returns {Array}
		 */
		function uniqueArray(a) {
			var temp = {};
			for (var i = 0; i < a.length; i++) {
				temp[a[i]] = true;
			}

			var r = [];
			for (var k in temp) {
				if (k > 0) {
					r.push(k);
				}
			}

			return r;
		}

		/**
		 *
		 * @param arr1
		 * @param arr2
		 *
		 * @returns {Array}
		 */
		function arrayIntersect(arr1, arr2) {
			var arr = [];

			for (var i = 0; i < arr2.length; i++) {
				if (!arr1.includes(arr2[i])) {
					arr.push(arr2[i]);
				}
			}

			return arr;
		}


		if (data.length) {
			var newUnreadIds = [];
			var unreadCount = 0;

			$.each(data, function (key, value) {
				if (value.hasSeen === false) {
					unreadCount++;
					newUnreadIds.push(value.id);
				}
			});

			newUnreadIds = uniqueArray(newUnreadIds);

			var intersect = arrayIntersect(this.unreadIds, newUnreadIds);
			this.showNewUnreadErrorNotification(intersect);

			var query = this.getQuery(queryUrl);
			this.results[query] = {
				count: data.length,
				unreadCount: unreadCount,
				data: data
			};

			this.unreadIds = newUnreadIds;
			this.storage.set({results: this.results});
			this.storage.set({unreadIds: newUnreadIds});
		}
	},

	showNewUnreadErrorNotification: function (errorIdArray) {
		var errorCount = errorIdArray.length;
		if (errorCount > 0) {
			chrome.notifications.create('reminder', {
				type: 'basic',
				iconUrl: '../img/tower.png',
				title: 'Sentry Tower Alert!',
				message: 'Found ' + errorCount + ' new errors.'
			}, function (notificationId) {
			});
		}
	}
};

