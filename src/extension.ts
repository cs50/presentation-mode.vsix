import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const activePartialOnStates = ['on', 'from_off_to_on', 'from_on_to_off'];

    if (activePartialOnStates
        .includes(getState(context, "cs50_presentation_mode_state") || "undefined")) {

        // If a workspace is reloaded for any reason (e.g., VS Code crashes) while in
        // presentation mode, restore user workspace configuration from backup
        restoreBackupConfig(context);
        applyInactiveConfig(context);
    }
    else if (getState(context, "cs50_presentation_mode_state") === undefined) {

        // If the presentation state is not set, default presentation state to off
        context.workspaceState.update("cs50_presentation_mode_state", "off");
    }

	context.subscriptions.push(vscode.commands.registerCommand('presentation-mode.toggle', () => {
        if (getState(context, "cs50_presentation_mode_state") === "off") {
            applyActiveConfig(context);
        } else {
            restoreBackupConfig(context);
            applyInactiveConfig(context);
        }
    }));
}

function getState(context: vscode.ExtensionContext, entry: string): string | undefined {
    return context.workspaceState.get(entry);
}

function applyActiveConfig(context: vscode.ExtensionContext) {
    context.workspaceState.update("cs50_presentation_mode_state", "from_off_to_on");
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
    context.workspaceState.update("cs50_presentation_mode_state", "on");
}

function applyInactiveConfig(context: vscode.ExtensionContext) {
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

function restoreBackupConfig(context: vscode.ExtensionContext) {
    context.workspaceState.update("cs50_presentation_mode_state", "from_on_to_off");
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
    applyInactiveConfig(context);
    context.workspaceState.update("cs50_presentation_mode_state", "off");
}

function getWorkspaceConfig(config: string) {
    try {
        return JSON.parse(JSON.stringify(vscode.workspace.getConfiguration(config, null)));
    } catch (e) {
        return undefined;
    }
}
