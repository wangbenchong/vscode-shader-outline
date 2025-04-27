
import * as vscode from 'vscode';

export class ShaderDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    private braceStack: {position: vscode.Position, symbol: vscode.DocumentSymbol}[] = [];

    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken): vscode.DocumentSymbol[] {
        
        const tokenToKind = this.tokenToKind;
        const text = document.getText();
        const matchedList = this.matchAll(this.pattern, text);
        const symbols: vscode.DocumentSymbol[] = [];
        this.braceStack = [];

        for (const matched of matchedList) {
            try {
                const type = matched[1] || matched[4] || matched[6] ? (matched[6] ? 'function' : '#define') : '';
                const name = matched[2] || matched[3] || matched[5] || '';
                if (!name) continue;
                
                const kind = tokenToKind[type] || vscode.SymbolKind.Variable;
                const position = document.positionAt(matched.index || 0);
                const range = new vscode.Range(position, position);
                const symbol = new vscode.DocumentSymbol(
                    name,
                    '',
                    kind,
                    range,
                    range
                );

                symbols.push(symbol);
                // 处理大括号匹配
                const matchedText = matched[0];
                if (matchedText.includes('{')) {
                    this.braceStack.push({position, symbol});
                } else if (matchedText.includes('}') && this.braceStack.length > 0) {
                    const lastBrace = this.braceStack.pop();
                    if (lastBrace) {
                        const endPosition = document.positionAt((matched.index || 0) + matchedText.length);
                        lastBrace.symbol.range = new vscode.Range(lastBrace.position, endPosition);
                    }
                }
            } catch (err) {
                console.error('Error processing symbol:', err);
            }
        }

        return symbols;
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
            'void': vscode.SymbolKind.Function,
            'float': vscode.SymbolKind.Function,
            'float2': vscode.SymbolKind.Function, 
            'float3': vscode.SymbolKind.Function,
            'float4': vscode.SymbolKind.Function,
            'half': vscode.SymbolKind.Function,
            'half2': vscode.SymbolKind.Function,
            'half3': vscode.SymbolKind.Function,
            'half4': vscode.SymbolKind.Function,
            'int': vscode.SymbolKind.Function,
            'bool': vscode.SymbolKind.Function
        };
    }

    private get pattern() {
        return /(^|\s)(Shader|Properties|SubShader|(Pass|pass|CBUFFER_START|CBUFFER_END)(?=\s*\{)|HLSLPROGRAM|HLSLINCLUDE|struct|Tags|Stencil|Cull|Lighting|ZWrite|ZTest|Blend|ColorMask)\b\s*([^\s;{}()]*)|(^\s*[a-zA-Z_]\w*\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*(?:[^{]*\{))|(^\s*\[\w+\])|(^\s*(?:inline\s+)?[a-zA-Z_]\w*\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*(?:[^{;]*)?\{)/gm;
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
