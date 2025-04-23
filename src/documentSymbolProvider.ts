
import * as vscode from 'vscode';

export class ShaderDocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken): vscode.SymbolInformation[] {
        
        const tokenToKind = this.tokenToKind;
        const text = document.getText();
        const matchedList = this.matchAll(this.pattern, text);

        return matchedList.map((matched) => {
            try {
                const type = matched[1] || matched[4] ? '#define' : '';
                const name = matched[2] || matched[3] || '';
                if (!name) return null;
                
                const kind = tokenToKind[type] || vscode.SymbolKind.Variable;
                const position = document.positionAt(matched.index || 0);
                
                return new vscode.SymbolInformation(
                    name,
                    kind,
                    '',
                    new vscode.Location(document.uri, position)
                );
            } catch (err) {
                console.error('Error processing symbol:', err);
                return null;
            }
        }).filter(Boolean) as vscode.SymbolInformation[];
    }

    private get tokenToKind(): { [name: string]: vscode.SymbolKind; } {
        return {
            'Shader': vscode.SymbolKind.Module,
            'Properties': vscode.SymbolKind.Class,
            'SubShader': vscode.SymbolKind.Namespace,
            'Pass': vscode.SymbolKind.Class,
            'pass': vscode.SymbolKind.Class,
            'HLSLPROGRAM': vscode.SymbolKind.Module,
            'HLSLINCLUDE': vscode.SymbolKind.Module,
            'struct': vscode.SymbolKind.Struct,
            'Tags': vscode.SymbolKind.Property,
            'Stencil': vscode.SymbolKind.Property,
            'Cull': vscode.SymbolKind.Property,
            'Lighting': vscode.SymbolKind.Property,
            'ZWrite': vscode.SymbolKind.Property,
            'ZTest': vscode.SymbolKind.Property,
            'Blend': vscode.SymbolKind.Property,
            'ColorMask': vscode.SymbolKind.Property,
            'return': vscode.SymbolKind.Function
        };
    }

    private get pattern() {
        return /(^|\s)(Shader|Properties|SubShader|(Pass|pass|CBUFFER_START|CBUFFER_END)(?=\s*\{)|HLSLPROGRAM|HLSLINCLUDE|struct|Tags|Stencil|Cull|Lighting|ZWrite|ZTest|Blend|ColorMask|return)\b\s*([^\s;{}()]*)|(^\s*[a-zA-Z_]\w*\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*[^{]*\{)|(^\s*\[\w+\])/gm;
    }

    private matchAll(pattern: RegExp, text: string): Array<RegExpMatchArray> {
        const out: RegExpMatchArray[] = [];
        pattern.lastIndex = 0;
        let match: RegExpMatchArray | null;
        while ((match = pattern.exec(text))) {
            // 只过滤Pass后跟方括号的情况，保留大括号情况
            /*const startPos = match.index || 0;
            const nextChar = text[startPos + match[0].length];
            if (match[1] === 'Pass' && nextChar === '[') {
                continue;
            }*/
            out.push(match);
        }
        return out;
    }
}
