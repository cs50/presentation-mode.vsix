# Presentation Mode

Keyboard short-cut to toggle presentation mode: `Ctrl+Alt+P`

Workspace settings in `settings.json` to take effects when presentation mode is on:

```json
"presentation-mode.active": {
    "commands": [
        "workbench.action.closeSidebar",
    ],
    "editor.fontSize": 16,
    "workbench.activityBar.visible": false,
    "workbench.statusBar.visible": false,
    "workbench.colorTheme": "GitHub Dark Default",
    "workbench.colorCustomizations": {
        "[GitHub Dark Default]": {
            "activityBar.background": "#000",
            "editor.background": "#000",
            "sideBar.background": "#000",
            "terminal.background": "#000"
        },
        "[GitHub Light Default]": {
            "activityBar.background": "#fff",
            "editor.background": "#fff",
            "sideBar.background": "#fff",
            "terminal.background": "#fff"
        }
    },
    "window.zoomLevel": 2
}
```

Workspace settings to take effects when presentation mode is off:

```json
"presentation-mode.inactive": {
    "commands": [
        "workbench.action.focusSideBar",
    ],
    "editor.fontSize": 12,
    "workbench.statusBar.visible": true,
    "window.zoomLevel": 0
}
```
