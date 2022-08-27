import { basicSetup } from 'codemirror';
import { BabelReponseInterface } from '../../types';
import { EditorView, hoverTooltip } from '@codemirror/view';
import { syntaxHighlighting } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { useEffect } from 'react';
import { codeString, parseCode } from '../../App';

import {
  oneDark,
  oneDarkHighlightStyle,
  oneDarkTheme,
} from '@codemirror/theme-one-dark';
import { underlineSelection } from './editorUtils';
import { getSentenceContent } from '../../utils';
import { popOverStyles } from './editorStyles';

const syntaxExtension = syntaxHighlighting(oneDarkHighlightStyle);

const NewEditor = () => {
  useEffect(() => {
    let parsedASTData: BabelReponseInterface;

    /*
      Logic that decides if a keyword can be hovered to
      render our popover.

      TODO: Right now the we are parsing data of our AST is obviously 
      very static, gotta make this a generic function.
    */
    const wordHover = hoverTooltip((view, pos, side) => {
      let { from, to, text, number: lineNumber } = view.state.doc.lineAt(pos);

      let start = pos,
        end = pos;

      while (start > from && /\w/.test(text[start - from - 1])) start--;
      while (end < to && /\w/.test(text[end - from])) end++;
      if ((start == pos && side < 0) || (end == pos && side > 0)) return null;
      const keyword = text.slice(start - from, end - from);

      let returnedObject = null;
      parsedASTData.useEffect.forEach(({ startLineNumber }, index) => {
        if (lineNumber === startLineNumber) {
          const content = getSentenceContent(
            parsedASTData.useEffect[index],
            parsedASTData
          );

          returnedObject = {
            pos: start,
            end,
            above: true,

            create() {
              let dom = document.createElement('div');
              dom.style.color = 'black';
              dom.classList.add(popOverStyles());
              dom.innerHTML = content;
              return { dom };
            },
          };
        }
      });
      return returnedObject;
    });

    // Initiate codemirror with default extensions
    const view = new EditorView({
      doc: codeString,
      extensions: [
        basicSetup,
        javascript(),
        wordHover,
        oneDark,
        oneDarkTheme,
        syntaxExtension,
      ],
      parent: document.querySelector('#editor')!,
    });

    parseCode(codeString).then((res) => {
      parsedASTData = res;
      /*
          Takes all the AST data from babel and loops through to it
          underline all the selections
        */
      parsedASTData.useEffect.forEach((data) => {
        underlineSelection(view, data.start, data.end);
      });
    });
    return () => {
      view.destroy();
    };
  }, []);

  return <div id="editor"> </div>;
};

export default NewEditor;
