// src/commands/searchFiles.ts
import * as vscode from 'vscode';
import * as path from 'path';

export function registerSearchFilesCommand(context: vscode.ExtensionContext) {
    const command = vscode.commands.registerCommand('file-structure-helper.searchFiles', async () => {
        const config = vscode.workspace.getConfiguration('file-structure-helper');
        const ignorePatterns: string[] = config.get('tree.ignore', []); // 复用忽略配置
        const excludePattern = `{${ignorePatterns.join(',')}}`;

        const files = await vscode.workspace.findFiles('**/*', excludePattern);

        if (files.length === 0) {
            vscode.window.showInformationMessage('No searchable files found in the project.');
            return;
        }

        const items: vscode.QuickPickItem[] = files.map(file => {
            const relativePath = vscode.workspace.asRelativePath(file);
            return {
                label: `$(file) ${path.basename(relativePath)}`, // 使用 Octicon 图标
                detail: path.dirname(relativePath),             // 在详情中显示文件所在目录
                description: file.fsPath,                       // 内部使用，存放完整路径
            };
        });

        const selected = await vscode.window.showQuickPick(items, {
            matchOnDetail: true, // 允许用户搜索目录名
            placeHolder: 'Type to search for a file',
        });

        if (selected && selected.description) {
            const fileUri = vscode.Uri.file(selected.description);
            await vscode.workspace.openTextDocument(fileUri).then(doc => {
                vscode.window.showTextDocument(doc);
            });
        }
    });

    context.subscriptions.push(command);
}