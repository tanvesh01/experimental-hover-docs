import { css, keyframes } from '@stitches/react';

import {
  slideDownAndFade,
  slideLeftAndFade,
  slideRightAndFade,
  slideUpAndFade,
} from '../Popover/Popover';

const fade = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

export const popOverStyles = css({
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
    animation: `${fade} 0.2s ease`,
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
