import * as React from "react";

import * as css from "./Canvas.css";
import {RenderSettings} from "../../Settings";

export interface CanvasProps {
                              cells: [number, number][],
                              neighborQty: number[],
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
    this.updateSize = this.updateSize.bind(this);
  }

  private updateSize(){
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public componentDidMount(){
    window.addEventListener("resize", this.updateSize);
    this.updateSize();
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.startLoop();
  }

  public componentWillUnmount(){
    window.removeEventListener("resize", this.updateSize);
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
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    //Apply scale matrix
    const scale = this.props.settings.scale;
    this.ctx.setTransform(scale, 0, 0, scale, this.canvas.width/2, this.canvas.height/2);

    //Calculate camera bounds from position and scale
    const [camX, camY] = this.props.settings.pos;
    const minX = (camX + this.canvas.width/2) - (this.canvas.width/(2 * scale));
    const minY = (camY + this.canvas.height/2) - (this.canvas.height/(2 * scale));
    const maxX = camX + this.canvas.width/scale;
    const maxY = camY + this.canvas.height/scale;

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
      this.ctx.fillRect(x - camX - this.canvas.width/2, y - camY - this.canvas.height/2, 1, 1);
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