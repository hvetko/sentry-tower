var SentryTower = SentryTower || {};

SentryTower.popupHandler = {
	storage: null,

	init: function () {
		this.storage = SentryTower.storageHandler;
	},

	formatLargeCounts: function (count) {
		return (count > 999) ? '1k+' : count;
	},

	/**
	 * Add single result to watchlist
	 *
	 * @param query
	 * @param unseenCount
	 * @param seenCount
	 * @param listIdentifier
	 */
	addWatchlistItem: function (query, unseenCount, seenCount, listIdentifier) {
		var watchlist = $('#' + listIdentifier);

		watchlist.append(
			$('<div>').attr('class', 'watchlist-row').append(
				$('<div>').attr('class', 'watchlist-counts').append(
					$('<div>').attr('class', 'count unseen-count').text(unseenCount)
				).append(
					$('<div>').attr('class', 'count seen-count').text(seenCount)
				).append(
					$('<div>').attr('class', 'clear')
				)
			).append(
				$('<div>').attr('class', 'watchlist-query-details').append(
					$('<div>').attr('class', 'watchlist-query').append(
						$('<a>').attr('href', query.url).attr('target', '_blank').text(query.query)
					)
				)
			).append(
				$('<div>').attr('class', 'clear')
			)
		);
	},

	/**
	 * Create fresh watchlist based on results from storage.
	 * List of results is grouped by project first.
	 */
	setWatchList: function () {
		var self = this;

		this.storage.storage.get('results', function (results) {
			var watchlist = $('#watchlist');

			watchlist.empty();

			if (!$.isEmptyObject(results.results)) {
				var projectCnt = 1;
				$.each(results.results, function (projectName, queryObject) {
					console.log('--', projectName, queryObject);
					watchlist.append(
						$('<h3>').text(projectName)
					).append(
						$('<ul>').attr('id', 'project-' + projectCnt).attr('class', 'watchlist')
					);

					$.each(queryObject, function (queryUrl, result) {
						var unseenCount = self.formatLargeCounts(result.unreadCount);
						var seenCount = (result.count - result.unreadCount);

						self.addWatchlistItem(result.query, unseenCount, seenCount, 'project-' + projectCnt);
					});

					projectCnt++;
				});
			} else {
				//TODO: show msg
			}
		});
	},

	/**
	 * Helper function to open Options page
	 */
	openOptionsPage: function () {
		window.open(chrome.extension.getURL("html/options.html"), '_blank');
	}

};

var popup = SentryTower.popupHandler;
popup.init();

document.addEventListener('DOMContentLoaded', popup.setWatchList());

$('#option-link').click(function () {
	popup.openOptionsPage();
});
