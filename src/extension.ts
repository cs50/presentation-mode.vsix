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
    const configPrev = vscode.workspace.getConfiguration('', null);
    const userConfig = getWorkspaceConfig('presentation-mode.active');
    let configBackup = JSON.parse("{}");

    try {
        for (let [key, value] of Object.entries(userConfig)) {
            if (key === "commands") {
                const commands = JSON.parse(JSON.stringify(value));
                for (let i in commands) {
                    vscode.commands.executeCommand(commands[i]);
                }
                continue;
            }
            else if (configPrev.inspect(key)?.workspaceValue !== undefined) {
                configBackup[key] = configPrev.inspect(key)?.workspaceValue;
            }
            else {
                configBackup[key] = "undefined";
            }
            config.update(key, value, workspace);
        }
        config.update("presentation-mode.configBackup", configBackup, workspace);
    } catch (e) {
        console.log(e);
    }
}

function applyInactiveConfig() {
    const workspace = vscode.ConfigurationTarget.Workspace;
    const config = vscode.workspace.getConfiguration('', null);
    const userConfig = getWorkspaceConfig('presentation-mode.inactive');

    try {
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
    } catch (e) {
        console.log(e);
    }
}

function restoreBackupConfig() {
    const workspace = vscode.ConfigurationTarget.Workspace;
    const config = vscode.workspace.getConfiguration('', null);
    const configBackup = getWorkspaceConfig('presentation-mode.configBackup');

    try {
        for (let [key, value] of Object.entries(configBackup)) {
            try {
                if (value === "undefined") {
                    value = undefined;
                }
                config.update(key, value, workspace);
            } catch (e) {
                console.log(e);
            }
        }
    } catch (e) {
        console.log(e);
    }
}

function getWorkspaceConfig(config: string) {
    try {
        return JSON.parse(JSON.stringify(vscode.workspace.getConfiguration(config, null)));
    } catch (e) {
        return undefined;
    }
}
