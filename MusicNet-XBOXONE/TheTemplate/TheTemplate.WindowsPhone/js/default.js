(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;


    app.addEventListener("activated", function (args) {

        var processAllPromise = WinJS.UI.processAll()
            .then(function () {
                // Parse the activation arguments and init
                var navigationUri = nav.location,
                    navigationOptions = nav.state;

                // If we saved a history in the session state, restore it.
                if (app.sessionState.history) {
                    nav.history = app.sessionState.history;
                }

                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate("/pages/home/home.html");
                }

                // Set to false once we have finished the one-time initialization
                performOneTimeSetup = false;
            });

        args.setPromise(processAllPromise);
    });

    app.addEventListener("checkpoint", function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().

        // When navigation history is loaded from session state, it loads the back stack and populates the "location" field without actually navigating there. 
        // This causes the location property to be incorrect. Because we have places in the app where we check the current location, it can lead to unexpected results.
        // However, we need to clear this history, because if we don't then no session state file will get saved, but WinJS expects it to be there on resume and will crash if it's not.
        app.sessionState.history = [];
    });

    Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", function (args) {
        // TODO: The application is about to be resumed from suspension.  If you need to load
        // any state, check who's logged in to see if primary user changed, etc. this is the
        // event.
    });
    
    // A global error handler that will catch any errors that are not caught and handled by your application's code.
    // Ideally the user should never hit this function because you have gracefully handled the error before it has 
    // had a chance to bubble up to this point. In case the error gets this far, the function below will display an
    // error dialog informing the user that an error has occurred.
    app.onerror = function (evt) {
        // TODO: It is a good practice to capture the following information so you can analyze the crash and fix it:
        // 1. args.detail.errorCode
        // 2. args.detail.errorMessage
        // 3. args.detail.stack
    };

    app.start();
})();