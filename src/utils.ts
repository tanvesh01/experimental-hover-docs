import React from 'react';
import { micromark } from 'micromark';
import {
  BabelReponseInterface,
  HighlighterStateInterface,
  UseEffectBabelResponse,
} from './types';

export const getHighlighterCoords = (res: BabelReponseInterface) => {
  const lineNumberElements = document.querySelectorAll(
    '.CodeMirror-linenumber'
  );
  const EditorElement = document.querySelector('.editor');
  const finalUseEffectPositionArray: HighlighterStateInterface[] = [];

  res.useEffect.forEach((effect) => {
    const startLineNumberElement =
      lineNumberElements[effect.startLineNumber - 1];

    const endLineNumberElement = lineNumberElements[effect.endLineNumber - 1];

    const startLineNumberPositionObject =
      startLineNumberElement.getBoundingClientRect();
    const EditorElementPositionObject = EditorElement?.getBoundingClientRect();

    console.log(getSentenceContent(effect, res), 'content');
    finalUseEffectPositionArray.push({
      top:
        startLineNumberPositionObject.top -
        (EditorElementPositionObject?.top || 0),
      height:
        (effect.endLineNumber - effect.startLineNumber + 1) *
        startLineNumberPositionObject.height,
      content: getSentenceContent(effect, res) || '',
    });
  });

  return finalUseEffectPositionArray;
};

export const getSentenceContent = (
  useEffectData: UseEffectBabelResponse,
  res: BabelReponseInterface
) => {
  const dependencyTree = res.dependencyTree;
  let finalContent = `
  ## useEffect
  The Effect Hook lets you perform side effects in function components.

  This useEffect depends on `;
  const dependenciesArray = useEffectData.dependencies;
  console.log(dependenciesArray, 'DEPE ARRAY', res);

  // TODO: make this work for more than 3 items in array
  if (dependenciesArray.length < 2) {
    return micromark(`${finalContent} \`${dependenciesArray[0].name}\``);
  } else {
    return micromark(
      `${finalContent} \`${dependenciesArray[0].name}\` and \`${
        dependenciesArray[1].name
      }\`  
      
${
  dependencyTree[dependenciesArray[0].name] > 1
    ? dependencyTree[dependenciesArray[0].name] +
      'useEffects are dependedant on' +
      dependenciesArray[0].name
    : ''
}
${
  dependencyTree[dependenciesArray[1].name] > 1
    ? dependencyTree[dependenciesArray[1].name] +
      ' useEffects are dependedant on `' +
      dependenciesArray[1].name +
      '`'
    : ''
}
      `
    );
  }
};
