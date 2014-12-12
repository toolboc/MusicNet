/*global WinJS: true*/
var queue;

(function () {
    "use strict";

    var HomeViewModel = WinJS.Class.define(function (options) {
        options = options || {};

        this._featuredItems = new WinJS.Binding.List([]);

        this.featuredItems = MyApp.MyList;

    }, {
        newItems: {
            get: function () {
                return this._newItems;
            },
            set: function (value) {
                Shared.Utilities.setProperty(value, 'newItems', this);
            }
        },

        featuredItems: {
            get: function () {
                return this._featuredItems;
            },
            set: function (value) {
                Shared.Utilities.setProperty(value, 'featuredItems', this);
            }

        },

    }, {

    });

    WinJS.Class.mix(HomeViewModel, WinJS.Binding.observableMixin);



    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var wuiv = Windows.UI.ViewManagement;

    UserControl.define("/pages/home/home.html", {
        // The root element of the page fragment. Rather than using document.getElementById or document.querySelector, you
        // can use this._layoutRoot.querySelector to scope your search to just the page fragment which lowers the risk of
        // getting the wrong element.
        _layoutRoot: {},

        init: function(element, options){
            this.viewModel = new HomeViewModel(options);

            this.popularTemplateFunctionBind = WinJS.Utilities.markSupportedForProcessing(this._popularTemplateFunction.bind(this));

            this.browseMore = WinJS.UI.eventHandler(this._browseMore.bind(this));

            this.play = WinJS.UI.eventHandler(this._play.bind(this));
            this.pause = WinJS.UI.eventHandler(this._pause.bind(this));

            this.playTool = WinJS.UI.eventHandler(this._playTool.bind(this));

            this.playSpotify = WinJS.UI.eventHandler(this._playSpotify.bind(this));

            this.next = WinJS.UI.eventHandler(this._next.bind(this));
            this.prev = WinJS.UI.eventHandler(this._prev.bind(this));
        },

        processed: function(element, options){
            this._layoutRoot = element;
            this._hubElement = element.querySelector("#landing-hub").winControl;

            var that = this;

            if (Shared.Utilities.isXbox) {
                // TODO: Binding.processAll does not get called for each section with XboxJS only,
                // too lazy and too late to figure it out, will get back to it. WORKAROUND
                this._hubElement.addEventListener("loadingstatechanged", function handleStateChanged(ev){
                    if (ev.detail &&
                        ev.detail.loadingState === XboxJS.UI.Hub.LoadingState.complete) {
                        that._hubElement.removeEventListener("loadingstatechanged", this);

                        for (var i = 0; i < that._hubElement.sections.length; i++) {
                            WinJS.Binding.processAll(that._hubElement.sections.getAt(i).contentElement, that, true);
                        }

                        setImmediate(function afterPageRenderingHasFinished() {
                            that._setInitialFocus();
                        });

                    }
                }, false);
            }
        },

        ready: function (element, options) {
            var mopidy = new Mopidy({
                webSocketUrl: "ws://192.168.1.128:6680/mopidy/ws/",
                callingConvention: "by-position-or-by-name"
            });

            mopidy.on("state:online", function () {
                mopidy.playback.getCurrentTrack().done(printCurrentTrack);

            });

            mopidy.on("event:trackPlaybackStarted", function () {
                mopidy.playback.getCurrentTrack().done(printCurrentTrack);
            });
        },


        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            // TODO: Respond to changes in viewState.

            // It is always good practice to set initial focus on the UI element the user is most likely to interact with.
            if (lastViewState !== viewState) {
                this._setInitialFocus();
            }
        },

        _browseMore: function(ev){
            WinJS.Navigation.navigate('/pages/browse/browse.html', { pageTitle: "Browse All", items: MyApp.MyList });
        },

        _play: function(ev){
            var mopidy = new Mopidy({
                webSocketUrl: "ws://192.168.1.128:6680/mopidy/ws/",
                callingConvention: "by-position-or-by-name"
            });

            mopidy.on("state:online", function () {
                mopidy.playback.play();
            });
        },

        _pause: function(ev){
            var mopidy = new Mopidy({
                webSocketUrl: "ws://192.168.1.128:6680/mopidy/ws/",
                callingConvention: "by-position-or-by-name"
            });

            mopidy.on("state:online", function () {
                mopidy.playback.pause();
            });
        },

        _next: function(ev){
            var mopidy = new Mopidy({
                webSocketUrl: "ws://192.168.1.128:6680/mopidy/ws/",
                callingConvention: "by-position-or-by-name"
            });

            mopidy.on("state:online", function () {
                mopidy.playback.next();
            });
        },

        _prev: function(ev){
            var mopidy = new Mopidy({
                webSocketUrl: "ws://192.168.1.128:6680/mopidy/ws/",
                callingConvention: "by-position-or-by-name"
            });

            mopidy.on("state:online", function () {
                mopidy.playback.previous();
            });
        },

        _playTool: function(ev){
            var mopidy = new Mopidy({
                webSocketUrl: "ws://192.168.1.128:6680/mopidy/ws/",
                callingConvention: "by-position-or-by-name"
            });

            mopidy.on("state:online", function () {
                mopidy.library.search({ 'query': { 'any': 'tool' }, 'uris': ['local:directory'] }).done(function (results) {
                    results.forEach(function (result) {
                        if (result.tracks) {
                            mopidy.tracklist.clear();
                            result.tracks.forEach(function (track) {
                                mopidy.tracklist.add({ 'tracks': [track] }).done();
                            });
                            mopidy.playback.play();
                        }
                    });
                });
            });
        },

        _playSpotify: function(ev){
            var mopidy = new Mopidy({
                webSocketUrl: "ws://192.168.1.128:6680/mopidy/ws/",
                callingConvention: "by-position-or-by-name"
            });

            mopidy.on("state:online", function () {
                var playlistNum = playlistNum || 0;
                var trackNum = trackNum || 0;
                mopidy.playlists.getPlaylists().then(function (playlists) {
                    var playlist = playlists[playlistNum];
                    console.log("Loading playlist:", playlist.name);

                        mopidy.tracklist.clear();
                        playlist.tracks.forEach(function (track) {
                            mopidy.tracklist.add({ 'tracks': [track] }).done();
                        });
                        mopidy.playback.play();

                    })
                .catch(console.error.bind(console)) // Handle errors here
                .done();                            // ...or they'll be thrown here
            });
        },

        // A function to render the items in the popular list
        _popularTemplateFunction: function (item) {
            var tileItemContainer = document.createElement("div");
            var tile = new Shared.UI.MediaTile(tileItemContainer);
            this._loadTile(tile, item, "/pages/details/details.html");
            return tileItemContainer;
        },

        _loadTile: function (tile, metadata, pageUri) {

            tile.metadata = metadata;

            //tile.element.setAttribute("data-win-voice", "{ enumerate: 'numbersEnumeration', targetElement: select('.win-voice-activetext')}");
            //// Set the background image of the tile.
            //tile.element.querySelector(".win-item").style.backgroundImage = "url('" + metadata.image + "')";
            tile.addEventListener("invoked", (function generateHandleItemInvoked(metadata) {
                return function handleItemInvoked() {
                    WinJS.Navigation.navigate(pageUri, metadata);
                };
            })(metadata, tile));

            // We return the tile's DOM element so the loadTile helper function
            // can be used with a render function.
            return tile.element;
        },
        _handleGoFullScreenButtonInvoked: function () {
            if (Windows.Xbox) {
                Windows.UI.ViewManagement.ApplicationView.tryUnsnapToFullscreen();
            } else {
                Windows.UI.ViewManagement.ApplicationView.tryUnsnap();
            }
        },
        _setInitialFocus: function () {
            if (!Shared.Utilities.isXbox) {
                return;
            }

            // It is always good practice to set initial focus on the UI element the user is most likely to interact with.
            // When in doubt, pick the top, left element.
            var initialFocusElement = null;
            if (wuiv.ApplicationView.value !== wuiv.ApplicationViewState.snapped) {
                initialFocusElement = this._layoutRoot.querySelector(".win-focusable");
            } else {
                initialFocusElement = this._layoutRoot.querySelector(".landing-snapped-overlay").querySelector(".win-focusable");
            }

            if (initialFocusElement) {
                initialFocusElement.focus();
            }
        }
    });

    var printCurrentTrack = function (track) {
        if (track) {
            document.getElementById("title").textContent = "Currently playing: " + track.name + " by " + track.artists[0].name + " from " + track.album.name;
        } else {
            document.getElementById("title").textContent = "No current track";
        }
    };

})();