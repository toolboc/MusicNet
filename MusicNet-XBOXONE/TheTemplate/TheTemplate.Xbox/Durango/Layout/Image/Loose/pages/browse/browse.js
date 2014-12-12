// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511

/*global WinJS: true*/

(function () {
    "use strict";

    var BrowseViewModel = WinJS.Class.define(function (options) {
        options = options || {};

        this._pageTitle = options.pageTitle ? options.pageTitle : 'Browse All';

        if (options.items) {
            this._items = options.items
        } else {
            WinJS.Promise.wrap(MyApp.SampleData).then(function (data) {
                this.items = new WinJS.Binding.List(data);
            }.bind(this))
        }


    }, {
        pageTitle: {
            get: function () {
                return this._pageTitle;
            },
            set: function (value) {
                Shared.Utilities.setProperty(value, 'pageTitle', this);
            }

        },

        items: {
            get: function () {
                return this._items;
            },
            set: function (value) {
                Shared.Utilities.setProperty(value, 'items', this);
            }

        },

    }, {

    });

    WinJS.Class.mix(BrowseViewModel, WinJS.Binding.observableMixin);

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;

    UserControl.define("/pages/browse/browse.html", {

        init: function (element, options) {
            this.viewModel = new BrowseViewModel(options);
            this._layoutRoot = element;

            this.itemInvoked = this._itemInvoked.bind(this);

            this.itemTemplateFunction = WinJS.Utilities.markSupportedForProcessing(this._itemTemplateFunction);
            this.itemTemplateFunctionXbox = WinJS.Utilities.markSupportedForProcessing(this._itemTemplateFunctionXbox);


        },

        processed: function(element, options){
            this._listView = element.querySelector('.browse-listview').winControl;

            this._listView.addEventListener('iteminvoked', this.itemInvoked, false)

            if (Shared.Utilities.isXbox) {
                this._listView.itemTemplate = this.itemTemplateFunctionXbox;
            } else {
                this._listView.itemTemplate = this.itemTemplateFunction;
            }
        },

        ready: function (element, options) {
            // TODO: Initialize the page here.
            
            this._handleContentAnimatingBind = this._handleContentAnimating.bind(this);

            this._allItemsListView = element.querySelector(".browse-listview").winControl;

            if (Shared.Utilities.isXbox) {
                // Hook up button handlers
                element.querySelector(".browse-snapped-gofullscreenbutton").winControl.addEventListener("invoked", this._handleGoFullScreenButtonInvoked, false);

                // Hook up the sort and filter controls
                var filter = element.querySelector(".browse-filter").winControl;
                filter.addEventListener("change", this._handleFilterChange, false);

                var filterOptions = new WinJS.Binding.List([
                    { id: "All", label: "All" },
                    { id: "Featured", label: "Featured" },
                    { id: "Popular", label: "Popular" }]);

                filter.items = filterOptions;

                var sort = element.querySelector(".browse-sort").winControl;
                sort.addEventListener("change", this._handleSortChange, false);

                var sortOptions = new WinJS.Binding.List([
                    { id: "A-Z", label: "A-Z" },
                    { id: "Z-A", label: "Z-A" }]);

                sort.items = sortOptions;

                // Set view state
                this._initializeLayout(this._allItemsListView, appView.value);
            }

            this._allItemsListView.addEventListener("contentanimating", this._handleContentAnimatingBind, false);

        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            // When the view state changes, we update the ListView's layout to be vertical in snap mode
            // and horizontal for other view states.
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        this._allItemsListView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }.bind(this);
                    this._allItemsListView.addEventListener("contentanimating", handler, false);
                    this._initializeLayout(this._allItemsListView, viewState);
                }
            }
        },

        _handleContentAnimating: function (ev) {
            // If this is a backward navigation, then don't do the ListView entrance animation.
            if (ev.detail &&
                ev.detail.type === WinJS.UI.ListViewAnimationType.entrance) {
                if (this._isBackNavigation) {
                    ev.preventDefault();
                }
                this._allItemsListView.removeEventListener("contentanimating", this._handleContentAnimatingBind);
                var initialFocusElement = this._allItemsListView.elementFromIndex(0);
                setImmediate(function afterPageRenderingHasFinished() {
                    if (initialFocusElement &&
                        !this._isBackNavigation) {
                        initialFocusElement.focus();
                    }
                }.bind(this));
            }
        },
        
        _handleGoFullScreenButtonInvoked: function () {
            if (Windows.Xbox) {
                Windows.UI.ViewManagement.ApplicationView.tryUnsnapToFullscreen();
            } else {
                Windows.UI.ViewManagement.ApplicationView.tryUnsnap();
            }
        },

        _handleFilterChange: function (ev) {
            // TODO: call your service to retrieve a filtered list and update the list's
            // dataSource to refresh the UI.
        },

        _handleSortChange: function (ev) {
            // TODO: call your service to retrieve a sorted list and update the list's
            // dataSource to refresh the UI.
        },

        _itemInvoked: function (evt) {
            var mediaTile = this._listView.elementFromIndex(evt.detail.itemIndex);
            this._listView.itemDataSource.itemFromIndex(evt.detail.itemIndex).done(function success(result) {
                WinJS.Navigation.navigate('/pages/details/details.html', result.data);
            });
        },

        // This function updates the ListView with new layouts
        _initializeLayout: function (allItemsListView, viewState) {
            if (viewState === appViewState.snapped) {
                allItemsListView.layout = new ui.ListLayout();
            } else {
                allItemsListView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
            }
        },

        // A function to render the items in the ListView
        // For better performance, the ListView recycles DOM elements. As the user is scrolling quickly, rather
        // than creating new DOM elements and removing old ones, it changes the data of existing DOM elements.
        // That is why you will notice the code below checks for the presence of a recycled DOM element and if so
        // uses that element. If not, it creates a new one.
        _itemTemplateFunctionXbox: function (itemPromise, recycledElement) {
            
            var tile = null;
            if (!recycledElement) {
                tile = new Shared.UI.ItemContainer();
                WinJS.Utilities.addClass(tile.element, "layout-gallerytile");
                recycledElement = tile.element;
            } else {
                tile = recycledElement.winControl;
            }
            var renderPromise = itemPromise.then(function (item) {
                if (tile) {
                    WinJS.Utilities.addClass(tile.element, "layout-gallerytile");
                    // Set the background image of the tile.
                    tile.element.querySelector(".win-item").style.backgroundImage = "url('" + item.data.image + "')";
                    tile.element.setAttribute("data-win-voice", "{ enumerate: 'numbersEnumeration', targetElement: select('.win-voice-activetext')}");
                }
            });

            return { element: recycledElement, renderComplete: renderPromise };
        },

        // A function to render the items in the ListView
        _itemTemplateFunction: function (itemPromise, recycledElement) {

            if (!recycledElement) {
                recycledElement = document.createElement('div');
            } else {
                recycledElement.innerHTML = '';
            }
            var renderPromise = itemPromise.then(function (item) {
                recycledElement.style.backgroundImage = "url('" + item.data.image + "')";
            });

            return { element: recycledElement, renderComplete: renderPromise };
        }


    });
})();