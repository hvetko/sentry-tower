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

		var item = $("ul#list-template li").clone();
		item.children('.unseen-count').text(unseenCount);
		item.children('.seen-count').text(seenCount);
		item.children('a').attr('href', query.url);
		item.children('a').children('.query-project').text(query.project);
		item.children('a').children('.query').text(query.query);

		item.appendTo(watchlist);
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

					// if (!issues.result.query.project) {
					// 	issues.result.query.project = [];
					// }
					//
					// issues.result.query.project.push(
					// 	{
					// 		unseenCount: self.formatLargeCounts(result.unreadCount),
					// 		seenCount: (result.count - result.unreadCount),
					// 		query: result.query
					// 	}
					// );


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
