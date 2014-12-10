var config = {
    hosts: {
        domain: 'meet03.iparlo.net',
        //anonymousdomain: 'guest.example.com',
        muc: 'conference.meet03.iparlo.net', // FIXME: use XEP-0030
        bridge: 'jitsi-videobridge.meet03.iparlo.net', // FIXME: use XEP-0030
        //call_control: 'callcontrol.jitsi-meet.example.com'
    },
//  getroomnode: function (path) { return 'someprefixpossiblybasedonpath'; },
//  useStunTurn: true, // use XEP-0215 to fetch STUN and TURN server
//  useIPv6: true, // ipv6 support. use at your own risk
    useNicks: false,
    bosh: '//meet03.iparlo.net/http-bind', // FIXME: use xep-0156 for that
    clientNode: 'http://meet.iparlo.net/meet', // The name of client node advertised in XEP-0115 'c' stanza
    //defaultSipNumber: '', // Default SIP number
    desktopSharing: 'ext', // Desktop sharing method. Can be set to 'ext', 'webrtc' or false to disable.
    chromeExtensionId: "fbalddklnheneegehijmjanjbjimckgi", // Id of desktop streamer Chrome extension
    desktopSharingSources: ["screen", "window"],
    minChromeExtVersion: "0.0.0.1",   // Required version of Chrome extension
    enableRtpStats: true, // Enables RTP stats processing
    openSctp: true, // Toggle to enable/disable SCTP channels
    channelLastN: -1, // The default value of the channel attribute last-n.
    adaptiveLastN: false,
    useRtcpMux: false,
    useBundle: false,
    enableRecording: false,
    enableWelcomePage: false,
    enableSimulcast: false,
    isBrand: false
};
