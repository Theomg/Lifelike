import * as React from 'react';
import {mount} from 'enzyme';

import {Canvas} from './Canvas';
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
    const canvas = mount(<Canvas cells={[]} neighborQty={[]} settings={drawSettings} handleWheel={()=>{}}/>);
    expect(canvas.childAt(0).is('canvas')).toBe(true);
  });

  it('should render correctly', ()=>{
    const canvas = mount(<Canvas cells={[]} neighborQty={[]} settings={drawSettings} handleWheel={()=>{}}/>);
    expect(canvas).toMatchSnapshot();
  });
});