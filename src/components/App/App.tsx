import * as React from 'react';

import {Canvas, CanvasProps} from '../Canvas';
import {Automata} from '../../automata'
import {InitSettings, RenderSettings} from "../../Settings";

export interface AppState{
  renderSettings: RenderSettings,
  initSettings: InitSettings,
  cells: [number, number][],
  neighborQty: number[]
}

export enum NeighborhoodType {
  vonNeumann,
  Moore
}

export class App extends React.Component<{}, AppState>{
  constructor(){
    super();

    this.state = {
      renderSettings: {
        scale: 1,
        pos: [0,0],
        blur: 1
      },
      initSettings: {
        bRule: [3],
        sRule: [2,3],
        seedQty: 10000,
        seedArea: [200, 300],
        maxFPS: 60,
        neighborhood: this.generateNeighborhood(NeighborhoodType.Moore, 1, false)
      },
      cells: [],
      neighborQty: []
    }

    this.handleWheel = this.handleWheel.bind(this);
  }

  public generateNeighborhood(type: NeighborhoodType,
                              radius: number = 1,
                              addSelf: boolean = false): [number, number][]{
    const neighborhood: [number, number][] = [];
    if(radius < 1){
      radius = 1;
    }
    if(type === NeighborhoodType.vonNeumann){
      for(let x = -radius;x <= radius;x++){
        const xRadius = radius - Math.abs(x);
        for(let y = -xRadius;y <= xRadius;y++){
          if(!addSelf && x === 0 && y === 0){
            continue;
          }
          if(x === 0){
            x = Math.abs(x);
          }
          if(y === 0){
            y = Math.abs(y);
          }
          neighborhood.push([x, y]);
        }
      }
    }
    else if(type === NeighborhoodType.Moore){
      for(let x = -radius;x <= radius;x++){
        for(let y = -radius;y <= radius;y++){
          if(!addSelf && x === 0 && y === 0){
            continue;
          }
          neighborhood.push([x, y]);
        }
      }
    }
    return neighborhood;
  }

  private handleWheel(e: WheelEvent): void{
    const renderSettings = this.state.renderSettings;
    let multiplier = (e.deltaY < 0) ? 2 : .5;
    renderSettings.scale *= multiplier;
    this.setState({
      renderSettings
    });
  }

  public componentDidMount(){
    const automata = new Automata(this.state.cells, this.state.neighborQty, this.state.initSettings);
    automata.loop();
  }

  public render(){
    return <Canvas cells={this.state.cells} neighborQty={this.state.neighborQty} settings={this.state.renderSettings} handleWheel={this.handleWheel}/>;
  }
}