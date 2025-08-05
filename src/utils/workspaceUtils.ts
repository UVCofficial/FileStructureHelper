// src/utils/workspaceUtils.ts
import * as vscode from 'vscode';

export function getWorkspaceRoot(): string | undefined {
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

interface FileNode {
    [key: string]: FileNode;
}

export function createStructureFromPaths(paths: string[]): FileNode {
    const root: FileNode = {};
    for (const p of paths.sort()) { // Sort paths to ensure directories are processed before files within them
        let currentNode = root;
        p.split('/').forEach(part => {
            if (!currentNode[part]) {
                currentNode[part] = {};
            }
            currentNode = currentNode[part];
        });
    }
    return root;
}

export function printStructure(node: FileNode, prefix = ''): string {
    let result = '';
    const entries = Object.keys(node);
    entries.forEach((entry, index) => {
        const isLast = index === entries.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        result += `${prefix}${connector}${entry}\n`;
        if (Object.keys(node[entry]).length > 0) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            result += printStructure(node[entry], newPrefix);
        }
    });
    return result;
}