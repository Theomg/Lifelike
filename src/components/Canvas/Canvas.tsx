import * as React from "react";

import * as css from "./Canvas.css";
import {RenderSettings} from "../../Settings";

export interface CanvasProps {
                              cells: [number, number][],
                              neighborQty: number[],
                              settings: RenderSettings,
                              handleWheel: any,
                             }
interface CanvasState {}

export class Canvas extends React.Component<CanvasProps, CanvasState>{
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
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.startLoop();
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
    const blur = this.props.settings.blur;
    const blurAlpha = (1 - blur) + blur * .1;
    this.ctx.fillStyle = `rgba(0,0,0,${blurAlpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const scale = this.props.settings.scale;
    this.ctx.setTransform(scale, 0, 0, scale, this.canvas.width/2, this.canvas.height/2);
    const cellsLen = this.props.cells.length;
    const [camx, camy] = this.props.settings.pos;
    for(let i = 0;i < cellsLen;i++){
      const [x, y] = this.props.cells[i];
      if(x < camx || x > camx + this.canvas.width ||
         y < camy || y > camy + this.canvas.height){
          continue;
      }
      this.ctx.fillStyle = this.colors[this.props.neighborQty[i]];
      this.ctx.fillRect(x - camx - this.canvas.width/2, y - camy - this.canvas.height/2, 1, 1);
    }
    this.ctx.setTransform(1,0,0,1,0,0);
    this.rafID = requestAnimationFrame((time) => this.draw(time));
  }

  public render(){
    return <canvas ref={c => this.canvas = c} className={css.canvas} onWheel={this.props.handleWheel}></canvas>;
  }
}