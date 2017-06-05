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
	 */
	addWatchlistItem: function (query, unseenCount, seenCount) {
		var watchlist = $('#watchlist');

		var item = $("ul#list-template li").clone();
		item.children('.unseen-count').text(unseenCount);
		item.children('.seen-count').text(seenCount);
		item.children('a').attr('href', query.url);
		item.children('a').children('.query-project').text(query.project);
		item.children('a').children('.query').text(query.query);

		item.appendTo(watchlist);
	},

	/**
	 * Create fresh watchlist based on results from storage
	 */
	setWatchList: function () {
		var self = this;

		this.storage.storage.get('results', function (results) {
			$('#watchlist').empty();

			console.log(results.results);
			if (!$.isEmptyObject(results.results)) {
				$('#loader').hide();

				$.each(results.results, function (query, result) {
					var unseenCount = self.formatLargeCounts(result.unreadCount);
					var seenCount = (result.count - result.unreadCount);

					self.addWatchlistItem(result.query, unseenCount, seenCount);
				});
			} else {
				//TODO; show msg
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
