L.Control.Maximize
==================

Maximize Control plugin for Leaflet.

Adds a button allowing user to maximize map to the whole page.


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

