
import * as vscode from 'vscode';

export class ShaderDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    private braceStack: {position: vscode.Position, symbol: vscode.DocumentSymbol}[] = [];

    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken): vscode.DocumentSymbol[] {
        
        //const tokenToKind = this.tokenToKind;
        const text = document.getText();
        const matchedList = this.matchAll(this.pattern, text);
        const symbols: vscode.DocumentSymbol[] = [];
        this.braceStack = [];

        for (const matched of matchedList) {
            try {
                if (!matched[0]) continue;
                const allText = matched[0].replace('{','').trim();
                let kind: vscode.SymbolKind;
                if(allText.startsWith("Shader") ||  allText.startsWith("SubShader"))
                {
                    kind = vscode.SymbolKind.Class;
                }
                else if(allText.startsWith("Pass") || allText.startsWith("pass"))
                {
                    kind = vscode.SymbolKind.Class;
                }
                else if(allText.startsWith("Cull") || allText.startsWith("ZWrite") || allText.startsWith("ZTest") || allText.startsWith("Blend") || allText.startsWith("ColorMask") || allText.startsWith("Lighting") || allText.startsWith("LOD"))
                {
                    kind = vscode.SymbolKind.Property;
                }
                else if (allText.startsWith("struct")) 
                {
                    kind = vscode.SymbolKind.Struct;
                }
                else if (allText.startsWith("CBUFFER_START") || allText.startsWith("HLSLPROGRAM") || allText.startsWith("HLSLINCLUDE") || allText.startsWith("Properties") || allText.startsWith("Tags") || allText.startsWith("Stencil")) 
                {
                    kind = vscode.SymbolKind.Module;
                }
                else if(allText.startsWith("_"))
                {
                    kind = vscode.SymbolKind.Variable;
                }
                else if(matched[0].includes("(") && matched[0].includes(")"))
                {
                    kind = vscode.SymbolKind.Function;
                }
                else if (this.braceStack.length > 0 && this.braceStack[this.braceStack.length-1].symbol.kind === vscode.SymbolKind.Struct) 
                {
                    kind = vscode.SymbolKind.Field;
                } 
                else 
                {
                    kind = vscode.SymbolKind.Variable;
                }
                const position = document.positionAt(matched.index || 0);
                const range = new vscode.Range(position, position);
                const symbol = new vscode.DocumentSymbol(
                    allText,
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

    private get pattern() {
        return /(^|\s)(Shader|Properties|SubShader|(Pass|pass)(?=\s*\{)|(struct)\s+([a-zA-Z_]\w*)|Tags|Stencil)\b\s*(\[[^\]]+\]|[^\s;{}()]*)|(^|\s)(Cull)\s+(Off|Back|Front)(?=\s|;|$)|\b(Lighting)\s+(On|Off|\[[^\]]+\])(?=\s|;|$)|\b(ZWrite)\s+(On|Off)(?=\s|;|$)|\b(ZTest)\s+(Less|Greater|LEqual|GEqual|Equal|NotEqual|Always|\[[^\]]+\])(?=\s|;|$)|\b(Blend)\s+(Off|(?:One|Zero|SrcColor|SrcAlpha|DstColor|DstAlpha|OneMinusSrcColor|OneMinusSrcAlpha|OneMinusDstColor|OneMinusDstAlpha)(?:\s+(?:One|Zero|SrcColor|SrcAlpha|DstColor|DstAlpha|OneMinusSrcColor|OneMinusSrcAlpha|OneMinusDstColor|OneMinusDstAlpha))?)(?=\s|;|$)|\b(ColorMask)\s+(\[[^\]]+\]|\([^)]*\))(?=\s|;|$)|\b(LOD)\s+(\d+)|(^\s*HLSLPROGRAM\b)|(^\s*HLSLINCLUDE\b)|(^\s*CBUFFER_START\b)|(^\s*(?!.*return\s)[a-zA-Z_]\w*\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*(?:[^{]*\{))|(^\s*\[\w+\])|(^\s*(?!.*return\s)(?:inline\s+)?\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*(?:[^{;]*)?\{)/gm;
    }

    private matchAll(pattern: RegExp, text: string): Array<RegExpMatchArray> {
        const out: RegExpMatchArray[] = [];
        pattern.lastIndex = 0;
        let match: RegExpMatchArray | null;
        while ((match = pattern.exec(text))) {
            //console.log('Full match:', match[0]);
            //console.log('Groups:', match.slice(1).map((g,i) => `${i}:${g}`).filter(g => g));
            out.push(match);
        }
        return out;
    }
}
