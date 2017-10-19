import * as React from 'react';
import {mount} from 'enzyme';

import {Canvas, CanvasProps} from './Canvas';
import {RenderSettings} from '../../Settings';

//Avoid rng behavior for snapshots
Math.random = jest.fn(() => .5);

describe('Canvas', ()=>{
  const drawSettings: RenderSettings = {
    scale: 1,
    pos: [0,0],
    blur: 1
  }

  it('should render a canvas element', ()=>{
    const props: CanvasProps = {
      cells: [],
      neighborQty: [],
      settings: drawSettings,
      handleWheel: () => {},
      handleClickEnd: () => {},
      handleClickMove: () => {},
      handleClickStart: () => {}
    }
    const canvas = mount(<Canvas {...props}/>);
    expect(canvas.childAt(0).is('canvas')).toBe(true);
  });
});