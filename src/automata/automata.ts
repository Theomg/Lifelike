declare type numberTuple = [number, number];

import {InitSettings} from ".././Settings";

export class Automata{
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
  private hashTuple(pair: numberTuple): number{
    return (pair[0] * 2 ** 26) + pair[1];
  }

  private init(): void{
    this.waitTime = 1000 / this.settings.maxFPS;
    const cellLen = this.cells.length;
    if(cellLen > 0){
      for(let i = 0;i < cellLen; i++){
        this.cellMap.set(this.hashTuple(this.cells[i]), i)
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
        newCell = [~~(Math.random() * width - width/2 + windowWidth/2),
                   ~~(Math.random() * height - height/2 + windowHeight/2)];
        newCellHash = this.hashTuple(newCell);
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
    requestAnimationFrame(t => this.loop(t));  
  }
  
  private update(): void{
    const removeIdx: number[] = [];
    const addCells: numberTuple[] = [];
    const addNeighborQty: number[] = [];
    const calculatedAvailable: Set<number> = new Set();

    const cellLen = this.cells.length;
    for(let i = 0;i < cellLen;i++){
      const neighbors: numberTuple[] = [];
      const available: numberTuple[] = [];

      //Gets cells to be removed
      this.getNeighbors(this.cells[i], neighbors, available);
      const neighborCount = neighbors.length;
      this.neighborQty[i] = neighborCount;
      if(!this.settings.sRule.includes(neighborCount)){
        removeIdx.push(i);
      }

      //Get empty cells to be added, recalculation is avoided by adding them to a set
      const availableLen = available.length;
      for(let i = 0;i < availableLen;i++){
        const pos = available[i];
        const posHash = this.hashTuple(pos);
        if(calculatedAvailable.has(posHash)){
          continue;
        }
        calculatedAvailable.add(posHash);
        const potentialNeighborCount = this.getNeighbors(pos);
        if(this.settings.bRule.includes(potentialNeighborCount)){
            addCells.push(pos);
            addNeighborQty.push(potentialNeighborCount);
        }
      }
    }

    //Adds new cells
    while(addCells.length > 0){
      const newCell = addCells.pop();
      const newNeighborQty = addNeighborQty.pop();
      const newCellHash = this.hashTuple(newCell);
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
      this.removeCell(this.cells[idx]);
    }
  }

  public toggleCells(cells: numberTuple[]){
    const cellsHashes = cells.map(cell => this.hashTuple(cell));
    //Remove all cells
    if(this.cellMap.has(cellsHashes[0])){
      this.removeCell(cells[0]);
      for(let i = 1;i < cells.length;i++){
        if(this.cellMap.has(cellsHashes[i])){
          this.removeCell(cells[i]);
        }
      }
    }
    //Add all cells
    else{
      for(let i = 0;i < cells.length;i++){
        if(i !== 0 && this.cellMap.has(cellsHashes[i])) continue;

        const idx = this.cells.length;
        this.cells.push(cells[i]);
        this.cellMap.set(cellsHashes[i], idx);
        this.neighborQty[idx] = this.getNeighbors(cells[i]);
      }
    }
  }

  //Removes cell by swapping with last cell, avoiding the array having to push back
  private removeCell(cell: numberTuple){
    const cellHash = this.hashTuple(cell);
    const idx = this.cellMap.get(cellHash);
    this.cellMap.delete(cellHash);
    if(this.cells.length > 1 && idx !== this.cells.length - 1){
      const swapCell = this.cells.pop();
      const swapCellHash = this.hashTuple(swapCell);
      this.cells[idx] = swapCell;
      this.cellMap.set(swapCellHash, idx);
      this.neighborQty[idx] = this.neighborQty.pop();
    }
    else{
      this.cells.pop();
      this.neighborQty.pop();
    }
  }
  
  /**
   * @param  {numberTuple} pos - Position of cell
   * @param  {numberTuple[]=[]} retNeighbors - Optional array used to return neighbors positions
   * @param  {numberTuple[]=[]} retAvailable - Optional array used to return available positions
   * @returns {number} Number of neighbors around position
   */
  public getNeighbors(pos: numberTuple, 
                      refNeighbors: numberTuple[] = [],
                      refAvailable: numberTuple[] = []): number{
    if(refNeighbors.length > 0){
      refNeighbors = [];
    }
    if(refAvailable.length > 0){
      refAvailable = [];
    }
    const [x, y] = pos;
    const possibleNeighbors: numberTuple[] = this.settings.neighborhood;
    for(let i = 0;i < possibleNeighbors.length;i++){
      const neighbor: numberTuple = [x + possibleNeighbors[i][0],
                                     y + possibleNeighbors[i][1]];
      const cellHash = this.hashTuple(neighbor);
      const hasCell = this.cellMap.has(cellHash);
      if(!hasCell){
        refAvailable.push(neighbor);
      }
      else{
        refNeighbors.push(neighbor);
      }
    }
    return refNeighbors.length;
  }
}