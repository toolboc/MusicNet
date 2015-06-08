MusicNet
========

This project makes use of a [PiMusicBox](http://pimusicbox.com/) music player running on an IoT device (Raspberry Pi) that we can control from Windows 8, Windows Phone, XBOX One and the Microsoft Band.

We can do Play, Pause, Next, Previous, Volume Up, Volume Down and search both local and online music from each of those devices. On Windows Phone and the Microsoft Band, those commands can all be executed using speech. Even more exciting is that whenever a track changes from any devices the new track information shows up on the Microsoft Band.

We also connected the IoT device directly to Azure (no client software involved) to keep a history of every track that plays. And just because we could, we even created an Excel dashboard that shows the most popular tracks played by artist over time. 

The project is built on top of Pi MusicBox and Mopidy in additon to the [Web Application Template](https://wat.codeplex.com/). 

Technologies used:

*	Raspberry Pi
*	XBOX One
*	Windows Tablet
*	Windows Phone
*	Microsoft Band
*	WinJS
*	JavaScript
*	HTML
*	WebSockets
*	Python
*	Speech Recognition
*	Spotify
*	YouTube
*	Web
*	IoT
*	Rich Client
*	and more 

The photo below shows of all the components working together:
![ScreenShot](http://i.imgur.com/6zVovli.jpg)

Requirements
============
* Raspberyy Pi
* Windows Phone

Instructions
============
1. Configure and Deploy [PiMusicBox](http://pimusicbox.com/) and optionally follow the [instructions to enable playback statistics in Azure](https://github.com/toolboc/MusicNet/tree/58df59bbec0c5ef58445ea588e1b8261dfd9af51/RaspberryPi/AzurePlaybackStatistics).
2. Make note of the ip PiMusicBox is running on and modify "start_url" to point to that ip in [MusicNet.Shared/config/config.json](https://github.com/toolboc/MusicNet/blob/58df59bbec0c5ef58445ea588e1b8261dfd9af51/MusicNet/WinUniversal/MusicNet/MusicNet.Shared/config/config.json) and do the same for "webSocketUrl" in [MusicNet.WindowsPhone/js/default.js](https://github.com/toolboc/MusicNet/blob/58df59bbec0c5ef58445ea588e1b8261dfd9af51/MusicNet/WinUniversal/MusicNet/MusicNet.WindowsPhone/js/default.js)
3. Deploy to your device, for voice commands see [vcd.xml](https://github.com/toolboc/MusicNet/blob/58df59bbec0c5ef58445ea588e1b8261dfd9af51/MusicNet/WinUniversal/MusicNet/MusicNet.WindowsPhone/vcd.xml)
