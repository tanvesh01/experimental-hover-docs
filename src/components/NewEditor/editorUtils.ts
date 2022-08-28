import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, hoverTooltip } from '@codemirror/view';
import { EditorView } from 'codemirror';
import { BabelReponseInterface } from '../../types';
import { getSentenceContent } from '../../utils';
import { popOverStyles } from './editorStyles';

/*
    Logic for Underlining the keywords we want to
    highlight that can be hovered
*/
export const underlineTheme = EditorView.baseTheme({
  '.cm-underline': { paddingBottom: 2, borderBottom: '2px dashed #13d21d' },
});
const addUnderline = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to),
  }),
});
export const underlineMark = Decoration.mark({ class: 'cm-underline' });
export const underlineField = StateField.define<DecorationSet>({
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

export function underlineSelection(view: EditorView, from: number, to: number) {
  let effects: StateEffect<unknown>[] = [addUnderline.of({ from, to })];
  if (!effects.length) return false;

  if (!view.state.field(underlineField, false))
    effects.push(StateEffect.appendConfig.of([underlineField, underlineTheme]));
  view.dispatch({ effects });
  return true;
}
