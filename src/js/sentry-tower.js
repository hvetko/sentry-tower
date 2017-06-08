var SentryTower = SentryTower || {};

if (typeof disableNotifications != 'undefined') {
	console.log('disableNotifications', disableNotifications);
}

SentryTower.APIHandler = {
	watchUrls: [],
	apiVersionURL: '/api/0/',

	/**
	 * Run API requests
	 */
	run: function () {
		var self = this;

		SentryTower.storageHandler.storage.get(['sentryQueries'], function (result) {
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
		console.log('---', query.query);
		var self = this;

		$.ajax({
			url: query.apiUrl,
			data: {
				format: 'json'
			},
			error: function (responseData) {
				self.processError(responseData);
			},
			success: function (responseData) {
				SentryTower.storageHandler.setResult(query, responseData);
			},
			type: 'GET'
		});
	},

	/**
	 * Process API request error
	 *
	 * @param data
	 */
	processError: function (data) {
		SentryTower.errorHandler.error('API request failed', data);
	}
};

SentryTower.storageHandler = {
	storage: chrome.storage.local,
	isRunning: false,
	unreadIds: [],
	results: {},

	init: function () {
		this.storage.get(['isRunning'], function (result) {
			this.isRunning = !!(result.isRunning);
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

		var self = this;

		var queryUrl = query.apiUrl;
		var queryProject = query.project;
		var intersect = [];
		var newUnreadIds = [];
		var unreadMap = {};
		var unreadCount = 0;

		if (data.length) {
			$.each(data, function (key, value) {
				if (value.hasSeen === false) {
					unreadCount++;
					newUnreadIds.push(value.id);

					unreadMap[value.id] = query.query;
				} else {
					var elementIndex = self.unreadIds.indexOf(value.id);
					if (elementIndex > -1) {
						self.unreadIds.splice(elementIndex, 1);
					}
				}
			});

			newUnreadIds = uniqueArray(newUnreadIds);
			intersect = arrayIntersect(this.unreadIds, newUnreadIds);
			//TODO: refactor notification to be grouped by query
			SentryTower.notificationHandler.showNewUnreadErrorNotification(intersect, unreadMap);
		}

		//TODO: remove deleted queries
		if (!this.results[queryProject]) {
			this.results[queryProject] = {};
		}

		this.results[queryProject][queryUrl] = {
			count: data.length,
			unreadCount: unreadCount,
			data: data,
			query: query
		};

		this.storage.set({results: this.results});

		SentryTower.backgroundHandler.updateBadge(true);
	}
};

SentryTower.notificationHandler = {
	showNewUnreadErrorNotification: function (errorIdArray, unreadMap) {
		var showNotification = true;
		if (typeof stopNotification !== 'undefined' && stopNotification === true) {
			showNotification = false;
			console.log('provera', stopNotification);
		}

		if (showNotification) {
			$.each(errorIdArray, function (key, errorId) {
				chrome.notifications.create({
					type: 'basic',
					iconUrl: '../img/tower.png',
					title: 'Sentry Tower Alert!',
					message: 'Found error for query:\n"' + unreadMap[errorId] + '"'
				});
			});
		}
	}
};

SentryTower.errorHandler = {
	error: function (msg, data) {
		if (!data) {
			data = '';
		}

		console.error('ERROR >>> ' + msg, data);
		this.stacktrace();
		SentryTower.logger.error(msg + JSON.stringify(data));
	},

	stacktrace: function () {
		console.error(new Error().stack);
	}
};

SentryTower.logger = {
	addToLog: function (type, message) {
		var dateKey = new Date;
		SentryTower.storageHandler.storage.get(['log'], function (items) {
			items.log[dateKey] = '[' + type + '] ' + message;
			SentryTower.storageHandler.storage.set({log: items.log});
		});
	},

	emptyLog: function () {
		SentryTower.storageHandler.storage.set({log: {}});
	},

	error: function (message) {
		this.addToLog('ERROR', message);
	},

	info: function (message) {
		this.addToLog('INFO', message);
	}
};
