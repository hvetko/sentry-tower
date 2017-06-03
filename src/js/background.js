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
		this.storage.storage.get('unreadIds', function (results) {
			if (results.unreadIds.length > 0) {
				chrome.browserAction.setBadgeText({text: results.unreadIds.length.toString()});
				chrome.browserAction.setBadgeBackgroundColor({color: 'red'});
			} else {
				var readCount = 0;

				$.each(results.results, function (query, result) {
					readCount += (result.count - result.unreadCount);
				});

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

	window.setInterval(runSentryTower, 100000);
});
