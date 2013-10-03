/**
 * L.Control.Maximize
 * 0.1.2
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
     * @param {string} rules CSS rules
     * @returns {string}
     */
    var applyStyles = function (target, rules) {
        var currentStyles = target.getAttribute("style");
        if (typeof(currentStyles) === "string") {
            target.setAttribute("style", rules);
        } else {  // IE 6 requires its own approach
            var styles = [];
            var targetRules = rules.split(";");
            var rulesCount = targetRules.length;
            var i;
            // Save current values before applying CSS rules
            for (i = 0; i < rulesCount; i += 1) {
                targetRules[i] = targetRules[i].split(":");
                styles.push(targetRules[i][0], ":", target.style[targetRules[i][0]], ";");
            }
            // Apply rules
            for (i = 0; i < rulesCount; i += 1) {
                target.style[targetRules[i][0]] = targetRules[i][1];
            }
            currentStyles = styles.join("");
        }
        return currentStyles;
    };

    /**
     * Applies page scroll position. Returns original position.
     * @param {Array} position Target position
     * @returns {Array}
     */
    var applyScrollPosition = function (position) {
        var documentElement = document.documentElement || document.body.parentNode || document.body;
        var original = [
            (typeof(window.pageXOffset) !== "undefined") ? window.pageXOffset : documentElement.scrollLeft,
            (typeof(window.pageYOffset) !== "undefined") ? window.pageYOffset : documentElement.scrollTop
        ];
        window.scrollTo(position[0], position[1]);
        return original;
    };

    var containerMaximizedClassName = "leaflet-maximized";

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
            button.innerHTML = "&#10064;";
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

    // One-word shortcuts
    L.MaximizeControl = L.Control.Maximize;
    L.maximizeControl = L.control.maximize;

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
                var bodyStyles = "overflow:hidden;height:100%;margin:0;padding:0;border:0";
                var containerStyle = "position:absolute;width:100%;height:100%;top:0;right:0;bottom:0;left:0;margin:0;padding:0;border:0";
                var container = this.getContainer();

                // Scroll page to the top
                this._originalScrollPosition = applyScrollPosition([0, 0]);
                // Set body styles
                this._originalBodyStyles = applyStyles(document.body, bodyStyles);
                // Set container styles
                this._originalContainerStyles = applyStyles(container, containerStyle);

                // Add maximized state class name to the map container
                L.DomUtil.addClass(container, containerMaximizedClassName);

                this._isMaximized = true;
                this.fire("maximizedstatechange");
            }
        },

        /**
         * Restores map on the page.
         */
        restore: function () {
            if (this.isMaximized()) {
                var container = this.getContainer();

                // Restore container styles
                applyStyles(container, this._originalContainerStyles);
                // Restore body styles
                applyStyles(document.body, this._originalBodyStyles);
                // Restore scroll position
                applyScrollPosition(this._originalScrollPosition);

                // Cleanup
                delete this._originalContainerStyles;
                delete this._originalBodyStyles;
                delete this._originalScrollPosition;

                // Remove maximized class name from container (bulletproof way)
                L.DomUtil.removeClass(container, containerMaximizedClassName);

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
            this.maximizeControl = L.control.maximize().addTo(this);
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
