// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=329104
var phraseList = []; //cortana phrases

(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var online = false;
    var awaitingCommand = "";
    var volumeLevel = 0;

    // Create Mopidy and connect to device
    var mopidy = new Mopidy({
        webSocketUrl: "ws://192.168.1.128:6680/mopidy/ws/",
        callingConvention: "by-position-or-by-name"
    });

    function processCommand(command) {
        // Any awaiting command
        switch (command) {
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

        processOrQueueCommand(voiceCommandName);
    }

    // When Mopid connects
    mopidy.on("state:online", function () {
        // Online now
        online = true;
        
        // Process any awaiting command
        processCommand(awaitingCommand);
    });

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
