(function sharedUiInit() {
    'use strict';

    var mediaTile = 'TODO';

    var backButton = undefined;
    var hub = undefined;
    var hubSection = undefined;
    var itemContainer = undefined;
    var repeater = undefined;
    var searchBox = undefined;
    var commonListViewLayout = undefined;

    var isHeaderStatic = true;

    // repeater on xbox and windows, listview on phone
    // for use in pivot

    var repeater2 = undefined;

    if (typeof XboxJS != 'undefined') {
        //Xbox
        backButton = XboxJS.UI.BackButton;
        hub = XboxJS.UI.Hub;
        hubSection = XboxJS.UI.HubSection;
        itemContainer = XboxJS.UI.ItemContainer;
        repeater = XboxJS.UI.Repeater;
        searchBox = XboxJS.UI.SearchBox;
        commonListViewLayout = WinJS.UI.GridLayout;
    } else if (!WinJS.Utilities.isPhone) {
        //Windows
        backButton = WinJS.UI.BackButton;
        hub = WinJS.UI.Hub;
        hubSection = WinJS.UI.HubSection;
        itemContainer = WinJS.UI.ItemContainer;
        repeater = WinJS.UI.Repeater;
        searchBox = WinJS.UI.SearchBox;
        commonListViewLayout = WinJS.UI.GridLayout;
        isHeaderStatic = false;
    } else {
        //Phone
        hub = WinJS.UI.Pivot;
        hubSection = WinJS.UI.PivotItem;
        itemContainer = WinJS.UI.ItemContainer;
        repeater = WinJS.UI.Repeater
        commonListViewLayout = WinJS.UI.ListLayout;
    }

    WinJS.Namespace.define('Shared.UI', {
        BackButton: backButton,
        Hub: hub,
        HubSection: hubSection,
        ItemContainer: itemContainer,
        Repeater: repeater,
        SearchBox: searchBox,
        CommonListViewLayout: commonListViewLayout,
        isHeaderStatic: isHeaderStatic
    });
})();
(function sharedMediaTileInit() {
    'use strict'

    var mediaTile = undefined;

    if (typeof XboxJS != 'undefined') {
        mediaTile = XboxJS.UI.MediaTile;
    } else {
        mediaTile = WinJS.Class.define(function (element, options) {

            // this._super.constructor();

            var itemContainer = new WinJS.UI.ItemContainer(element, options);
            element = itemContainer.element;

            WinJS.Utilities.addClass(element, 'win-mediatile');

            var metadata = (options && options.metadata) ? options.metadata : {};

            var winItem = element.querySelector('.win-item');

            winItem.innerHTML = '<div class="shared-mediatile-metadatagrid">' +
                                '   <div class="shared-mediatile-imagehost" ></div>' +
                                '   <div class="shared-mediatile-metadata">' +
                                '       <div class="shared-mediatile-metadatabackground"></div>' +
                                '       <div class="shared-text-tiletitle shared-mediatile-title"></div>' +
                                '       <div class="shared-text-description shared-mediatile-description"></div>' +
                                '   </div>' +
                                '</div>';

            var titleDiv = winItem.querySelector('.shared-text-tiletitle');
            var descriptionDiv = winItem.querySelector('.shared-text-description');
            var imageHost = winItem.querySelector('.shared-mediatile-imagehost');

            var applyMetadata = function () {
                if (metadata.title) {
                    titleDiv.innerText = metadata.title;
                }
                if (metadata.description) {
                    descriptionDiv.innerText = metadata.description;
                }
                if (metadata.image) {
                    imageHost.style.backgroundImage = "url(" + metadata.image + ")";
                }
            };

            applyMetadata();


            Object.defineProperty(itemContainer, "metadata", {
                get: function () {
                    return metadata
                },
                set: function (value) {
                    if (!value) {
                        return;
                    }
                    metadata = value;
                    applyMetadata();
                }
            });

            return itemContainer;

        });
    }

    WinJS.Namespace.define('Shared.UI', {
        MediaTile: mediaTile
    });
})();

(function utilitiesInit() {
    'use strict';

    WinJS.Namespace.define('Shared.Utilities', {
        showErrorMessage: function (message, title) {
            // TODO: Log relevant error data to your service to analyze

            var errorDialog = new Windows.UI.Popups.MessageDialog(message, title);
            errorDialog.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("close").value));
            errorDialog.cancelCommandIndex = 0;
            errorDialog.defaultCommandIndex = 0;

            return errorDialog.showAsync();
        },

        isXbox: (typeof XboxJS !== 'undefined'),

        isPhone: WinJS.Utilities.isPhone,

        isWindows: ((typeof XboxJS === 'undefined') && !WinJS.Utilities.isPhone),

        // merge helper functions from WinJS2.0 for XBox support
        _merge: function _merge(a, b) {
            // Merge 2 objects together into a new object
            return this._mergeAll([a, b]);
        },

        _mergeAll: function _mergeAll(list) {
            // Merge a list of objects together
            var o = {};
            list.forEach(function (part) {
                Object.keys(part).forEach(function (k) {
                    o[k] = part[k];
                });
            });
            return o;
        },

        // ViewModel binding helper
        setProperty: function (value, name, that) {
            if (value !== that["_" + name]) {
                that.notify(name, value, that["_" + name]);
                that["_" + name] = value;
            }
        }
    });

    WinJS.Namespace.define("UserControl", {

        define: function (url, members) {

            var init = members.init || function () { };
            var dispose = members.dispose || function () { };
            var processed = members.processed || function () { };

            members = Shared.Utilities._merge(members, {

                init: function (element, options) {
                    this.dataContext = this;
                    return init.call(this, element, options);
                },

                dispose: function () {
                    var bindings = WinJS.Utilities.data(this.element).winBindings || [];
                    bindings.forEach(function (binding) { binding.cancel(); });
                    
                    dispose.call(this);
                },

                disposeCommands: function () {
                    if (this.commander) {
                        this.commander.unregister();
                    }
                },

                processed: function (element, options) {
                    var that = this;
                    var named = this.element.querySelectorAll("[data-win-name]");
                    for (var i = 0, len = named.length; i < len; i++) {
                        var child = named[i];
                        var name = child.getAttribute("data-win-name");
                        if (name in this) {
                            throw "Already have a member by this name";
                        }
                        this[name] = child;
                    }


                    if (Shared.Utilities.isXbox) {
                        // WinJS 1.0 does not support skipRoot on processAll, so we call it on each child manualy
                        var processAllPromises = [];
                        for (var i = 0; i < element.children.length; i++) {
                            processAllPromises.push(WinJS.UI.processAll(element.children[i]));
                        }

                        WinJS.Promise.join(processAllPromises).then(function () {
                            return WinJS.Binding.processAll(element, that.dataContext, true).then(function () {
                                return processed.call(that, element, options);
                            });
                        });
                    } else {
                        // The built in processAll for Pages should probably call this with skipRoot: true
                        return WinJS.UI.processAll(element, true).then(function () {
                            return WinJS.Binding.processAll(element, that.dataContext, true).then(function () {
                                return processed.call(that, element, options);
                            });
                        });
                    }
                },

            });

            // User control should definitely be a declartive control container.
            var control = WinJS.UI.Pages.define(url, members);
            control.isDeclarativeControlContainer = true;
            return control;

        },

    });

    // It seems the case that HtmlControl should be marked as a declarative control container
    WinJS.UI.HtmlControl.isDeclarativeControlContainer = true;
})();

(function bindingConverters() {
    'use strict';

    WinJS.Namespace.define('Shared.Converter', {

        imageToBackgroundImageConverter: WinJS.Binding.converter(function (image) {
            return 'url(' + image + ')';
        }),

        boolToDisplay: WinJS.Binding.converter(function (v) {
            return v ? "" : "none";
        }),

        inverseBoolToDisplay: WinJS.Binding.converter(function (v) {
            return v ? "none" : "";
        }),

        dateToRelativeTime: WinJS.Binding.converter(function (time) {
            return App.Utilities.getRelativeTimeString(time);
        }),

    });
})();