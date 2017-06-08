var SentryTower = SentryTower || {};

SentryTower.backgroundHandler = {
	colorUnread: 'red',
	colorRead: 'blue',

	/**
	 * Run background tasks
	 */
	run: function () {
		SentryTower.storageHandler.storage.get(['isTowerRunning'], function (results) {
			if (results.isTowerRunning) {
				SentryTower.backgroundHandler.updateBadge(true);
				SentryTower.APIHandler.run();
			} else {
				SentryTower.backgroundHandler.updateBadge(false);
			}
		});
	},

	/**
	 * Updates badge count to number from storage
	 */
	updateBadge: function (isTowerRunning) {
		if (isTowerRunning) {
			this.enableIcon();

			SentryTower.storageHandler.storage.get(['results'], function (storageResults) {
				var unreadCount = 0;
				var readCount = 0;

				console.log(storageResults.results);

				$.each(storageResults.results, function (i, resultsPerProject) {
					$.each(resultsPerProject, function (project, projectResults) {
						$.each(projectResults.data, function (i, result) {
							if(result.hasSeen) {
								readCount++;
							} else {
								unreadCount++;
							}
						});
					});
				});

				if (unreadCount > 0) {
					chrome.browserAction.setBadgeText({text: unreadCount.toString()});
					chrome.browserAction.setBadgeBackgroundColor({color: SentryTower.backgroundHandler.colorUnread});
				} else {
					chrome.browserAction.setBadgeText({text: readCount.toString()});
					chrome.browserAction.setBadgeBackgroundColor({color: SentryTower.backgroundHandler.colorRead});
				}
			});
		} else {
			this.disableIcon();
		}
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
	SentryTower.backgroundHandler.run();

	SentryTower.storageHandler.storage.get(['sentryOptions'], function (result) {
		var interval = 60000;

		if (result.sentryOptions.sentryCheckInterval) {
			interval = result.sentryOptions.sentryCheckInterval;
		}

		window.setInterval(SentryTower.backgroundHandler.run, interval);
	});
});
