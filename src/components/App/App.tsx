import * as React from 'react';

import {Canvas, CanvasProps} from '../Canvas';
import {Automata} from '../../automata'
import {InitSettings, RenderSettings} from "../../Settings";

export interface AppState{
  renderSettings: RenderSettings,
  initSettings: InitSettings,
  cells: [number, number][],
  neighborQty: number[],
  width: number,
  height: number
}

export enum NeighborhoodType {
  vonNeumann,
  Moore
}

enum InputState{
  Idle,
  ClickStart,
  Moving,
  Pinching
}

export class App extends React.Component<{}, AppState>{
  private inputState = InputState.Idle;
  private moveDistForPan = 7;

  private clickPos: [number, number][] = [[null, null], [null, null]];
  private posOnClick: [number, number]; 
  private potentialCells: [number, number][] = [];

  private automata: Automata;

  constructor(){
    super();

    this.state = {
      renderSettings: {
        scale: 1,
        pos: [0,0],
        blur: .7
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
      neighborQty: [],
      width: 0,
      height: 0
    }

    this.handleWheel = this.handleWheel.bind(this);
    this.handleClickStart = this.handleClickStart.bind(this);
    this.handleClickEnd = this.handleClickEnd.bind(this);
    this.handleClickMove = this.handleClickMove.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
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
    this.inputState = InputState.ClickStart;
    this.clickPos = this.clickToPositions(e);
    this.posOnClick = this.state.renderSettings.pos;
  }

  private handleClickEnd(e: MouseEvent|TouchEvent){
    if(this.inputState === InputState.ClickStart){
      const clicks = this.clickToPositions(e);
      const cell = this.positionToCell(clicks[0]);
      this.automata.toggleCells([cell]);
    }
    this.inputState = InputState.Idle;
    this.clickPos.forEach(pos => {
      pos = [null, null];
    });
  }

  //TODO: Pinch zoom
  private handleClickMove(e: MouseEvent|TouchEvent){
    const clicks = this.clickToPositions(e);
    this.potentialCells[0] = this.positionToCell(clicks[0]);

    //Differentiate click from drag
    if(this.inputState === InputState.ClickStart){
      const diff = [this.clickPos[0][0] - clicks[0][0],
                    this.clickPos[0][1] - clicks[0][1]];
      if(Math.abs(diff[0]) > this.moveDistForPan || Math.abs(diff[1]) > this.moveDistForPan){
        this.inputState = InputState.Moving;
      }
    }
    //Do panning
    if(this.inputState === InputState.Moving){
      const diff = [this.clickPos[0][0] - clicks[0][0],
                    this.clickPos[0][1] - clicks[0][1]];
      const renderSettings = this.state.renderSettings;
      const scale = renderSettings.scale;
      renderSettings.pos = [this.posOnClick[0] + diff[0] / scale,
                            this.posOnClick[1] + diff[1] / scale];
    }
  }

  //Translates either mouse click or touches to position array
  private clickToPositions(e: MouseEvent|TouchEvent): [number, number][]{
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

  private positionToCell(pos: [number, number]): [number, number]{
    const scale = this.state.renderSettings.scale;
    const camera = this.state.renderSettings.pos;
    const halfSize = [this.state.width/2,
                      this.state.height/2];
    const centerDist = [pos[0] - halfSize[0],
                        pos[1] - halfSize[1]];
    return [~~(camera[0] + halfSize[0] + centerDist[0]/scale),
            ~~(camera[1] + halfSize[1] + centerDist[1]/scale)];
  }

  public componentDidMount(){
    window.addEventListener("resize", this.updateDimensions);
    this.updateDimensions();
    this.automata = new Automata(this.state.cells, this.state.neighborQty, this.state.initSettings);
    this.automata.loop();
  }

  public componentWillUnmount(){
    window.removeEventListener("resize", this.updateDimensions);
  }

  private updateDimensions(){
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.setState({
      width,
      height
    });
  }

  public render(){
    return <Canvas 
              width={this.state.width}
              height={this.state.height}
              cells={this.state.cells} 
              neighborQty={this.state.neighborQty} 
              potentialCells={this.potentialCells}
              settings={this.state.renderSettings} 
              handleWheel={this.handleWheel}
              handleClickStart={this.handleClickStart}
              handleClickEnd={this.handleClickEnd}
              handleClickMove={this.handleClickMove}
            />;
  }
}