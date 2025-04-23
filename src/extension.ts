import * as vscode from 'vscode';
import { ShaderDocumentSymbolProvider } from './documentSymbolProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Shader Outline extension activated');
    
    const provider = new ShaderDocumentSymbolProvider();
    const languages = ['glsl', 'hlsl', 'shader', 'UnityShader'];
    const disposable = vscode.languages.registerDocumentSymbolProvider(
        languages.map(lang => ({ language: lang })),
        provider
    );
    
    // 添加语言模式验证
    const editorWatcher = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            const langId = editor.document.languageId;
            console.log(`Active document language: ${langId}`);
            console.log(`Registered languages: ${JSON.stringify(languages)}`);
            if (languages.includes(langId)) {
                console.log(`Document should be processed by ShaderDocumentSymbolProvider`);
                // 立即触发符号提供
                try {
                    const symbols = provider.provideDocumentSymbols(editor.document, new vscode.CancellationTokenSource().token);
                    console.log(`Found ${symbols.length} symbols`);
                } catch (err) {
                    console.error('Error providing symbols:', err);
                }
            } else {
                console.log(`Document language ${langId} not in supported list`);
            }
        }
    });

    context.subscriptions.push(disposable, editorWatcher);
    console.log('Document symbol provider registered for:', languages);
}

export function deactivate() {
}
