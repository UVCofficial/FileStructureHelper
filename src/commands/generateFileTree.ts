// src/commands/generateFileTree.ts
import * as vscode from 'vscode';
import * as path from 'path';
import { getWorkspaceRoot, createStructureFromPaths, printStructure } from '../utils/workspaceUtils';

export function registerGenerateFileTreeCommand(context: vscode.ExtensionContext) {
    const command = vscode.commands.registerCommand('file-structure-helper.generateFileTree', async () => {
        const rootPath = getWorkspaceRoot();
        if (!rootPath) {
            vscode.window.showErrorMessage('No project folder is open. Please open a folder to generate the file tree.');
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'File Structure Helper: Generating file tree...',
            cancellable: true
        }, async (progress, token) => {

            token.onCancellationRequested(() => {
                console.log("User canceled the file tree generation.");
            });

            // progress.report({ increment: 0, message: "Reading configuration..." });
            
            // 读取用户配置的忽略项
            const config = vscode.workspace.getConfiguration('file-structure-helper');
            const ignorePatterns: string[] = config.get('tree.ignore', []);
            const excludePattern = `{${ignorePatterns.join(',')}}`;

            // progress.report({ increment: 20, message: "Finding files..." });
            
            // 使用 findFiles 并传入 exclude 参数
            const files = await vscode.workspace.findFiles('**/*', excludePattern, undefined, token);

            if (token.isCancellationRequested) return;

            // progress.report({ increment: 50, message: "Building tree structure..." });
            
            const relativePaths = files.map(file => vscode.workspace.asRelativePath(file));
            const treeStructure = createStructureFromPaths(relativePaths);
            const treeString = `${path.basename(rootPath)}\n${printStructure(treeStructure)}`;

            // progress.report({ increment: 90, message: "Copying to clipboard..." });

            await vscode.env.clipboard.writeText(treeString);
            
            // 完成后，短暂显示一个完成消息
            progress.report({ increment: 100, message: "Copied to clipboard!" });

            // 延迟一点关闭，让用户能看到完成消息
            await new Promise(resolve => setTimeout(resolve, 3000));
        });
    });

    context.subscriptions.push(command);
}