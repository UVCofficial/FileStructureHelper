// src/extension.ts
import * as vscode from 'vscode';
import { registerGenerateFileTreeCommand } from './commands/generateFileTree';
import { registerSearchFilesCommand } from './commands/searchFiles';

// 创建一个输出频道，用于专业的日志记录
const outputChannel = vscode.window.createOutputChannel("File Structure Helper");

export function activate(context: vscode.ExtensionContext) {
    outputChannel.appendLine('Activating "File Structure Helper" extension...');
    outputChannel.appendLine(`Extension path: ${context.extensionPath}`);
    outputChannel.appendLine(`Workspace folders: ${vscode.workspace.workspaceFolders?.length || 0}`);

    try {
        // 注册所有命令
        registerGenerateFileTreeCommand(context);
        registerSearchFilesCommand(context);
        
        outputChannel.appendLine('Commands registered successfully');
        outputChannel.appendLine('"File Structure Helper" is now active.');
        
        // 在右下角给出一个不打扰的提示
        vscode.window.setStatusBarMessage('File Structure Helper is ready!', 3000);

		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider(
				'fileStructureHelperView',
				new FileStructureSidebarProvider(context)
			)
		);
        
    } catch (error) {
        outputChannel.appendLine(`Error during activation: ${error}`);
        vscode.window.showErrorMessage(`Extension activation failed: ${error}`);
    }
}

export function deactivate() {
    outputChannel.appendLine('Deactivating "File Structure Helper" extension.');
}

class FileStructureSidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        // 监听前端消息
        webviewView.webview.onDidReceiveMessage(async (msg) => {
            if (msg.type === 'search') {
                // 复用 searchFiles 逻辑
                const files = await vscode.workspace.findFiles('**/*', undefined);
                const keyword = msg.value.toLowerCase();
                const matched = files
                    .map(file => ({
                        label: vscode.workspace.asRelativePath(file),
                        fsPath: file.fsPath
                    }))
                    .filter(item => item.label.toLowerCase().includes(keyword));
                webviewView.webview.postMessage({ type: 'searchResult', results: matched });
            }
            if (msg.type === 'openFile') {
                const uri = vscode.Uri.file(msg.fsPath);
                vscode.window.showTextDocument(uri);
            }
            if (msg.type === 'copyTree') {
                // 复用 generateFileTree 逻辑
                await vscode.commands.executeCommand('file-structure-helper.generateFileTree');
            }
        });
    }

    getHtmlForWebview(webview: vscode.Webview): string {
		return /* html */ `
			<!DOCTYPE html>
			<html lang="zh-CN">
			<head>
				<meta charset="UTF-8">
				<style>
					html, body {
						height: 100%;
						padding: 0;
						margin: 0;
					}
					body {
						height: 100vh;
						background: var(--vscode-sideBar-background);
						color: var(--vscode-sideBar-foreground);
						font-family: var(--vscode-font-family);
						display: flex;
						flex-direction: column;
					}
					.container {
						display: flex;
						flex-direction: column;
						height: 100%;
						flex: 1;
					}
					.search-bar {
						display: flex;
						align-items: center;
						padding: 8px;
						gap: 8px;
					}
					input[type="text"], button {
						height: 32px;
						font-size: 14px;
						border-radius: 4px;
						box-sizing: border-box;
						line-height: 32px;
					}
					input[type="text"] {
						flex: 1;
						padding: 0 8px;
						border: 1px solid var(--vscode-input-border, var(--vscode-focusBorder));
						background: var(--vscode-input-background);
						color: var(--vscode-input-foreground);
						outline: none;
					}
					input[type="text"]:focus {
						border-color: var(--vscode-focusBorder);
					}
					button {
						background: var(--vscode-button-background);
						color: var(--vscode-button-foreground);
						border: none;
						padding: 0 16px;
						cursor: pointer;
						transition: background 0.2s;
						min-width: 110px;
						white-space: nowrap;
					}
					button:hover {
						background: var(--vscode-button-hoverBackground);
					}
					.result-list {
						flex: 1;
						overflow-y: auto;
						margin: 0;
						padding: 0 0 8px 0;
					}
					ul {
						list-style: none;
						margin: 0;
						padding: 0;
					}
					li {
						padding: 6px 12px;
						cursor: pointer;
						border-radius: 3px;
						transition: background 0.15s;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
					li:hover {
						background: var(--vscode-list-hoverBackground);
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="search-bar">
						<input id="searchInput" type="text" placeholder="搜索文件..." />
						<button id="copyBtn">Copy Structure</button>
					</div>
					<div class="result-list">
						<ul id="resultList"></ul>
					</div>
				</div>
				<script>
					const vscode = acquireVsCodeApi();
					const input = document.getElementById('searchInput');
					const btn = document.getElementById('copyBtn');
					const list = document.getElementById('resultList');
	
					input.addEventListener('input', () => {
						vscode.postMessage({ type: 'search', value: input.value });
					});
	
					btn.addEventListener('click', () => {
						vscode.postMessage({ type: 'copyTree' });
					});
	
					window.addEventListener('message', event => {
						const msg = event.data;
						if (msg.type === 'searchResult') {
							list.innerHTML = '';
							msg.results.forEach(item => {
								const li = document.createElement('li');
								li.textContent = item.label;
								li.title = item.fsPath;
								li.onclick = () => {
									vscode.postMessage({ type: 'openFile', fsPath: item.fsPath });
								};
								list.appendChild(li);
							});
						}
					});
				</script>
			</body>
			</html>
		`;
	}
}