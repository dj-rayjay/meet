!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.API=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Implements API class that communicates with external api class
 * and provides interface to access Jitsi Meet features by external
 * applications that embed Jitsi Meet
 */



/**
 * List of the available commands.
 * @type {{
 *              displayName: inputDisplayNameHandler,
 *              muteAudio: toggleAudio,
 *              muteVideo: toggleVideo,
 *              filmStrip: toggleFilmStrip
 *          }}
 */
var commands =
{
    displayName: UI.inputDisplayNameHandler,
    muteAudio: toggleAudio,
    muteVideo: toggleVideo,
    toggleFilmStrip: UI.toggleFilmStrip,
    toggleChat: UI.toggleChat,
    toggleContactList: UI.toggleContactList
};


/**
 * Maps the supported events and their status
 * (true it the event is enabled and false if it is disabled)
 * @type {{
 *              incomingMessage: boolean,
 *              outgoingMessage: boolean,
 *              displayNameChange: boolean,
 *              participantJoined: boolean,
 *              participantLeft: boolean
 *      }}
 */
var events =
{
    incomingMessage: false,
    outgoingMessage:false,
    displayNameChange: false,
    participantJoined: false,
    participantLeft: false
};

/**
 * Processes commands from external applicaiton.
 * @param message the object with the command
 */
function processCommand(message)
{
    if(message.action != "execute")
    {
        console.error("Unknown action of the message");
        return;
    }
    for(var key in message)
    {
        if(commands[key])
            commands[key].apply(null, message[key]);
    }
}

/**
 * Processes events objects from external applications
 * @param event the event
 */
function processEvent(event) {
    if(!event.action)
    {
        console.error("Event with no action is received.");
        return;
    }

    var i = 0;
    switch(event.action)
    {
        case "add":
            for(; i < event.events.length; i++)
            {
                events[event.events[i]] = true;
            }
            break;
        case "remove":
            for(; i < event.events.length; i++)
            {
                events[event.events[i]] = false;
            }
            break;
        default:
            console.error("Unknown action for event.");
    }

}

/**
 * Sends message to the external application.
 * @param object
 */
function sendMessage(object) {
    window.parent.postMessage(JSON.stringify(object), "*");
}

/**
 * Processes a message event from the external application
 * @param event the message event
 */
function processMessage(event)
{
    var message;
    try {
        message = JSON.parse(event.data);
    } catch (e) {}

    if(!message.type)
        return;
    switch (message.type)
    {
        case "command":
            processCommand(message);
            break;
        case "event":
            processEvent(message);
            break;
        default:
            console.error("Unknown type of the message");
            return;
    }

}

var API = {
    /**
     * Check whether the API should be enabled or not.
     * @returns {boolean}
     */
    isEnabled: function () {
        var hash = location.hash;
        if(hash && hash.indexOf("external") > -1 && window.postMessage)
            return true;
        return false;
    },
    /**
     * Initializes the APIConnector. Setups message event listeners that will
     * receive information from external applications that embed Jitsi Meet.
     * It also sends a message to the external application that APIConnector
     * is initialized.
     */
    init: function () {
        if (window.addEventListener)
        {
            window.addEventListener('message',
                processMessage, false);
        }
        else
        {
            window.attachEvent('onmessage', processMessage);
        }
        sendMessage({type: "system", loaded: true});
    },
    /**
     * Checks whether the event is enabled ot not.
     * @param name the name of the event.
     * @returns {*}
     */
    isEventEnabled: function (name) {
        return events[name];
    },

    /**
     * Sends event object to the external application that has been subscribed
     * for that event.
     * @param name the name event
     * @param object data associated with the event
     */
    triggerEvent: function (name, object) {
        if(this.isEnabled() && this.isEventEnabled(name))
            sendMessage({
                type: "event", action: "result", event: name, result: object});
    },

    /**
     * Removes the listeners.
     */
    dispose: function () {
        if(window.removeEventListener)
        {
            window.removeEventListener("message",
                processMessage, false);
        }
        else
        {
            window.detachEvent('onmessage', processMessage);
        }

    }


};

module.exports = API;
},{}]},{},[1])(1)
});