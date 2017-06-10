function BackgroundHandler() {

	/**
	 * Run background tasks
	 *
	 * //TODO: Too big and too nested. Refactor.
	 */
	this.run = function () {
		chrome.storage.local.get({
			'isTowerRunning': false,
			'sentryQueries': [],
			'alertedIds': []
		}, function (items) {
			if (items.isTowerRunning) {
				chrome.browserAction.setIcon({path: '../img/tower.png'});

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
							error: function (responseData) {
								self.processError(responseData);
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
										iconUrl: '../img/tower.png',
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
				chrome.browserAction.setIcon({path: '../img/tower-off.png'});
			}
		});
	};
}


$(document).ready(function () {
	var interval = 60000;
	var background = new BackgroundHandler();

	background.run();

	chrome.storage.local.get(['sentryOptions'], function (results) {
		if (results.sentryOptions.sentryCheckInterval) {
			interval = results.sentryOptions.sentryCheckInterval;
		}

		window.setInterval(background.run, interval);
	});
});
