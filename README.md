# Shader/GLSL/HLSL Outline

Provides outline view for Shader, GLSL and HLSL languages in VSCode Editor:

 ![](./intro.jpg)

Supported file extensions:

- GLSL: .glsl, .vert, .frag, .geom, .tesc, .tese, .comp
- HLSL: .hlsl, .fx, .vsh, .psh, .gsh, .hsl
- Shader: .shader

Code Copy From:

https://github.com/hitode909/vscode-perl-outline

Then I use AI to edit the logic suit for shader & hlsl. I dont know coding so much, but you can make it better if you have some coding ability.

Finally, you can build .vsix file by this command:

```powershell
npm run compile && vsce package
```
