# Marked Notes
A Markdown note-taking application.

The notes are structured in notebooks, which is mapped to the file structure or stored as json, optionally encrypted.
Each notebook contains an `image` folder to store the images used in the notebook.


## Feature overview
The Markdown syntax is extended with
- katex
- mermaid
- emoji-toolkit
- prismjs

### Latex usage
Use single dollar notation for inline math, e.g. `$\LaTeX$` renders as $\LaTeX$, and double dollar notation for display mode e.g. ``$$\LaTeX$$`` $$\LaTeX$$
More information on latex with katex can be found [here](https://katex.org/docs/supported.html)

### Mermaid usage
Use the code environment with mermaid as language to generate graphs e.g.
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
More information on graphs with mermaid can be found [here](https://mermaid-js.github.io/mermaid/#/)

### Fully featured Latex
To use fully featured latex, the system must have latex installed and [pdf2svg](https://github.com/dawbarton/pdf2svg) binaries must be placed at the installation root inside a folder called `pdf2svg`.

To insert a latex render into a note, activate the latex editor using $\Sigma$ button, insert the latex code, compile it and confirm.
The render will be converted to an `svg` and inserted as image.

### Free hand drawing
By clicking the draw icon on the right, a canvas will be opened for free hand drawings, which can be inserted into the note as `svg`.


## Getting started
You need [nodejs](https://nodejs.org/en/) and a global [angular](https://angular.io/guide/setup-local) installation to build the project.

### Installing
Clone this repository
```
git clone https://github.com/Cryptric/marked-notes
cd path/to/repo
```

Install dependencies
```
npm install
```

Start electron for development
```
npm start
```

Build binaries for your platform
```
npm run electron:build
```


## Build with
* [Angular](https://angular.io/) - Webapp framework
* [Marked](https://github.com/markedjs/marked) - Markdown renderer
* [ngx-markdown](https://github.com/jfcere/ngx-markdown) - Markdown package for angular
* [Prism](https://prismjs.com/) - Syntax highlighter
* [Emoji-Toolkit](https://github.com/joypixels/emoji-toolkit) - Emoji library
* [Katex](https://katex.org/) - Web renderer for latex
* [Mermaid](https://mermaid-js.github.io/mermaid/#/) - Tool to create diagrams with text and code
* [CodeMirror](https://codemirror.net/) - Code Editor
* [Electron](https://www.electronjs.org/) - Framework to create native applications with web technologies
* [angular-electron](https://github.com/maximegris/angular-electron) - Angular Electron boilerplate
