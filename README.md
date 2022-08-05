# Presentation Mode

Bring presentation mode to VS Code.

## Keyboard Shortcut

`Ctrl+Alt+P`

## Workspace Settings

Workspace customizations to take effect when presentation mode is on:

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

## Workspace Commands

Workspace commands to execute when presentation mode is off:

```json
"presentation-mode.inactive": {
    "commands": [
        "workbench.action.focusSideBar",
    ]
}
```

This is useful and necessary because some workspace UI states/behaviors can not be easily monitored and controlled via workspace settings. Specifying commands to be executed when presentation mode is toggled ensures the workspace layout is deterministically restored.

## Package Extension and Install (dev only)

If the command-line tool `Visual Studio Code Extensions` is not installed, run this command to install `vsce` globally:
```
npm install -g vsce
```
Install all npm dependencies, package extension, and install:
```
npm install
vsce package
code --install-extension presentation-mode-0.0.1.vsix
```
