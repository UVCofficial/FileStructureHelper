// src/commands/generateFileTree.ts
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getWorkspaceRoot, createStructureFromPaths, printStructure } from '../utils/workspaceUtils';

export function registerGenerateFileTreeCommand(context: vscode.ExtensionContext) {
    const command = vscode.commands.registerCommand('file-structure-helper.generateFileTree', async (respectGitignore?: boolean) => {
        const rootPath = getWorkspaceRoot();
        if (!rootPath) {
            vscode.window.showErrorMessage('No project folder is open. Please open a folder to generate the file tree.');
            return;
        }

        if (respectGitignore === undefined) {
            const choice = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: 'Respect .gitignore file?'
            });
            if (choice === undefined) return;
            respectGitignore = (choice === 'Yes');
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'File Structure Helper: Generating file tree...',
            cancellable: true
        }, async (progress, token) => {

            token.onCancellationRequested(() => {
                console.log("User canceled the file tree generation.");
            });

            const config = vscode.workspace.getConfiguration('file-structure-helper');
            const ignoreFromConfig: string[] = config.get('tree.ignore', []);
            let allIgnorePatterns = [...ignoreFromConfig];

            if (respectGitignore) {
                progress.report({ message: "Reading .gitignore..." });
                const gitignorePath = path.join(rootPath, '.gitignore');
                try {
                    if (fs.existsSync(gitignorePath)) {
                        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
                        
                        // 将 .gitignore 规则转换为有效的 glob 模式
                        const gitignorePatterns = gitignoreContent
                            .split(/\r?\n/)
                            .filter(line => line.trim() !== '' && !line.trim().startsWith('#'))
                            .map(pattern => {
                                // 移除末尾的斜杠，因为它在 glob 模式中有多余的含义
                                if (pattern.endsWith('/')) {
                                    return pattern.slice(0, -1);
                                }
                                return pattern;
                            });

                        // 将处理过的模式添加到总列表中
                        allIgnorePatterns = [...allIgnorePatterns, ...gitignorePatterns];
                    }
                } catch (error) {
                    console.error("Error reading .gitignore:", error);
                    vscode.window.showWarningMessage("Could not read .gitignore file.");
                }
            }
            
            // 使用 Set 去重并构建最终的排除模式
            // 注意：当一个文件夹被列出时（如 'node_modules'），它会自动匹配其下的所有内容。
            const uniqueIgnorePatterns = [...new Set(allIgnorePatterns)];
            const excludePattern = `{${uniqueIgnorePatterns.join(',')}}`;

            progress.report({ message: "Finding files..." });
            const files = await vscode.workspace.findFiles('**/*', excludePattern, undefined, token);

            if (token.isCancellationRequested) return;

            progress.report({ message: "Building tree structure..." });
            const relativePaths = files.map(file => vscode.workspace.asRelativePath(file));
            const treeStructure = createStructureFromPaths(relativePaths);
            const treeString = `${path.basename(rootPath)}\n${printStructure(treeStructure)}`;

            await vscode.env.clipboard.writeText(treeString);
            
            progress.report({ increment: 100, message: "Copied to clipboard!" });
            await new Promise(resolve => setTimeout(resolve, 3000));
        });
    });

    context.subscriptions.push(command);
}