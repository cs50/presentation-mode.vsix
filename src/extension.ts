import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {


    const partialOnStates = ['on', 'from_off_to_on', 'from_on_to_off'];
    if (partialOnStates.includes(getState(context, 'cs50_presentation_mode_state') || 'undefined')) {

        // If a workspace is reloaded for any reason (e.g., VS Code crashes) while in
        // presentation mode, restore user workspace configuration from backup.
        deactivatePresentationMode(context);
        applyInactiveConfig(context);
    }
    else if (getState(context, 'cs50_presentation_mode_state') === undefined) {

        // If the presentation state is not set, default presentation state to off.
        context.workspaceState.update('cs50_presentation_mode_state', 'off');
    }

	context.subscriptions.push(vscode.commands.registerCommand('presentation-mode.toggle', () => {

        // Toggle presentation mode based on current state
        if (getState(context, 'cs50_presentation_mode_state') === 'off') {
            activatePresentationMode(context);
        } else {
            deactivatePresentationMode(context);
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('presentation-mode.reset', () => {

        // Force setting presentation mode to 'off' and restore user backup settings
        deactivatePresentationMode(context);
        context.workspaceState.update('cs50_presentation_mode_state', 'off');
    }));
}


function getState(context: vscode.ExtensionContext, entry: string): string | undefined {
    return context.workspaceState.get(entry);
}


function activatePresentationMode(context: vscode.ExtensionContext) {

    // Don't activate presentation mode if there is no setting configured.
    const userConfig = getWorkspaceConfig('presentation-mode.active');
    if (Object.keys(userConfig).length === 0) { return; }

    // Activate presentation mode
    context.workspaceState.update('cs50_presentation_mode_state', 'from_off_to_on');
    const workspace = vscode.ConfigurationTarget.Workspace;
    const config = vscode.workspace.getConfiguration('', null);
    const configPrev = vscode.workspace.getConfiguration('', null);
    let configBackup = JSON.parse('{}');

    try {
        for (let [key, value] of Object.entries(userConfig)) {
            if (key === 'commands') {
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
                configBackup[key] = 'undefined';
            }
            config.update(key, value, workspace);
        }
        config.update('presentation-mode.configBackup', configBackup, workspace);
    } catch (e) {
        console.log(e);
    }

    // Presentation mode is activated, set state to 'on'.
    context.workspaceState.update('cs50_presentation_mode_state', 'on');
}


function deactivatePresentationMode(context: vscode.ExtensionContext) {

    // Deactivate presentation mode
    context.workspaceState.update('cs50_presentation_mode_state', 'from_on_to_off');
    const workspace = vscode.ConfigurationTarget.Workspace;
    const config = vscode.workspace.getConfiguration('', null);
    const configBackup = getWorkspaceConfig('presentation-mode.configBackup');

    try {
        for (let [key, value] of Object.entries(configBackup)) {
            try {
                if (value === 'undefined') {
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

    // Presentation mode is deactivated, set state to 'off'.
    context.workspaceState.update('cs50_presentation_mode_state', 'off');
}


function applyInactiveConfig(context: vscode.ExtensionContext) {
    const userConfig = getWorkspaceConfig('presentation-mode.inactive');
    if (Object.keys(userConfig).length === 0) { return; }

    try {
        for (let [key, value] of Object.entries(userConfig)) {
            if (key === 'commands') {
                const commands = JSON.parse(JSON.stringify(value));
                for (let i in commands) {
                    vscode.commands.executeCommand(commands[i]);
                }
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
