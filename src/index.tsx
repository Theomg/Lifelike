import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'normalize.css';
import './main.css';

import {Canvas} from './components/Canvas';
import Automata from './automata/automata';
import {InitSettings, RenderSettings} from "./Settings";

const cells: [number,number][] = [];
const neighborQty: number[] = [];
const drawSettings: RenderSettings = {
  scale: 1,
  pos: [0,0],
  blur: 1
}

const settings: InitSettings = {
  bRule: [1],
  sRule: [0,1,2,3,4,5,6,7,8],
  seedQty: 5000,
  seedArea: [10, 10],
  maxFPS: 60
}

const automata = new Automata(cells, neighborQty, settings);
automata.loop();

ReactDOM.render(
  <Canvas cells={cells} neighborQty={neighborQty} settings={drawSettings}/>,
  document.getElementById('main')
);