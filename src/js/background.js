function BackgroundHandler() {

	/**
	 * Run background tasks
	 *
	 * //TODO: Too big and too nested. Refactor one day
	 */
	this.run = function () {
		chrome.storage.local.get({
			'isTowerRunning': false,
			'sentryOptions': {},
			'sentryQueries': [],
			'alertedIds': []
		}, function (items) {
			if (items.isTowerRunning) {
				chrome.browserAction.setIcon({path: '../img/sentry-tower.png'});

				var sentryQueries = items.sentryQueries;
				var unreadCount = 0;
				var readCount = 0;

				$.each(sentryQueries, function (project, /* Array<Query> */ queries) {
					$.each(queries, function (text, /* Query */ query) {
						$.ajax({
							url: query.queryApiUrl,
							data: {
								format: 'json'
							},
							headers: {
								"Authorization": "Bearer " + items.sentryOptions.sentryToken
							},
							error: function (responseData) {
								console.error(responseData);
							},
							success: function (responseData) {
								sentryQueries[project][text]['results'] = responseData;
								chrome.storage.local.set({sentryQueries: sentryQueries});
							},
							type: 'GET'
						});

						var alertedIds = items.alertedIds;
						if (query.results) {
							var showNotification = false;
							$.each(query.results, function (i, result) {
								if (result.hasSeen) {
									readCount++;
								} else {
									unreadCount++;

									if (alertedIds.indexOf(result.id) < 0) {
										alertedIds.push(result.id);
										showNotification = true;
									}
								}
							});

							if (unreadCount > 0) {
								chrome.browserAction.setBadgeText({text: unreadCount.toString()});
								chrome.browserAction.setBadgeBackgroundColor({color: 'red'});

								var notificationMessage = 'Found ' + unreadCount;
								notificationMessage += (unreadCount.toString().split('').pop() === '1') ? ' error' : ' errors';
								if (showNotification) {
									chrome.notifications.create({
										type: 'basic',
										iconUrl: '../img/sentry-tower.png',
										title: 'Sentry Tower Alert!',
										message: notificationMessage
									});
								}
							} else {
								chrome.browserAction.setBadgeText({text: readCount.toString()});
								chrome.browserAction.setBadgeBackgroundColor({color: 'blue'});
							}
						}

						chrome.storage.local.set({alertedIds: alertedIds});
					});
				});

			} else {
				chrome.browserAction.setBadgeText({text: ''});
				chrome.browserAction.setIcon({path: '../img/sentry-tower-off.png'});
			}
		});
	};
}


$(document).ready(function () {
	var interval = 60000;
	var background = new BackgroundHandler();

	background.run();
	chrome.storage.local.get({'sentryOptions': {}}, function (results) {
		if ('sentryCheckInterval' in results.sentryOptions) {
			interval = results.sentryOptions.sentryCheckInterval;
		}

		window.setInterval(background.run, interval);
	});
});

/**
 * Open settings page on install
 */
chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason === "install") {
		window.open(chrome.extension.getURL("html/settings.html"), '_blank');
	}
});
