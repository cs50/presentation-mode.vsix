import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('presentation-mode.toggle', () => {
        if (context.workspaceState.get("cs50_presentation_mode_state") !== undefined) {
            if (context.workspaceState.get("cs50_presentation_mode_state") === "off") {
                applyActiveConfig();
                context.workspaceState.update("cs50_presentation_mode_state", "on");
            } else {
                restoreBackupConfig();
                applyInactiveConfig();
                context.workspaceState.update("cs50_presentation_mode_state", "off");
            }
        } else {
            applyActiveConfig();
            context.workspaceState.update("cs50_presentation_mode_state", "on");
        }
    }));
}

export function deactivate() {
    restoreBackupConfig();
}

function applyActiveConfig() {
    const workspace = vscode.ConfigurationTarget.Workspace;
    const config = vscode.workspace.getConfiguration('', null);

    // Get user settings
    const userConfig = JSON.parse(JSON.stringify(vscode.workspace.getConfiguration('presentation-mode.active', null)));

    // Get current workspace setting
    const workspaceConfig = vscode.workspace.getConfiguration('', null);

    // Create config backup
    let configBackup = JSON.parse("{}");
    for (let [key, value] of Object.entries(userConfig)) {
        if (key === "commands") {
            const commands = JSON.parse(JSON.stringify(value));
            for (let i in commands) {
                vscode.commands.executeCommand(commands[i]);
            }
            continue;
        }
        else if (workspaceConfig.inspect(key)?.workspaceValue !== undefined) {
            configBackup[key] = workspaceConfig.inspect(key)?.workspaceValue;
        }
        else {
            configBackup[key] = "undefined";
        }
        config.update(key, value, workspace);
    }
    config.update("presentation-mode.configBackup", configBackup, workspace);
}

function applyInactiveConfig() {
    const workspace = vscode.ConfigurationTarget.Workspace;
    const config = vscode.workspace.getConfiguration('', null);
    const userConfig = JSON.parse(JSON.stringify(vscode.workspace.getConfiguration('presentation-mode.inactive', null)));
    for (let [key, value] of Object.entries(userConfig)) {
        if (key === "commands") {
            const commands = JSON.parse(JSON.stringify(value));
            for (let i in commands) {
                vscode.commands.executeCommand(commands[i]);
            }
        } else {
            config.update(key, value, workspace);
        }
    }
    vscode.commands.executeCommand("workbench.action.focusSideBar");
}

function restoreBackupConfig() {
    const workspace = vscode.ConfigurationTarget.Workspace;
    const config = vscode.workspace.getConfiguration('', null);
    const configBackup = JSON.parse(JSON.stringify(vscode.workspace.getConfiguration('presentation-mode.configBackup', null)));
    for (let [key, value] of Object.entries(configBackup)) {
        if (value === "undefined") {
            value = undefined;
        }
        config.update(key, value, workspace);
    }
}
