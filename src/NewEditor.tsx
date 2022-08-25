import { basicSetup } from 'codemirror';
import { EditorState, StateEffect, StateField } from '@codemirror/state';
import { BabelReponseInterface } from './types';
import {
  Decoration,
  DecorationSet,
  EditorView,
  hoverTooltip,
  keymap,
  showTooltip,
  Tooltip,
} from '@codemirror/view';
import { syntaxHighlighting } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { useEffect, useRef } from 'react';
import { css } from '@stitches/react';
import { codeString, parseCode } from './App';
import { getSentenceContent } from './utils';
import {
  slideDownAndFade,
  slideLeftAndFade,
  slideRightAndFade,
  slideUpAndFade,
} from './components/Popover/Popover';

import { HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import {
  oneDark,
  oneDarkHighlightStyle,
  oneDarkTheme,
} from '@codemirror/theme-one-dark';

const cursorTooltipBaseTheme = EditorView.baseTheme({
  '.cm-tooltip.cm-tooltip-cursor': {
    backgroundColor: '#66b',
    color: 'white',
    border: 'none',
    padding: '2px 7px',
    borderRadius: '4px',
    '& .cm-tooltip-arrow:before': {
      borderTopColor: '#66b',
    },
    '& .cm-tooltip-arrow:after': {
      borderTopColor: 'transparent',
    },
  },
});

function getCursorTooltips(state: EditorState): readonly Tooltip[] {
  return state.selection.ranges
    .filter((range) => range.empty)
    .map((range) => {
      let line = state.doc.lineAt(range.head);
      let text = line.number + ':' + (range.head - line.from);
      return {
        pos: range.head,
        above: true,
        strictSide: true,
        arrow: true,
        create: () => {
          let dom = document.createElement('div');
          dom.className = 'cm-tooltip-cursor';
          dom.textContent = text;
          return { dom };
        },
      };
    });
}
const cursorTooltipField = StateField.define<readonly Tooltip[]>({
  create: getCursorTooltips,

  update(tooltips, tr) {
    if (!tr.docChanged && !tr.selection) return tooltips;
    return getCursorTooltips(tr.state);
  },

  provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
});

function cursorTooltip() {
  return [cursorTooltipField, cursorTooltipBaseTheme];
}

const container = css({
  // border: 0,
  // borderRadius: 5,
  // padding: '1rem !important',
  // background: ' white',

  color: 'Black',
  borderRadius: 6,
  border: '1px solid #e3e3e3',
  padding: '10px 20px',
  width: 300,
  backgroundColor: 'white',
  zIndex: 4,
  boxShadow:
    'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  '@media (prefers-reduced-motion: no-preference)': {
    animationDuration: '400ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'transform, opacity',
    '&[data-state="open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },

  '& code': {
    border: '1px solid #e3e3e3',
    boxShadow: 'rgb(0 0 0 / 4%) 0px 2px 0px',
    padding: '1px 3px',
    borderRadius: '4px',
    background: '#f5f5f51a',
  },

  '& p': {
    marginTop: 0,
  },
});

const myHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: 'pink' },
  { tag: tags.comment, color: 'green', fontStyle: 'italic' },
]);

const syntaxExtension = syntaxHighlighting(oneDarkHighlightStyle);

const NewEditor = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let parsedASTData: BabelReponseInterface;

    const underlineTheme = EditorView.baseTheme({
      '.cm-underline': { paddingBottom: 2, borderBottom: '2px dashed #13d21d' },
    });
    const addUnderline = StateEffect.define<{ from: number; to: number }>({
      map: ({ from, to }, change) => ({
        from: change.mapPos(from),
        to: change.mapPos(to),
      }),
    });
    const underlineMark = Decoration.mark({ class: 'cm-underline' });
    const underlineField = StateField.define<DecorationSet>({
      create() {
        return Decoration.none;
      },
      update(underlines, tr) {
        underlines = underlines.map(tr.changes);
        for (let e of tr.effects)
          if (e.is(addUnderline)) {
            underlines = underlines.update({
              add: [underlineMark.range(e.value.from, e.value.to)],
            });
          }
        return underlines;
      },
      provide: (f) => EditorView.decorations.from(f),
    });
    function underlineSelection(view: EditorView, from: number, to: number) {
      let effects: StateEffect<unknown>[] = [addUnderline.of({ from, to })];
      if (!effects.length) return false;

      if (!view.state.field(underlineField, false))
        effects.push(
          StateEffect.appendConfig.of([underlineField, underlineTheme])
        );
      view.dispatch({ effects });
      return true;
    }
    const wordHover = hoverTooltip((view, pos, side) => {
      let { from, to, text, number: lineNumber } = view.state.doc.lineAt(pos);
      console.log(text, 'Text', lineNumber);

      let start = pos,
        end = pos;

      while (start > from && /\w/.test(text[start - from - 1])) start--;
      while (end < to && /\w/.test(text[end - from])) end++;
      if ((start == pos && side < 0) || (end == pos && side > 0)) return null;
      const keyword = text.slice(start - from, end - from);

      console.log(parsedASTData);

      const useEffectexistsInParsedAST = false;
      let returnedObject = null;
      parsedASTData.useEffect.forEach(({ startLineNumber }, index) => {
        if (lineNumber === startLineNumber) {
          const content = getSentenceContent(
            parsedASTData.useEffect[index],
            parsedASTData
          );
          console.log(from, to, 'from tooo');

          returnedObject = {
            pos: start,
            end,
            above: true,

            create(view) {
              let dom = document.createElement('div');
              dom.style.color = 'black';
              dom.classList.add(container());
              dom.innerHTML = content;
              return { dom };
            },
          };
        }
      });
      return returnedObject;
    });

    // let startState = EditorState.create({
    //   doc: codeString,
    //   extensions: [
    //     // keymap.of(defaultKeymap),
    //     // wordHover,
    //     // syntaxExtension,
    //     // baseTheme,
    //     // javascript(),
    //     defaultHighlightStyle.fallback,
    //   ],
    // });
    let myTheme = EditorView.theme(
      {
        '&': {
          color: 'black',
          backgroundColor: '#034',
        },
        '.cm-content': {
          caretColor: '#0e9',
        },
        '&.cm-focused .cm-cursor': {
          borderLeftColor: '#0e9',
        },
        '&.cm-focused .cm-selectionBackground, ::selection': {
          backgroundColor: '#074',
        },
        '.cm-gutters': {
          backgroundColor: '#045',
          color: '#ddd',
          border: 'none',
        },
      },
      { dark: true }
    );
    // let view = new EditorView({
    //   extensions: [
    //     basicSetup,
    //     // javascript(),
    //     // defaultHighlightStyle.fallback,
    //     // ...cursorTooltip(),
    //     // wordHover,
    //     // myTheme,
    //     syntaxExtension,
    //     // baseTheme,
    //   ],
    //   state: startState,
    //   parent: ref.current || document.body,
    // });

    // const view = new EditorView({
    //   doc: '...',
    //   extensions: minimalSetup,
    //   parent: ref.current || document.body,
    // });

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

    console.log(view.state.doc.children?.forEach((leaf) => {}));
    parseCode(codeString).then((res) => {
      parsedASTData = res;
      parsedASTData.useEffect.forEach((data) => {
        underlineSelection(view, data.start, data.end);
      });
    });
    // const deco =  new Decoration(
    //     4, 6, null, {

    //     }
    // )
    return () => {
      view.destroy();
      // editor.current.removeEventListener("input", log);
    };
  }, []);

  return (
    <>
      <div ref={ref}> </div>
      <div id="editor"> </div>
      {/* <div className={container()}>World</div> */}
    </>
  );
};

export default NewEditor;
