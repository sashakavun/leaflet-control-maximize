/**
 * L.Control.Maximize
 * 0.0.1
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
            var container = L.DomUtil.create("div", "leaflet-control-maximize leaflet-bar leaflet-control");

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

    // Map option
    L.Map.mergeOptions({
        maximizeControl: false
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
                var styles = this.getContainer().style;

                // Save map container styles
                this._restoreStylePosition = styles.position;
                this._restoreStyleWidth = styles.width;
                this._restoreStyleHeight = styles.height;
                this._restoreStyleTop = styles.top;
                this._restoreStyleRight = styles.right;
                this._restoreStyleBottom = styles.bottom;
                this._restoreStyleLeft = styles.left;

                // Apply container styles
                styles.position = "fixed";
                styles.width = "auto";
                styles.height = "auto";
                styles.top = "0";
                styles.right = "0";
                styles.bottom = "0";
                styles.left = "0";

                // Hide scrollbars
                this._restoreBodyOverflow = document.body.style.overflow;
                document.body.style.overflow = "hidden";

                this._isMaximized = true;
                this.fire("maximizedstatechange", { maximized: true });
            }
        },

        /**
         * Restores map on the page.
         */
        restore: function () {
            if (this.isMaximized()) {
                var styles = this.getContainer().style;

                // Restore container styles
                styles.position = this._restoreStylePosition;
                styles.width = this._restoreStyleWidth;
                styles.height = this._restoreStyleHeight;
                styles.top = this._restoreStyleTop;
                styles.right = this._restoreStyleRight;
                styles.bottom = this._restoreStyleBottom;
                styles.left = this._restoreStyleLeft;

                // Restore scrollbars
                document.body.style.overflow = this._restoreBodyOverflow;

                this._isMaximized = false;
                this.fire("maximizedstatechange", { maximized: false });
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
    });

})();
