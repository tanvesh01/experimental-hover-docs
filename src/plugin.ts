// @ts-nocheck
import jsx from '@babel/plugin-syntax-jsx';

export default () => {
  return {
    inherits: jsx,
    visitor: {
      Program: {
        enter() {
          this.tree = [];
          this.data = {};
        },
        exit(_, state) {
          // state.opts.onTreeReady(this.tree[0]);
          state.opts.onLineNumbersReady(this.data);
        },
      },
      JSXElement: {
        enter(path) {
          this.tree.push({
            name: path.node.openingElement.name.name,
            start: path.node.start,
            end: path.node.end,
            children: [],
          });
        },
        exit() {
          if (this.tree.length > 1) {
            const child = this.tree.pop();
            const parent = this.tree[this.tree.length - 1];
            parent.children.push(child);
          }
        },
      },
      CallExpression: {
        enter(path) {
          // console.log(path, 'PATHHH');
          if (path.node.callee.name === 'useEffect') {
            console.log('DETECTED USEEFFECT', path);

            const dependencyTree = { ...(this.data.dependencyTree || {}) };
            path.node.arguments[1].elements.forEach(({ name }) => {
              dependencyTree[name] = dependencyTree[name] + 1 || 1;
            });

            // checking if depen array is present
            if (path.node.arguments.length > 1) {
              this.data.dependencyTree = dependencyTree;
              this.data['useEffect'] = [
                ...(this.data['useEffect'] || []),
                {
                  dependencies: [...path.node.arguments[1].elements],
                  startLineNumber: path.node.loc.start.line,
                  endLineNumber: path.node.loc.end.line,
                  start: path.node.callee.start,
                  end: path.node.callee.end,
                },
              ];
            }
          }
        },
      },
    },
  };
};
