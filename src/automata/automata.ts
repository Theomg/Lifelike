declare type numberTuple = [number, number];

import {InitSettings} from ".././Settings";

export default class Automata{
  settings: InitSettings;
  time: number = null;
  waitTime: number;
  cells: numberTuple[];
  cellMap: Map<number, number> = new Map();
  neighborQty: number[];

  constructor(cells: numberTuple[], neighborQty: number[], settings: InitSettings){
    this.cells = cells;
    this.neighborQty = neighborQty;
    this.settings = settings;
    this.init();
  }

  //Works ok for smaller simulations, but a nicer hash function with a HashMap+buckets would be better
  private hash(pair: numberTuple): number{
    return (pair[0] * 2 ** 26) + pair[1];
  }

  private init(): void{
    this.waitTime = 1000 / this.settings.maxFPS;
    const cellLen = this.cells.length;
    if(cellLen > 0){
      for(let i = 0;i < cellLen; i++){
        this.cellMap.set(this.hash(this.cells[i]), i)
      }
    }
    this.seed();
  }

  public seed(): void{
    const windowWidth = document.body.clientWidth;
    const windowHeight = document.body.clientHeight;
    const [width, height] = this.settings.seedArea;
    const seedQty = Math.min(this.settings.seedQty, width * height);

    for(let i = 0;i < seedQty;i++){
      let newCell: numberTuple;
      let newCellHash: number;
      do{
        newCell = [~~(Math.random() * width) - width/2 + windowWidth/2, ~~(Math.random() * height) - height/2 + windowHeight/2];
        newCellHash = this.hash(newCell);
      }while(this.cellMap.has(newCellHash));
      const idx = this.cells.length;
      this.cells.push(newCell);
      this.cellMap.set(newCellHash, idx);
      this.neighborQty[idx] = 0;
    }
  }

  public loop(timestamp: number = 0): void{
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
  
  private update(): void{
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
      const newCellHash = this.hash(newCell);
      if(!this.cellMap.has(newCellHash))
      {
        this.cells.push(newCell);
        this.cellMap.set(newCellHash, this.cells.length - 1);
        this.neighborQty.push(newNeighborQty);
      }
    }

    //removes cells by swapping with last element, avoiding shifting the remaining elements back
    while(removeIdx.length > 0){
      const idx = removeIdx.pop();
      this.cellMap.delete(this.hash(this.cells[idx]));
      if(this.cells.length > 1 && idx !== this.cells.length - 1){
        this.cells[idx] = this.cells.pop();
        this.cellMap.set(this.hash(this.cells[idx]), idx);
        this.neighborQty[idx] = this.neighborQty.pop();
      }
      else{
        this.cells.pop();
        this.neighborQty.pop();
      }
    }
  }
  
  /**
   * @param  {numberTuple} pos - Position of cell
   * @param  {numberTuple[]} cells
   * @param  {numberTuple[]=[]} retNeighbors - Optional array used to return neighbors positions
   * @param  {numberTuple[]=[]} retAvailable - Optional array used to return available positions
   * @returns {number} Number of neighbors around position
   */
  public getNeighbors(pos: numberTuple, cells: numberTuple[], refNeighbors: numberTuple[] = [], refAvailable: numberTuple[] = []): number{
    if(refNeighbors.length > 0){
      refNeighbors = [];
    }
    if(refAvailable.length > 0){
      refAvailable = [];
    }
    const [x, y] = pos;
    const possibleNeighbors: numberTuple[] = [[x-1, y-1], [x, y-1], [x+1, y-1],
                                              [x-1, y  ],           [x+1, y  ],
                                              [x-1, y+1], [x, y+1], [x+1, y+1]];
    for(let i = 0;i < possibleNeighbors.length;i++){
      const cellHash = this.hash(possibleNeighbors[i]);
      const cellIdx = this.cellMap.get(cellHash);
      const cell = cells[cellIdx];
      if(cell === undefined){
        refAvailable.push(possibleNeighbors[i]);
      }
      else{
        refNeighbors.push(possibleNeighbors[i]);
      }
    }
    return refNeighbors.length;
  }
}



