declare type numberTuple = [number, number];

import {InitSettings} from "./Settings";

export class Automata{
  time: number = null;
  fps = 20;
  waitTime = 1000 / this.fps;
  cells: numberTuple[];
  cellMap: Map<string, number> = new Map();
  neighborQty: number[];
  settings: InitSettings;
  constructor(cells: numberTuple[], neighborQty: number[], settings: InitSettings){
    this.cells = cells;
    this.neighborQty = neighborQty;
    this.settings = settings;
    this.init();
  }

  init(){
    const windowWidth = document.body.clientWidth;
    const windowHeight = document.body.clientHeight;
    const [width, height] = this.settings.seedArea;
    const seedQty = Math.min(this.settings.seedQty, width * height);
    console.log(seedQty);
    for(let i = 0;i < seedQty;i++){
      let newCell: numberTuple;
      let newCellStr: string;
      do{
        newCell = [~~(Math.random() * width) - width/2 + windowWidth/2, ~~(Math.random() * height) - height/2 + windowHeight/2];
        newCellStr = newCell.toString();
      }while(this.cellMap.has(newCellStr));
      this.cells[i] = newCell;
      this.cellMap.set(newCellStr, i);
      this.neighborQty[i] = 0;
    }
    requestAnimationFrame(t => this.loop(t));
  }
  
  loop(timestamp: number){
    if(this.time === null){
      this.time = timestamp;
    }
    const dt = timestamp - this.time;
    if(dt > this.waitTime){
      this.time = timestamp - (dt % this.waitTime);
      this.update();
    }
    if(this.cells.length > 0) {
      requestAnimationFrame(t => this.loop(t));  
    }
  }
  
  update(){
    const removeIdx: number[] = [];
    const addCells: numberTuple[] = [];
    const addNeighborQty: number[] = [];
    this.cells.forEach((cell, idx)=>{
      const neighbors: numberTuple[] = [];
      const available: numberTuple[] = [];
      this.getNeighbors(cell, this.cells, neighbors, available);
      const neighborCount = neighbors.length;
      this.neighborQty[idx] = neighborCount;
      if(!this.settings.sRule.includes(neighborCount)){
        removeIdx.push(idx);
      }

      available.forEach((pos) => {
        const potentialNeighborCount = this.getNeighbors(pos, this.cells);
        if(this.settings.bRule.includes(potentialNeighborCount)){
            addCells.push(pos);
            addNeighborQty.push(potentialNeighborCount);
        }
      });
    });
    while(addCells.length > 0){
      const newCell = addCells.pop();
      const newNeighborQty = addNeighborQty.pop();
      const newCellStr = newCell.toString();
      if(!this.cellMap.has(newCellStr))
      {
        this.cells.push(newCell);
        this.cellMap.set(newCellStr, this.cells.length - 1);
        this.neighborQty.push(newNeighborQty);
      }
    }
    while(removeIdx.length > 0){
      const idx = removeIdx.pop();
      this.cellMap.delete(this.cells[idx].toString());
      if(this.cells.length > 1 && idx !== this.cells.length - 1){
        this.cells[idx] = this.cells.pop();
        this.cellMap.set(this.cells[idx].toString(), idx);
        this.neighborQty[idx] = this.neighborQty.pop();
      }
      else{
        this.cells.pop();
        this.neighborQty.pop();
      }
    }
  }
  
  getNeighbors(pos: numberTuple, cells: numberTuple[], retNeighbors: numberTuple[] = [], retAvailable: numberTuple[] = []): number{
    const [x, y] = pos;
    const possibleNeighbors: numberTuple[] = [[x-1, y-1], [x, y-1], [x+1, y-1],
                                              [x-1, y  ],           [x+1, y  ],
                                              [x-1, y+1], [x, y+1], [x+1, y+1]];
    for(let i = 0;i < possibleNeighbors.length;i++){
      const cellStr = possibleNeighbors[i].toString();
      const cellIdx = this.cellMap.get(cellStr);
      const cell = cells[cellIdx];
      if(cell === undefined){
        retAvailable.push(possibleNeighbors[i]);
      }
      else{
        retNeighbors.push(possibleNeighbors[i]);
      }
    }
    return retNeighbors.length;
  }
}



