function Popup() {

	this.formatLargeCounts = function (count) {
		return (count > 999) ? '1k+' : count;
	};

	/**
	 * Add single result to watchlist
	 *
	 * @param query
	 * @param listIdentifier
	 */
	this.addWatchlistItem = function (query, listIdentifier) {
		var watchlist = $('#' + listIdentifier);
		var unseenCount = 0;
		var seenCount = 0;
		var results = query.results;

		$.each(results, function (i, result) {
			if (result.hasSeen) {
				seenCount++;
			} else {
				unseenCount++;
			}
		});

		watchlist.append(
			$('<div>').attr('class', (unseenCount > 0) ? 'watchlist-row watchlist-row-unseen' : 'watchlist-row').append(
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
						$('<a>').attr('href', query.queryUrl).attr('target', '_blank').text(query.text)
					)
				)
			).append(
				$('<div>').attr('class', 'clear')
			)
		);
	};

	/**
	 * Create fresh watchlist based on results from storage.
	 * List of results is grouped by project first.
	 */
	this.setWatchList = function () {
		var self = this;
		chrome.storage.local.get(['sentryQueries', 'isTowerRunning'], function (items) {
			$('#is-running').prop('checked', items.isTowerRunning);

			var watchlist = $('#watchlist');
			watchlist.empty();

			var projectCntId = 0;
			$.each(items.sentryQueries, function (project, queries) {
				watchlist.append(
					$('<h3>').text(project)
				).append(
					$('<div>').attr('id', 'project-' + projectCntId).attr('class', 'watchlist')
				);

				$.each(queries, function (queryText, query) {
					self.addWatchlistItem(query, 'project-' + projectCntId);
				});
				projectCntId++;
			});
		});
	};

	/**
	 * Helper function to open Options page
	 */
	this.openSettingsPage = function () {
		window.open(chrome.extension.getURL("html/settings.html"), '_blank');
	};

	/**
	 * Toggle Tower' ON/OFF switch
	 */
	this.toggleRunningState = function () {
		chrome.storage.local.get(['isTowerRunning'], function (items) {
			chrome.storage.local.set({
				isTowerRunning: !items.isTowerRunning
			}, function () {
				//TODO: trigger background run?
			});
		});
	};
}

var popup = new Popup();
document.addEventListener('DOMContentLoaded', popup.setWatchList());

$('#option-link').click(function () {
	popup.openSettingsPage();
});

$('#is-running').click(function () {
	popup.toggleRunningState();
});
