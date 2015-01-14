/* global $, $iq, config, connection, focusMucJid, messageHandler, Moderator,
   Toolbar, Util */
var Recording = (function (my) {
    var recordingToken = null;
    var recordingEnabled;

    /**
     * Whether to use a jirecon component for recording, or use the videobridge
     * through COLIBRI.
     */
    var useJirecon = (typeof config.hosts.jirecon != "undefined");

    /**
     * The ID of the jirecon recording session. Jirecon generates it when we
     * initially start recording, and it needs to be used in subsequent requests
     * to jirecon.
     */
    var jireconRid = null;

    my.setRecordingToken = function (token) {
        recordingToken = token;
    };

    my.setRecording = function (state, token, callback) {
        if (useJirecon){
            this.setRecordingJirecon(state, token, callback);
        } else {
            this.setRecordingColibri(state, token, callback);
        }
    };

    my.setRecordingJirecon = function (state, token, callback) {
        if (state == recordingEnabled){
            return;
        }

        var iq = $iq({to: config.hosts.jirecon, type: 'set'})
            .c('recording', {xmlns: 'http://jitsi.org/protocol/jirecon',
                action: state ? 'start' : 'stop',
                mucjid: connection.emuc.roomjid});
        if (!state){
            iq.attrs({rid: jireconRid});
        }

        console.log('Start recording');

        connection.sendIQ(
            iq,
            function (result) {
                // TODO wait for an IQ with the real status, since this is
                // provisional?
                jireconRid = $(result).find('recording').attr('rid');
                console.log('Recording ' + (state ? 'started' : 'stopped') +
                    '(jirecon)' + result);
                recordingEnabled = state;
                if (!state){
                    jireconRid = null;
                }

                callback(state);
            },
            function (error) {
                console.log('Failed to start recording, error: ', error);
                callback(recordingEnabled);
            });
    };

    // Sends a COLIBRI message which enables or disables (according to 'state')
    // the recording on the bridge. Waits for the result IQ and calls 'callback'
    // with the new recording state, according to the IQ.
    my.setRecordingColibri = function (state, token, callback) {
        var elem = $iq({to: focusMucJid, type: 'set'});
        elem.c('conference', {
            xmlns: 'http://jitsi.org/protocol/colibri'
        });
        elem.c('recording', {state: state, token: token});

        connection.sendIQ(elem,
            function (result) {
                console.log('Set recording "', state, '". Result:', result);
                var recordingElem = $(result).find('>conference>recording');
                var newState = ('true' === recordingElem.attr('state'));

                recordingEnabled = newState;
                callback(newState);
            },
            function (error) {
                console.warn(error);
                callback(recordingEnabled);
            }
        );
    };

    my.toggleRecording = function () {
        if (!Moderator.isModerator()) {
            console.log(
                'non-focus, or conference not yet organized:' +
                ' not enabling recording');
            return;
        }

        // Jirecon does not (currently) support a token.
        if (!recordingToken && !useJirecon)
        {
            UI.messageHandler.openTwoButtonDialog(null,
                    '<h2>Enter recording token</h2>' +
                    '<input id="recordingToken" type="text" ' +
                    'placeholder="token" autofocus>',
                false,
                "Save",
                function (e, v, m, f) {
                    if (v) {
                        var token = document.getElementById('recordingToken');

                        if (token.value) {
                            my.setRecordingToken(
                                Util.escapeHtml(token.value));
                            my.toggleRecording();
                        }
                    }
                },
                function (event) {
                    document.getElementById('recordingToken').focus();
                },
                function () {}
            );

            return;
        }

        var oldState = recordingEnabled;
        UI.setRecordingButtonState(!oldState);
        my.setRecording(!oldState,
            recordingToken,
            function (state) {
                console.log("New recording state: ", state);
                if (state === oldState)
                {
                    // FIXME: new focus:
                    // this will not work when moderator changes
                    // during active session. Then it will assume that
                    // recording status has changed to true, but it might have
                    // been already true(and we only received actual status from
                    // the focus).
                    //
                    // SO we start with status null, so that it is initialized
                    // here and will fail only after second click, so if invalid
                    // token was used we have to press the button twice before
                    // current status will be fetched and token will be reset.
                    //
                    // Reliable way would be to return authentication error.
                    // Or status update when moderator connects.
                    // Or we have to stop recording session when current
                    // moderator leaves the room.

                    // Failed to change, reset the token because it might
                    // have been wrong
                    my.setRecordingToken(null);
                }
                // Update with returned status
                UI.setRecordingButtonState(state);
            }
        );
    };

    return my;
}(Recording || {}));
