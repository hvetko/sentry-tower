var SentryTower = SentryTower || {};

SentryTower.backgroundHandler = {
	storage: null,

	init: function () {
		this.storage = SentryTower.storageHandler;
		this.storage.init();
	},

	run: function () {
		this.updateBadge();
		var client = SentryTower.APIHandler;
		client.run();
	},

	updateBadge: function () {
		this.storage.storage.get('results', function (results) {
			var unreadCount = 0;
			var readCount = 0;

			$.each(results.results, function (query, result) {
				unreadCount += result.unreadCount;
				readCount += (result.count - result.unreadCount);
			});

			if (unreadCount > 0) {
				chrome.browserAction.setBadgeText({text: unreadCount.toString()});
				chrome.browserAction.setBadgeBackgroundColor({color: 'red'});
			} else {
				chrome.browserAction.setBadgeText({text: readCount.toString()});
				chrome.browserAction.setBadgeBackgroundColor({color: 'blue'});
			}
		});
	}
};


$(document).ready(function () {
	function runSentryTower() {
		var background = SentryTower.backgroundHandler;
		background.init();

		if (background.storage.isRunning) {
			background.run();
		}

		background.run();
	}

	runSentryTower();

	window.setInterval(runSentryTower, 10000);
});
