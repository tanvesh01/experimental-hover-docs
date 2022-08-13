export type UseEffectBabelResponse = {
  startLineNumber: number;
  endLineNumber: number;
  dependencies: { name: string }[];
};

export interface BabelReponseInterface {
  useEffect: UseEffectBabelResponse[];
  dependencyTree: { [key: string]: number };
}

export type HighlighterStateInterface = {
  top: number | string;
  height: number | string;
  content: string;
};
