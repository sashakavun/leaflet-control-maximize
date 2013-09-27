/**
 * L.Control.Maximize
 * 0.1.1
 *
 * Maximize Control plugin for Leaflet library
 * http://github.com/keta/L.Control.Maximize
 *
 * Copyright 2013, Aleksandr "keta" Kavun
 * Licensed under the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 */
(function () {
    "use strict";

    /**
     * Applies style rules to the DOM object. Returns original rules.
     * @param {HTMLElement} target HTML element
     * @param {object} rules CSS rules
     * @returns {object}
     */
    var applyStyles = function (target, rules) {
        var currentStyle = (target.currentStyle || getComputedStyle(target, null));
        var original = {};
        for (var rule in rules) {
            if (rules.hasOwnProperty(rule)) {
                original[rule] = currentStyle[rule];
                target.style[rule] = rules[rule];
            }
        }
        return original;
    };

    /**
     * Applies page scroll position. Returns original position.
     * @param {{scrollTop: number, scrollLeft: number}} position Target position
     * @returns {{scrollTop: number, scrollLeft: number}}
     */
    var applyScrollPosition = function (position) {
        var original = {
            scrollTop: document.body.scrollTop || document.documentElement.scrollTop,
            scrollLeft: document.body.scrollLeft || document.documentElement.scrollLeft
        };
        document.body.scrollTop = position.scrollTop;
        document.body.scrollLeft = position.scrollLeft;
        document.documentElement.scrollTop = position.scrollTop;
        document.documentElement.scrollLeft = position.scrollLeft;
        return original;
    };

    /**
     * Styles for container to maximize map
     * @type {object}
     */
    var containerStyle = {
        "position": "absolute",
        "width": "100%",
        "height": "100%",
        "top": "0",
        "right": "0",
        "bottom": "0",
        "left": "0",
        "margin": "0",
        "padding": "0",
        "border": "0"
    };

    /**
     * Styles for body to maximize map
     * @type {object}
     */
    var bodyStyles = {
        "overflow": "hidden",
        // IE 6
        "height": "100%",
        "margin": "0",
        "padding": "0",
        "border": "0"
    };

    /**
     * Maximize Control
     * @property {L.Map} _map
     */
    L.Control.Maximize = L.Control.extend({
        options: {
            title: "Maximize map",
            position: "topleft"
        },

        /**
         * @param {L.Map} map
         */
        onAdd: function (map) {
            this._map = map;
            return this._createButton();
        },

        /**
         * Creates button DOM element.
         * @returns {HTMLDivElement}
         * @private
         */
        _createButton: function () {
            var container = L.DomUtil.create("div", "leaflet-control-zoom leaflet-control-maximize leaflet-bar leaflet-control"); // Using "leaflet-control-zoom" class to avoid adding IE 6 styles for borders

            var button = L.DomUtil.create("a", "leaflet-control-maximize-button", container);
            button.innerHTML = "❐";
            button.href = "#";
            button.title = this.options.title;
            L.DomEvent.on(button, "click", this._onClick, this);

            return container;
        },

        /**
         * Button click event listener.
         * @param {MouseEvent} ev
         * @private
         */
        _onClick: function (ev) {
            this._map.toggleMaximized();
            L.DomEvent.preventDefault(ev);
        }
    });

    /**
     * Maximize Control factory.
     * @param {object} options
     * @returns {L.Control.Maximize}
     */
    L.control.maximize = function (options) {
        return new L.Control.Maximize(options);
    };

    // Map options
    L.Map.mergeOptions({
        maximizeControl: false,
        restoreFromMaximizedOnEsc: true
    });

    // Map methods for maximizing
    L.Map.include({
        /**
         * Returns `true` when map is maximized.
         * @returns {boolean}
         */
        isMaximized: function () {
            // Explicit casting to boolean
            return !!this._isMaximized;
        },

        /**
         * Toggles map maximized state.
         */
        toggleMaximized: function () {
            if (this.isMaximized()) {
                this.restore();
            } else {
                this.maximize();
            }
        },

        /**
         * Maximizes map.
         */
        maximize: function () {
            if (!this.isMaximized()) {
                // Scroll page to the top
                this._originalScrollPosition = applyScrollPosition({ scrollTop: 0, scrollLeft: 0 });
                // Set body styles
                this._originalBodyStyles = applyStyles(document.body, bodyStyles);
                // Set container styles
                this._originalContainerStyles = applyStyles(this.getContainer(), containerStyle);

                this._isMaximized = true;
                this.fire("maximizedstatechange");
            }
        },

        /**
         * Restores map on the page.
         */
        restore: function () {
            if (this.isMaximized()) {
                // Restore container styles
                applyStyles(this.getContainer(), this._originalContainerStyles);
                // Restore body styles
                applyStyles(document.body, this._originalBodyStyles);
                // Restore scroll position
                applyScrollPosition(this._originalScrollPosition);

                // Cleanup
                delete this._originalContainerStyles;
                delete this._originalBodyStyles;
                delete this._originalScrollPosition;

                this._isMaximized = false;
                this.fire("maximizedstatechange");
            }
        },

        _maximizedStateKeyHandler: function (ev) {
            if (this.options.restoreFromMaximizedOnEsc && this.isMaximized() && (ev.keyCode === 27)) {
                this.toggleMaximized();
            }
        }
    });

    // Map initialization hook
    L.Map.addInitHook(function () {
        if (this.options.maximizeControl) {
            // Add control if requested in options
            this.maximizeControl = L.control.maximize();
            this.maximizeControl.addTo(this);
        }

        // Updates map on maximization and restore
        this.on("maximizedstatechange", this.invalidateSize, this);

        // Adds key press handler to catch Esc
        this.on("maximizedstatechange", function () {
            if (this.isMaximized()) {
                L.DomEvent.on(document.body, "keyup", this._maximizedStateKeyHandler, this);
            } else {
                L.DomEvent.off(document.body, "keyup", this._maximizedStateKeyHandler, this);
            }
        }, this);
    });

})();
