import * as React from 'react';

import {Canvas, CanvasProps} from '../Canvas';
import {Sidebar, SidebarProps} from '../Sidebar';
import {Automata} from '../../automata'
import {InitSettings, RenderSettings} from "../../Settings";

export interface AppState{
  renderSettings: RenderSettings,
  initSettings: InitSettings,
  cells: [number, number][],
  neighborQty: number[],
  neighborColors: string[],
  width: number,
  height: number,
  brush: [number, number][],
  potentialCells: [number, number][],
  neighborhoodType: NeighborhoodType,
  neighborhoodSize: number,
  neighborhoodAddSelf: boolean
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

  private automata: Automata;

  private initialNeighborhoodSize = 1;
  private initialNeighborhoodType = NeighborhoodType.Moore;
  private initialNeighborhoodAddSelf = false;

  constructor(){
    super();

    const neighborhood = this.generateNeighborhood(this.initialNeighborhoodType,
                                                   this.initialNeighborhoodSize, 
                                                   this.initialNeighborhoodAddSelf);
    const neighborColors = this.generateNeighborColors(neighborhood.length);

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
        seedArea: [100, 100],
        maxFPS: 20,
        neighborhood: neighborhood,
        isPaused: false
      },
      cells: [],
      neighborQty: [],
      neighborColors: neighborColors,
      width: 0,
      height: 0,
      brush: [[0,0]],
      potentialCells: [],
      neighborhoodType: this.initialNeighborhoodType,
      neighborhoodSize: this.initialNeighborhoodSize,
      neighborhoodAddSelf: this.initialNeighborhoodAddSelf
    };

    this.handleWheel = this.handleWheel.bind(this);
    this.handleClickStart = this.handleClickStart.bind(this);
    this.handleClickEnd = this.handleClickEnd.bind(this);
    this.handleClickMove = this.handleClickMove.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.reset = this.reset.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.recenterPosition = this.recenterPosition.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.zoomReset = this.zoomReset.bind(this);

  }

  public generateNeighborhood(type: NeighborhoodType,
                              radius: number = 1,
                              addSelf: boolean = false): [number, number][]{
    const neighborhood: [number, number][] = [];
    if(radius < 1){
      radius = 1;
    }
    if(type === NeighborhoodType.vonNeumann){
      //Bitwise nots remove negative zero
      for(let x = ~~(-radius);x <= radius;x++ + 0){
        const xRadius = radius - Math.abs(x);
        for(let y = ~~(-xRadius);y <= xRadius;y++ + 0){
          if(!addSelf && x === 0 && y === 0) continue;
          
          neighborhood.push([x, y]);
        }
      }
    }
    else if(type === NeighborhoodType.Moore){
      for(let x = -radius;x <= radius;x++){
        for(let y = -radius;y <= radius;y++){
          if(!addSelf && x === 0 && y === 0) continue;

          neighborhood.push([x, y]);
        }
      }
    }
    return neighborhood;
  }

  public generateNeighborColors(neighborQty: number): string[] {
    const colors: string[] = [];

    const minAngle = ~~Math.max(0, 360/neighborQty - 25);
    const maxAngle = ~~(360/neighborQty);
    const initialHue = ~~(Math.random() * 360);
    const angle = ~~(Math.random() * (maxAngle - minAngle)) + minAngle;
    const minLight = 65;
    const maxLight = 87;

    for(let i = 0;i <= neighborQty;i++){
      const hue = (initialHue + angle * i) % 360;
      const lightness = ~~(Math.random() * (maxLight - minLight)) + minLight;
      colors[i] = `hsl(${hue}, 100%, ${lightness}%)`;
    }

    return colors;
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
      const brush = this.state.brush.map(pos => {
        return [pos[0] + cell[0],
                pos[1] + cell[1]] as [number, number];
      });
      this.automata.toggleCells(brush);
    }
    this.inputState = InputState.Idle;
    this.clickPos.forEach(pos => {
      pos = [null, null];
    });
  }

  //TODO: Pinch zoom
  private handleClickMove(e: MouseEvent|TouchEvent){
    const clicks = this.clickToPositions(e);
    const cell: [number, number] = this.positionToCell(clicks[0]);
    const brush = this.state.brush.map(pos => {
      return [pos[0] + cell[0],
              pos[1] + cell[1]] as [number, number];
    });
    this.setState({
      potentialCells: brush
    });
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
      this.setState({
        renderSettings
      });
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

  private handleInputValueBounds(input : HTMLInputElement){
    if(input.type !== 'number' && input.type !== 'range'){
      return input;
    }
    const min = (input.min === '') ? -Infinity : +input.min;
    const max = (input.max === '') ? +Infinity : +input.max;
    const value = (input.value === '') ? 0 : +input.value;
    input.value = Math.max(min, Math.min(value, max)).toString();
    return input;
  }

  private handleInputChange(e: Event): void{
    const target = e.target as HTMLInputElement;
    const input = this.handleInputValueBounds(target);
    let shouldGenNeighborhoodColors = false;
    switch(input.name){
      case 'bRule':
      case 'sRule':{
        const rule = input.name;
        const initSettings = this.state.initSettings;
        const value = +input.value;
        const isChecked = input.checked;
        if(initSettings[rule].includes(value) && !isChecked){
          const idx = initSettings[rule].indexOf(value);
          initSettings[rule].splice(idx, 1);
        }
        else if(!initSettings[rule].includes(value) && isChecked){
          initSettings[rule].push(value);
        }
        this.setState({
          initSettings
        })
        break;
      }
      case 'seedQty':
      case 'maxFPS':{
        const name = input.name;
        const initSettings = this.state.initSettings;
        initSettings[name] = +input.value;
        this.setState({
          initSettings
        });
        break;
      }
      case 'seedAreaX':
      case 'seedAreaY':{
        const idx = (input.name[input.name.length - 1] === 'X') ? 0 : 1;
        const initSettings = this.state.initSettings;
        initSettings.seedArea[idx] = +input.value;
        this.setState({
          initSettings
        });
        break;
      }
      case 'blur':{
        const renderSettings = this.state.renderSettings;
        renderSettings.blur = +input.value;
        this.setState({
          renderSettings
        });
        break;
      }
      case 'neighborhoodSize':
      case 'neighborhoodAddSelf':{
        const name = input.name;
        const value = (input.type === 'number') ? +input.value : input.checked;
        const neighborhoodSize = (input.type === 'number') ? value as number : this.state.neighborhoodSize;
        const neighborhoodAddSelf = (input.type !== 'number') ? value as boolean : this.state.neighborhoodAddSelf;
        const initSettings = this.state.initSettings;
        initSettings.neighborhood = this.generateNeighborhood(this.state.neighborhoodType,
                                                              neighborhoodSize,
                                                              neighborhoodAddSelf);
        const neighborhoodLen = initSettings.neighborhood.length;
        initSettings.bRule = initSettings.bRule.filter(r => r <= neighborhoodLen);
        initSettings.sRule = initSettings.sRule.filter(r => r <= neighborhoodLen);
        this.setState({
          [name as any]: value,
          initSettings
        });
        shouldGenNeighborhoodColors = true;
        break;
      }
      case 'neighborhoodType':{
        const neighborhoodType = (NeighborhoodType as any)[input.value];
        shouldGenNeighborhoodColors = true;
        const initSettings = this.state.initSettings;
        initSettings.neighborhood = this.generateNeighborhood(neighborhoodType,
                                                              this.state.neighborhoodSize,
                                                              this.state.neighborhoodAddSelf);
        const neighborhoodLen = initSettings.neighborhood.length;
        initSettings.bRule = initSettings.bRule.filter(r => r <= neighborhoodLen);
        initSettings.sRule = initSettings.sRule.filter(r => r <= neighborhoodLen);
        this.setState({
          neighborhoodType,
          initSettings
        });
        break;
      }
    }
    if(shouldGenNeighborhoodColors){
      const neighborColors = this.generateNeighborColors(this.state.initSettings.neighborhood.length);
      this.setState({
        neighborColors
      });
    }
  }

  private reset(): void{
    const neighborColors = this.generateNeighborColors(this.state.initSettings.neighborhood.length);
    this.setState({
      neighborColors,
    });

    this.automata.stop();
    this.automata = new Automata(this.state.cells, this.state.neighborQty, this.state.initSettings);
    this.automata.loop();
  }

  private togglePlay(): void{
    const initSettings = this.state.initSettings;
    initSettings.isPaused = !initSettings.isPaused;
    this.setState({
      initSettings
    });
  }

  private recenterPosition(): void{
    const renderSettings = this.state.renderSettings;
    renderSettings.pos = [0, 0];
    this.setState({
      renderSettings
    });
  }

  private zoomIn(): void{
    const renderSettings = this.state.renderSettings;
    renderSettings.scale *= 2;
    this.setState({
      renderSettings
    });
  }

  private zoomOut(): void{
    const renderSettings = this.state.renderSettings;
    renderSettings.scale *= 0.5;
    this.setState({
      renderSettings
    });
  }

  private zoomReset(): void{
    const renderSettings = this.state.renderSettings;
    renderSettings.scale = 1;
    this.setState({
      renderSettings
    });
  }

  public render(){
    const canvasProps: CanvasProps = {
      width: this.state.width,
      height: this.state.height,
      cells: this.state.cells, 
      neighborQty: this.state.neighborQty, 
      neighborColors: this.state.neighborColors,
      potentialCells: this.state.potentialCells,
      settings: this.state.renderSettings, 
      handleWheel: this.handleWheel,
      handleClickStart: this.handleClickStart,
      handleClickEnd: this.handleClickEnd,
      handleClickMove: this.handleClickMove,
    };

    const sidebarProps: SidebarProps = {
      maxFPS: this.state.initSettings.maxFPS,
      blur: this.state.renderSettings.blur,
      sRule: this.state.initSettings.sRule,
      bRule: this.state.initSettings.bRule,
      seedQty: this.state.initSettings.seedQty,
      seedArea: this.state.initSettings.seedArea,
      brush: this.state.brush,
      neighborhoodQty: this.state.initSettings.neighborhood.length,
      neighborhoodSize: this.state.neighborhoodSize,
      neighborhoodType: this.state.neighborhoodType,
      neighborhoodAddSelf: this.state.neighborhoodAddSelf,
      isPaused: this.state.initSettings.isPaused,
      handleInputChange: this.handleInputChange,
      reset: this.reset,
      togglePlay: this.togglePlay,
      recenter: this.recenterPosition,
      zoomIn: this.zoomIn,
      zoomOut: this.zoomOut,
      zoomReset: this.zoomReset
    };

    return(
      <div>
        <Sidebar {...sidebarProps}/>
        <Canvas {...canvasProps}/>
      </div>
    );
  }
}