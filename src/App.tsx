import React, { useEffect, useState } from 'react';
import { transform } from '@babel/standalone';

import './App.css';
import plugin from './plugin';

import Prism from 'prismjs';

import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import { BabelReponseInterface, HighlighterStateInterface } from './types';
import NewEditor from './components/NewEditor/NewEditor';

export const codeString = `function App() {
  const [state, setState] =  useState(null)
  const [anotherState, setAnotherState] = useState(false)

  useEffect(() => {
    parseCode(codeString).then((res) => console.log(res));
  }, [anotherState, state]);
  
  const someRandomOnChangeHandler = () => {
    console.log("changed")
  }

  useEffect(() => {
    parseCode(codeString).then((res) => console.log(res));
  }, [state]);

   return (
     <figure className="bg-gray-100 rounded-xl p-8">
       <img
         className="w-32 h-32 rounded-full mx-auto"
         src="/sarah-dayan.jpg"
         alt=""
         width="384"
         height="512"
       />
       <div className="pt-6 text-center space-y-4">
         <blockquote>
           <p className="text-lg font-semibold">
             “Tailwind CSS is the only framework that I've seen scale on large
             teams. It’s easy to customize, adapts to any design, and the build
             size is tiny.”
           </p>
         </blockquote>
         <figcaption className="font-medium">
           <div className="text-cyan-600">Sarah Dayan</div>
           <div className="text-gray-500">Staff Engineer, Algolia</div>
         </figcaption>
       </div>
       <h1>sd </h1>
     </figure>
   )
 }
 
`;

export function parseCode(codeString: string) {
  return new Promise<BabelReponseInterface>((resolve) =>
    transform(codeString, {
      plugins: [
        [plugin, { onTreeReady: resolve, onLineNumbersReady: resolve }],
      ],
    })
  );
}

function App() {
  const [elementCoords, setElementCoords] = useState<
    HighlighterStateInterface[]
  >([
    {
      top: 0,
      height: 0,
      content: '',
    },
  ]);
  useEffect(() => {
    // parseCode(codeString).then((res) => {
    //   console.log(res, 'RES');
    //   setElementCoords(getHighlighterCoords(res));
    // });
  }, []);

  useEffect(() => {
    Prism.highlightAll();
  }, []);
  console.log(elementCoords);

  return (
    <div className="App">
      <div>
        {/* {elementCoords.map((data) => (
          <HoverCardDemo content={data.content}>
            <div
              className="code_highlight"
              style={{
                ...data,
              }}
            ></div>
          </HoverCardDemo>
        ))}

        <Editor value={codeString} highlight={true} /> */}
        <NewEditor />
      </div>
    </div>
  );
}

export default App;
