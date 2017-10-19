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

enum InputState{
  Idle,
  Moving,
  Pinching
}

export class App extends React.Component<{}, AppState>{
  private inputState = InputState.Idle;
  private clickPos: [number, number][] = [[null, null], [null, null]];
  private posOnClick: [number, number];

  constructor(){
    super();

    this.state = {
      renderSettings: {
        scale: 1,
        pos: [0,0],
        blur: 1
      },
      initSettings: {
        bRule: [3,5,7],
        sRule: [1,3,5,8],
        seedQty: 100,
        seedArea: [200, 300],
        maxFPS: 60,
        neighborhood: this.generateNeighborhood(NeighborhoodType.Moore, 1, false)
      },
      cells: [],
      neighborQty: []
    }

    this.handleWheel = this.handleWheel.bind(this);
    this.handleClickStart = this.handleClickStart.bind(this);
    this.handleClickEnd = this.handleClickEnd.bind(this);
    this.handleClickMove = this.handleClickMove.bind(this);
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

  private handleClickStart(e: MouseEvent|TouchEvent){
    this.inputState = InputState.Moving;
    this.clickPos = this.clickToPositions(e);
    this.posOnClick = this.state.renderSettings.pos;
  }

  private handleClickEnd(e: MouseEvent|TouchEvent){
    this.inputState = InputState.Idle;
    this.clickPos.forEach(pos => {
      pos = [null, null];
    });
  }

  //TODO: Pinch zoom
  private handleClickMove(e: MouseEvent|TouchEvent){
    if(this.inputState === InputState.Moving){
      const clicks = this.clickToPositions(e);
      if(this.clickPos[0][0] !== null){
        const diff = [this.clickPos[0][0] - clicks[0][0],
                      this.clickPos[0][1] - clicks[0][1]];
        const renderSettings = this.state.renderSettings;
        renderSettings.pos = [this.posOnClick[0] + diff[0],
                              this.posOnClick[1] + diff[1]];
      }
    }
  }

  public clickToPositions(e: MouseEvent|TouchEvent): [number, number][]{
    let clicks: MouseEvent[] | TouchList = [];
    if((e as TouchEvent).touches === undefined){
      clicks[0] = (e as MouseEvent);
    }
    else{
      clicks = (e as TouchEvent).touches;
    }

    const clickArray = Array.from(clicks as any);
    const posArray = clickArray.map((click: any) => [click.pageX, click.pageY]);
    return posArray as [number, number][];
  }

  public componentDidMount(){
    const automata = new Automata(this.state.cells, this.state.neighborQty, this.state.initSettings);
    automata.loop();
  }

  public render(){
    return <Canvas 
              cells={this.state.cells} 
              neighborQty={this.state.neighborQty} 
              settings={this.state.renderSettings} 
              handleWheel={this.handleWheel}
              handleClickStart={this.handleClickStart}
              handleClickEnd={this.handleClickEnd}
              handleClickMove={this.handleClickMove}
            />;
  }
}