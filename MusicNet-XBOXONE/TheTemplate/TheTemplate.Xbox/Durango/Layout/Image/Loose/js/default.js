(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    // A enumeration of numbers that can be used by voice to number the voice labels of your items 1-50. If you have a page with more than 50 items, add more entries to the array.
    var numbersEnumeration = [
        { phrase: 'Item 1' }, { phrase: 'Item 2' }, { phrase: 'Item 3' }, { phrase: 'Item 4' }, { phrase: 'Item 5' }, { phrase: 'Item 6' }, { phrase: 'Item 7' }, { phrase: 'Item 8' }, { phrase: 'Item 9' }, { phrase: 'Item 10' }, { phrase: 'Item 11' }, { phrase: 'Item 12' }, { phrase: 'Item 13' }, { phrase: 'Item 14' }, { phrase: 'Item 15' }, { phrase: 'Item 16' }, { phrase: 'Item 17' }, { phrase: 'Item 18' }, { phrase: 'Item 19' }, { phrase: 'Item 20' }, { phrase: 'Item 21' }, { phrase: 'Item 22' }, { phrase: 'Item 23' }, { phrase: 'Item 24' }, { phrase: 'Item 25' }, { phrase: 'Item 26' }, { phrase: 'Item 27' }, { phrase: 'Item 28' }, { phrase: 'Item 29' }, { phrase: 'Item 30' }, { phrase: 'Item 31' }, { phrase: 'Item 32' }, { phrase: 'Item 33' }, { phrase: 'Item 34' }, { phrase: 'Item 35' }, { phrase: 'Item 36' }, { phrase: 'Item 37' }, { phrase: 'Item 38' }, { phrase: 'Item 39' }, { phrase: 'Item 40' }, { phrase: 'Item 41' }, { phrase: 'Item 42' }, { phrase: 'Item 43' }, { phrase: 'Item 44' }, { phrase: 'Item 45' }, { phrase: 'Item 46' }, { phrase: 'Item 47' }, { phrase: 'Item 48' }, { phrase: 'Item 49' }, { phrase: 'Item 50' }
    ];

    app.addEventListener("activated", function (args) {
        // Register a voice enumeration for numbering items 1, 2, 3, etc. Voice enumerations are useful
        // if the titles of your tiles are difficult to say. For instance, very long titles, or titles
        // whose language is not the native language of the app. For instance, a "Korean Drama" section in 
        // an app that is published in the United States.
        XboxJS.UI.Voice.registerEnumeration('numbersEnumeration', numbersEnumeration);

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