L.Control.Maximize
==================

Maximize Control plugin for Leaflet.

Adds a button allowing user to maximize map to the whole page.

Check out the [example](http://keta.github.io/leaflet-control-maximize/example.html).


Browser Support
---------------

Plugin is tested and approved to work in the following browsers:

* Chrome 29+
* Firefox 23+
* Internet Explorer 6+
* Opera 12.16, 16+
* Safari 5.1.16 (Windows)
* Safari on iPad 3 with iOS 6.1.3


Usage
-----

Add control to the map object:

```js
var map = L.map("map");
L.control.maximize().addTo(map);
```

Or you may just set `maximizeControl` map option to `true`:

```js
var map = L.map("map", { maximizeControl: true });
```


API
---

Plugin introduces following `L.Map` options:

`maximizeControl` If it set to `true`, map will be created with maximize control (`false` by default).

`restoreFromMaximizedOnEsc` If set to `true`, map can be restored to the original state from maximized by pressing Esc key (`true` by default).

Following `L.Map` methods are available regardless of whether button is added to the map or not:

`isMaximized()` Returns `true` when map is maximized.

`toggleMaximized()` Toggles map maximized state.

`maximize()` Maximizes map.

`restore()` Restores map on the page.

Also `L.Map` generates `maximizedstatechange` event on state change.


Development
-----------

Project requires `npm` for development environment.

To set up, run following command in the project's directory:

```
npm install
```

To build minified file, run `build` Grunt task in the project's directory:

```
grunt build
```
