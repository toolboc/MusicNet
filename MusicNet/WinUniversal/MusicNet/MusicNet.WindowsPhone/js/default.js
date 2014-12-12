// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=329104
var phraseList = []; //cortana phrases

(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var online = false;
    var awaitingCommand = "";
    var search = "";
    var volumeLevel = 0;
    var mopidy = null;
    var artist, uris = null;

    function playArtist() {
        mopidy.library.search({ 'query': { 'artist': [search] } }).done(function (results) {
            results.forEach(function (result) {
                if (result.tracks) {
                    mopidy.tracklist.clear();
                    mopidy.tracklist.add({ 'tracks': [result.tracks] }).done();
                }
            });
        });
    }

    function processCommand(command) {
        // Any awaiting command
        switch (command) {
            case "artist":
                playArtist();
                break;
            case "next":
                mopidy.playback.next();
                break;
            case "pause":
                mopidy.playback.pause();
                break;
            case "play":
                mopidy.playback.play();
                break;
            case "previous":
                mopidy.playback.previous();
                break;
            case "volume":
                mopidy.playback.setVolume([volumeLevel]).done();
                break;
        }
    }

    function processOrQueueCommand(command) {
        if (online) {
            processCommand(command);
        }
        else {
            awaitingCommand = command;
        }
    }

    function processVoiceCommand(voiceCommandName, textSpoken, target) {
        
        // If volume, we need to pase out what percent
        if (voiceCommandName === "volume") {
            volumeLevel = parseInt(textSpoken.split(" ")[1]);
        }
        else if (voiceCommandName === "artist") {
            search = textSpoken.substr(textSpoken.indexOf(" ") + 1);
        }

        processOrQueueCommand(voiceCommandName);
    }

    function showToast(text, silent, expire) {
        var notifications = Windows.UI.Notifications;
        var template = notifications.ToastTemplateType.toastImageAndText02;
        var toastXml = notifications.ToastNotificationManager.getTemplateContent(template);
        var toastTextElements = toastXml.getElementsByTagName("text");
        toastTextElements[0].appendChild(toastXml.createTextNode(text));

        if (silent) {
            var toastNode = toastXml.selectSingleNode("/toast");
            var audio = toastXml.createElement("audio");
            audio.setAttribute("silent", "true");
        }

        var toast = new notifications.ToastNotification(toastXml);

        if (expire) {
            var currentDate = new Date();
            toast.ExpirationTime = new Date(currentDate.getTime() + 1000);
        }

        notifications.ToastNotificationManager.createToastNotifier().show(toast);
    }

    // When Mopidy connects
    function mopidyConnect() {
        // Online now
        online = true;
        
        // Process any awaiting command
        processCommand(awaitingCommand);
    }

    // When Mopidy plays a track
    function mopidyTrackPlay() {
        mopidy.playback.getCurrentTrack().done(function (track) {

            // Toast
            showToast(track.name, true, true);
        });
    }

    // App loaded
    app.onloaded = function (args) {
        // Create Mopidy and connect to device
        mopidy = new Mopidy({
            webSocketUrl: "ws://192.168.1.128:6680/mopidy/ws/",
            callingConvention: "by-position-or-by-name"
        });

        // Subscribe to Mopidy events
        mopidy.on("state:online", mopidyConnect);
        mopidy.on("event:trackPlaybackStarted", mopidyTrackPlay);
    }

    // App unloaded
    app.onunload = function (args) {

        // Unsubscribe from all Mopidy events
        mopidy.off();
    }

    // App activated
    app.onactivated = function (args) {

        if (args.detail.kind === activation.ActivationKind.launch) {

            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
        }

        if (args.detail.kind === activation.ActivationKind.voiceCommand) {
            // This application has been activated with a voice command.

            var speechRecognitionResult = args.detail.result;

            // Get the name of the voice command. 
            // For this example, we declare only one command.
            var voiceCommandName = speechRecognitionResult.rulePath[0];

            // Get the actual text spoken.
            var textSpoken =
                speechRecognitionResult.text !==
                undefined ? speechRecognitionResult.text : "EXCEPTION";

            var navigationTarget = speechRecognitionResult.semanticInterpretation.properties["NavigationTarget"][0];

            if (voiceCommandName === "watCommand") {
                WAT.config.settings.items.forEach(function (item) {
                    if (textSpoken.indexOf(item.title) > -1) {
                        if (item.loadInApp === true) {
                            WAT.goToLocation(item.page);
                        } else {
                            Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(item.page));
                        }
                    }
                });

                WAT.config.appBar.buttons.forEach(function (item) {
                    if (textSpoken.indexOf(item.label) > -1) {
                        switch (item.action) {
                            case "settings":
                                WAT.options.webView.navigate("ms-appx-web:///template/settings.html");
                                break;
                            default:
                                WAT.goToLocation(item.action);
                                break;
                        }
                    }
                });

                WAT.config.navBar.buttons.forEach(function (item) {
                    if (textSpoken.indexOf(item.label) > -1) {
                        switch (item.action) {
                            case "home":
                                WAT.goToLocation(WAT.config.baseUrl);
                                break;
                            case "eval":
                                break;
                            case "back":
                                WAT.options.webView.goBack();
                                break;
                            case "nested":
                                break;
                            default:
                                WAT.goToLocation(item.action);
                                break;
                        }
                    }
                });
            }
            else if (voiceCommandName === "search") {
                if (WAT.config.search && WAT.config.search.enabled === true && WAT.config.search.searchURL && WAT.config.cortana.search) {
                    var searchUrl = WAT.config.search.searchURL;
                    WAT.goToLocation(searchUrl.replace("{searchTerm}", textSpoken.substr(textSpoken.indexOf(" ") + 1)));
                }
                else {
                    //var messageDialog = new Windows.UI.Popups.MessageDialog("Voice search is not supported for this app.");
                    //messageDialog.showAsync();
                }
            }
            else
            {
                processVoiceCommand(voiceCommandName, textSpoken, navigationTarget);
            }
        }
    };

    app.start();
})();
