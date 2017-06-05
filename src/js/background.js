var SentryTower = SentryTower || {};

SentryTower.backgroundHandler = {
	storage: null,
	colorUnread: 'red',
	colorRead: 'blue',

	init: function () {
		this.storage = SentryTower.storageHandler;
		this.storage.init();
	},

	/**
	 * Run background tasks
	 */
	run: function () {
		this.updateBadge();
		var client = SentryTower.APIHandler;
		client.init();
		client.run();
	},

	/**
	 * Updates badge count to number from storage
	 */
	updateBadge: function () {
		var self = this;
		this.enableIcon();

		this.storage.storage.get(['unreadIds', 'results'], function (results) {
			if (results.unreadIds && results.unreadIds.length > 0) {
				chrome.browserAction.setBadgeText({text: results.unreadIds.length.toString()});
				chrome.browserAction.setBadgeBackgroundColor({color: self.colorUnread});
			} else {
				var readCount = 0;
				$.each(results.results, function (query, result) {
					readCount += (result.count - result.unreadCount);
				});

				chrome.browserAction.setBadgeText({text: readCount.toString()});
				chrome.browserAction.setBadgeBackgroundColor({color: self.colorRead});
			}
		});
	},

	/**
	 * Disable browser icon button
	 */
	disableIcon: function () {
		chrome.browserAction.setBadgeText({text: ''});
		chrome.browserAction.setIcon({path: '../img/tower-off.png'});
	},

	/**
	 * Enable browser icon button
	 */
	enableIcon: function () {
		chrome.browserAction.setIcon({path: '../img/tower.png'});
	}
};


$(document).ready(function () {
	var background = SentryTower.backgroundHandler;
	background.init();

	function runSentryTower() {
		if (background.storage.isRunning) {
			background.run();
		} else {
			background.disableIcon();
		}

		//TODO: remove once switch is activated
		background.run();
	}

	runSentryTower();

	background.storage.storage.get(['sentryOptions'], function (result) {
		var interval = 60000;

		if (result.sentryOptions.sentryCheckInterval) {
			interval = result.sentryOptions.sentryCheckInterval;
		}

		window.setInterval(runSentryTower, interval);
	});
});
