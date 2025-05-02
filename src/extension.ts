import * as vscode from 'vscode';
import { ShaderDocumentSymbolProvider } from './documentSymbolProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Shader Outline extension activated');
    
    const provider = new ShaderDocumentSymbolProvider();
    const languages = ['UnityShader', 'glsl', 'hlsl', 'plaintext', 'cocos-effect', 'gdshader'];
    const extList = ['.glsl', '.hlsl', '.shader', '.effect', '.vert', '.frag', '.usf', '.ush', '.gdshader', '.cg'];
    const disposable = vscode.languages.registerDocumentSymbolProvider(
        languages.map(lang => ({ language: lang })),
        provider
    );
    
    const editorWatcher = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            const langId = editor.document.languageId;
            //console.log(`${editor.document.fileName} Active document language: ${langId}`);
            //console.log(`Registered languages: ${JSON.stringify(languages)}`);
            if (langId == "UnityShader" || hasMatchingSuffix(extList, editor.document.fileName)) {
                //console.log(`Document should be processed by ShaderDocumentSymbolProvider`);
                try {
                    //const symbols = 
                    provider.provideDocumentSymbols(editor.document, new vscode.CancellationTokenSource().token);
                    //console.log(`Found ${symbols.length} symbols`);
                } catch (err) {
                    console.error('Error providing symbols:', err);
                }
            } else {
                //console.log(`Document language ${langId} not in supported list`);
            }
        }
    });

    context.subscriptions.push(disposable, editorWatcher);
    //console.log('Document symbol provider registered for:', languages);
}

function hasMatchingSuffix(suffixes: string[], target: string): boolean {
    return suffixes.some(suffix => target.endsWith(suffix));
}

export function deactivate() {
}
