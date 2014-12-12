// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511

/*global WinJS: true*/

(function () {
    "use strict";

    var DetailsViewModel = WinJS.Class.define(function (options) {
        options = options || {};

        this._pageTitle = options.title ? options.title : 'Browse All';
        this._description = options.description ? options.description : '';
        this._relatedItems = new WinJS.Binding.List([]);
        this._image = options.image;

        //WinJS.Promise.wrap(MyApp.SampleData).then(function (data) {
        //    this.relatedItems = new WinJS.Binding.List(data.slice(0, 3));
        //}.bind(this))


    }, {
        pageTitle: {
            get: function () {
                return this._pageTitle;
            },
            set: function (value) {
                Shared.Utilities.setProperty(value, 'pageTitle', this);
            }

        },

        description: {
            get: function () {
                return this._description;
            },
            set: function (value) {
                Shared.Utilities.setProperty(value, 'description', this);
            }

        },

        image: {
            get: function () {
                return this._image;
            },
            set: function (value) {
                Shared.Utilities.setProperty(value, 'image', this);
            }

        },

        relatedItems: {
            get: function () {
                return this._relatedItems;
            },
            set: function (value) {
                Shared.Utilities.setProperty(value, 'relatedItems', this);
            }

        },



    }, {

    });

    WinJS.Class.mix(DetailsViewModel, WinJS.Binding.observableMixin);

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    UserControl.define("/pages/details/details.html", {
        init: function (element, options) {

            this.viewModel = new DetailsViewModel(options);

            this.relatedTemplateFunction = WinJS.Utilities.markSupportedForProcessing(this._relatedTemplateFunction.bind(this));

            this.showMoreActions = WinJS.UI.eventHandler(this._showMoreActionsMenu.bind(this));
            this.handleRatingChanged = WinJS.UI.eventHandler(this._handleRatingChanged.bind(this));
            this.handleGoFullScreenButtonInvoked = WinJS.UI.eventHandler(this._handleGoFullScreenButtonInvoked.bind(this));

            //this.browseMore = WinJS.UI.eventHandler(this._browseMore.bind(this));

        },

        processed: function (element, options) {
            this._layoutRoot = element;
            this._hubElement = element.querySelector("#details-hub").winControl;

            var that = this;

            if (Shared.Utilities.isXbox) {
                // TODO: Binding.processAll does not get called for each section with XboxJS only
                this._hubElement.addEventListener("loadingstatechanged", function handleStateChanged(ev) {
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

        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            // TODO: Respond to changes in viewState.

            if (lastViewState !== viewState) {
                this._setInitialFocus();
            }
        },

        _handleRatingChanged: function (ev) {
            // TODO: Post the ratings to your rating service
        },

        // A function to render the items in the related items list
        _relatedTemplateFunction: function (item) {
            var tileElement = this._loadTile(new Shared.UI.ItemContainer(), item, "/pages/details/details.html");
            WinJS.Utilities.addClass(tileElement, "details-related-button");
            return tileElement;
        },

        _loadTile: function (tile, metadata, pageUri) {
            tile.element.setAttribute("data-win-voice", "{ enumerate: 'numbersEnumeration', targetElement: select('.win-voice-activetext')}");
            // Set the background image of the tile.
            tile.element.querySelector(".win-item").style.backgroundImage = "url('" + metadata.image + "')";
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

        _showMoreActionsMenu: function (ev) {
            if (WinJS.Utilities.isPhone) {
                var menu = new Windows.UI.Popups.PopupMenu();
                menu.commands.append(new Windows.UI.Popups.UICommand("Action 1", null));
                menu.commands.append(new Windows.UI.Popups.UICommand("Action 2", null));
                menu.commands.append(new Windows.UI.Popups.UICommand("Action 3", null));
                menu.showAsync({ x: 0, y: -1 });
            } else {
                var moreActionsButton = this._layoutRoot.querySelector("#details-moreactionsbutton");
                var moreActionsMenu = this._layoutRoot.querySelector("#details-moreactionsmenu");
                moreActionsMenu.winControl.show(moreActionsButton, "right");
            }

        },

        _setInitialFocus: function () {
            // It is always good practice to set initial focus on the UI element the user is most likely to interact with.
            // When in doubt, pick the top, left element.
            var detailsButton1 = this._layoutRoot.querySelector("#details-button1");
            var detailsButton1Snapped = this._layoutRoot.querySelector("#details-button1-snapped");
            if (appView.value === appViewState.snapped) {
                if (detailsButton1Snapped) {
                    detailsButton1Snapped.focus();
                }
            } else {
                if (detailsButton1) {
                    detailsButton1.focus();
                }
            }
        }
    });
})();