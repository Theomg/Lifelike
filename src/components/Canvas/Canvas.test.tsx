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

  it('should render a canvas element with passed dimensions', ()=>{
    const props: CanvasProps = {
      height: 1920,
      width: 1080,
      cells: [],
      neighborQty: [],
      potentialCells: [],
      settings: drawSettings,
      handleWheel: () => {},
      handleClickEnd: () => {},
      handleClickMove: () => {},
      handleClickStart: () => {}
    }
    const canvas = mount(<Canvas {...props}/>);
    expect(canvas.getDOMNode().tagName.toLowerCase()).toBe('canvas');
    expect(canvas.getDOMNode().getAttribute('width')).toBe(props.width.toString());
    expect(canvas.getDOMNode().getAttribute('height')).toBe(props.height.toString());
  });
});