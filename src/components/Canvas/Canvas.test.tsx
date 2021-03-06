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
      neighborColors: [],
      potentialCells: [],
      settings: drawSettings,
      handleWheel: () => {},
      handleClickEnd: () => {},
      handleClickMove: () => {},
      handleClickStart: () => {}
    }
    const canvas = mount(<Canvas {...props}/>);
    const canvasNode = canvas.getDOMNode();
    expect(canvasNode.tagName.toLowerCase()).toBe('canvas');
    expect(canvasNode.getAttribute('width')).toBe(props.width.toString());
    expect(canvasNode.getAttribute('height')).toBe(props.height.toString());
  });
});