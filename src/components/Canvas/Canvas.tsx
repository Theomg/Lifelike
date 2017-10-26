import * as React from "react";

import * as css from "./Canvas.css";
import {RenderSettings} from "../../Settings";

export interface CanvasProps {
                              width: number,
                              height: number,
                              cells: [number, number][],
                              neighborQty: number[],
                              potentialCells: [number, number][],
                              settings: RenderSettings,
                              handleWheel: any,
                              handleClickStart: any,
                              handleClickEnd: any,
                              handleClickMove: any
                             }

export class Canvas extends React.Component<CanvasProps, {}>{
  private ctx : CanvasRenderingContext2D;
  private canvas : HTMLCanvasElement;
  private rafID : number;
  private colors : string[] = new Array(8);

  constructor(props : CanvasProps){
    super();
    const minAngle = 20;
    const maxAngle = 360/8;
    const initialHue = ~~(Math.random() * 360);
    const angle = ~~(Math.random() * (maxAngle - minAngle)) + minAngle;
    const minLight = 65;
    const maxLight = 87;
    for(let i = 0;i < 9;i++){
      const hue = (initialHue + angle * i) % 360;
      const lightness = ~~(Math.random() * (maxLight - minLight)) + minLight;
      this.colors[i] = `hsl(${hue}, 100%, ${lightness}%)`;
    }
  }

  public componentDidMount(){
    this.canvas.width = this.props.width;
    this.canvas.height = this.props.height;
    this.ctx = this.canvas.getContext('2d');
    if(this.ctx !== null){
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, this.props.width, this.props.height);
      this.startLoop();
    }
  }

  public componentDidUpdate(){
    this.canvas.width = this.props.width;
    this.canvas.height = this.props.height;
  }

  public componentWillUnmount(){
    this.stopLoop();
  }

  private startLoop(){
    this.rafID = requestAnimationFrame((time) => this.draw(time));
  }

  private stopLoop(){
    cancelAnimationFrame(this.rafID);
    this.rafID = null;
  }

  private draw(time: number){
    //Apply blur/clean rect
    const blur = this.props.settings.blur;
    const blurAlpha = (1 - blur) + blur * .1;
    this.ctx.fillStyle = `rgba(0,0,0,${blurAlpha})`;
    this.ctx.fillRect(0, 0, this.props.width, this.props.height);

    //Apply scale matrix
    const scale = this.props.settings.scale;
    this.ctx.setTransform(scale, 0, 0, scale, this.props.width/2, this.props.height/2);

    //Calculate camera bounds from position and scale
    let [camX, camY] = this.props.settings.pos;
    [camX, camY] = [Math.round(camX), Math.round(camY)];
    const minX = (camX + this.props.width/2) - (this.props.width/(2 * scale));
    const minY = (camY + this.props.height/2) - (this.props.height/(2 * scale));
    const maxX = camX + this.props.width/scale;
    const maxY = camY + this.props.height/scale;

    //Draw cells in bounds
    const cellsLen = this.props.cells.length;
    for(let i = 0;i < cellsLen;i++){
      const [x, y] = this.props.cells[i];
      if(scale <= 1 &&
         (x < minX || x > maxX ||
         y < minY || y > maxY)){
          continue;
      }
      this.ctx.fillStyle = this.colors[this.props.neighborQty[i]];
      this.ctx.fillRect(x - camX - this.props.width/2,
                        y - camY - this.props.height/2,
                        1, 1);
    }

    //Draw input hover
    const inputLen = this.props.potentialCells.length;
    for(let i = 0;i < inputLen;i++){
      const [x, y] = this.props.potentialCells[i];
      this.ctx.fillStyle = 'rgb(255,255,255)';
      this.ctx.fillRect(x - camX - this.props.width/2,
                        y - camY - this.props.height/2,
                        1, 1);
    }

    //Reset scale matrix
    this.ctx.setTransform(1,0,0,1,0,0);

    this.rafID = requestAnimationFrame((time) => this.draw(time));
  }

  public render(){
    return <canvas ref={c => this.canvas = c} className={css.canvas} 
                   onWheel={this.props.handleWheel} 
                   onMouseDown={this.props.handleClickStart}
                   onTouchStart={this.props.handleClickStart}
                   onMouseUp={this.props.handleClickEnd}
                   onTouchEnd={this.props.handleClickEnd}
                   onMouseMove={this.props.handleClickMove}
                   onTouchMove={this.props.handleClickMove}
                   ></canvas>;
  }
}