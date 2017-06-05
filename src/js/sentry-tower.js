var SentryTower = SentryTower || {};

SentryTower.APIHandler = {
	storage: null,
	watchUrls: [],
	apiVersionURL: '/api/0/',

	init: function () {
		this.storage = SentryTower.storageHandler;
	},

	/**
	 * Run API requests
	 */
	run: function () {
		var self = this;

		self.storage.storage.get(['sentryQueries'], function (result) {
			var watchUrls = result.sentryQueries;

			if (watchUrls.length > 0) {
				$.each(watchUrls, function (key, query) {
					self.apiRequest(query);
				});
			}
		});
	},

	/**
	 * API requester
	 *
	 * @param query
	 */
	apiRequest: function (query) {
		var self = this;
		var queryURL = query.apiUrl;
		console.log(queryURL);

		$.ajax({
			url: queryURL,
			data: {
				format: 'json'
			},
			error: function () {
				self.processError();
			},
			success: function (responseData) {
				self.storage.setResult(query, responseData);
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
			if (result.unreadIds && result.unreadIds.length > 0) {
				this.unreadIds = result.unreadIds;
			} else {
				this.unreadIds = [];
			}
		});
	},

	/**
	 *
	 * @param query
	 * @param data
	 */
	setResult: function (query, data) {
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

		var queryUrl = query.apiUrl;
		var queryProject = query.project;
		var newUnreadIds = [];
		var unreadCount = 0;

		if (data.length) {
			$.each(data, function (key, value) {
				if (value.hasSeen === false) {
					unreadCount++;
					newUnreadIds.push(value.id);
				}
			});

			newUnreadIds = uniqueArray(newUnreadIds);

			var intersect = arrayIntersect(this.unreadIds, newUnreadIds);
			// console.log('----unreads', intersect.length);
			this.showNewUnreadErrorNotification(intersect);
			this.unreadIds = uniqueArray(this.unreadIds.concat(newUnreadIds));
		}

		if (!this.results[queryProject]) {
			this.results[queryProject] = {};
		}

		this.results[queryProject][queryUrl] = {
			count: data.length,
			unreadCount: unreadCount,
			data: data,
			query: query
		};

		// console.log('total: ', this.unreadIds.length);
		// console.log(this.unreadIds);
		console.log(this.results);
		this.storage.set({results: this.results});
		this.storage.set({unreadIds: this.unreadIds});

		var background = SentryTower.backgroundHandler;
		background.updateBadge();
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

