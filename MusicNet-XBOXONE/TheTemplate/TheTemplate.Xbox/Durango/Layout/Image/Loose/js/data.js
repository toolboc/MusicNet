
(function () {
    "use strict";
    
    var mopidy = new Mopidy({
        webSocketUrl: "ws://192.168.1.128:6680/mopidy/ws/",
        callingConvention: "by-position-or-by-name"
    });

    mopidy.on("state:online", function () {
        mopidy.tracklist.getTracks().done(printTracks);
    });

    mopidy.on("event:trackPlaybackStarted", function () {
        myList.splice(0, myList.length);
        mopidy.tracklist.getTracks().done(printTracks);
    });

    var sampleData = [];

    var myList = new WinJS.Binding.List();

    var printTracks = function (tracks) {
        tracks.forEach( function(track) {
            myList.push({
                title: track.name,
                image: "/images/image.png"
            })
            }
        );
    };

    // TODO: Replace the data with your real data.
    //var sampleData = [
    //    { title: "Item 1", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 2", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 3", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 4", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 5", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 6", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 7", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 8", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 9", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 10", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 11", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 12", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 13", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 14", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 15", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 16", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 17", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 18", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 19", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." },
    //    { title: "Item 20", image: "/images/image.png", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lorem, iaculis rhoncus volutpat vel, tristique ut sapien." }
    //];

    var publicMembers = {
        SampleData: sampleData,
        MyList: myList
    };

    WinJS.Namespace.define("MyApp", publicMembers);

})();