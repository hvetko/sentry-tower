var SentryTower = SentryTower || {};

SentryTower.popupHandler = {
	storage: null,

	init: function () {
		this.storage = SentryTower.storageHandler;
		this.storage.init();
	},

	formatLargeCounts: function (count) {
		return (count > 999) ? '1k+' : count;
	},

	addWatchlistItem: function (query, unseenCount, seenCount) {
		var watchlist = $('#watchlist');

		var item = $("#list-template-item").clone();
		item.children('.unseen-count').text(unseenCount);
		item.children('.seen-count').text(seenCount);
		item.children('.query').children('a').text(query);
		item.children('.query').text(query);

		item.appendTo(watchlist);
	},

	setWatchlist: function () {
		var self = this;

		this.storage.storage.get('results', function (results) {
			$('#watchlist').empty();

			if (!$.isEmptyObject(results.results)) {
				$('#loader').hide();

				$.each(results.results, function (query, result) {
					var unseenCount = self.formatLargeCounts(result.unreadCount);
					var seenCount = (result.count - result.unreadCount);

					self.addWatchlistItem(query, unseenCount, seenCount);
				});
			}
		});
	}

};

var popup = SentryTower.popupHandler;
popup.init();

document.addEventListener('DOMContentLoaded', SentryTower.popupHandler.setWatchlist());
// document.getElementById('run-sentry').addEventListener('click', runTower);

