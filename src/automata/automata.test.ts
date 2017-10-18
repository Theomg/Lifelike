import {Automata} from './automata';
import {InitSettings} from '../Settings';

describe("Automata", ()=>{
  describe("getNeighbors", ()=>{
    const cells: [number, number][] = [[0,0],        [2,0],
                                              [1,1], 
                                       [0,2], [1,2], [2,2]];
    const neighborQty = [1, 0, 1, 0, 5, 0, 2, 3, 2];
    const settings: InitSettings = {
      bRule: [1],
      sRule: [2,3],
      seedQty: 0,
      seedArea: [10, 10],
      maxFPS: 60,
      neighborhood: [[-1, -1], [0, -1], [+1, -1],
                     [-1,  0],          [+1,  0],
                     [-1, +1], [0, +1], [+1, +1]]
    }
    const automata = new Automata(cells, neighborQty, settings);
    
    it("should return the number of current neighbors", () => {
      expect(automata.getNeighbors([1,1], cells)).toBe(5);
    });

    it("should modify the neighbors array", () => {
      const neighbors: [number, number][] = [];
      automata.getNeighbors([1,1], cells, neighbors);
      const expectedNeighbors = [[0,0], [2,0], [0,2], [1,2], [2,2]];

      expect(neighbors).toEqual(expect.arrayContaining(expectedNeighbors));
      expect(neighbors).toHaveLength(expectedNeighbors.length);
    });

    it("should modify the available neighbors array", () => {   
      const availableNeighbors: [number, number][] = [];
      automata.getNeighbors([1,1], cells, [], availableNeighbors);
      const expectedAvailable = [[1,0], [0,1], [2,1]];

      expect(availableNeighbors).toEqual(expect.arrayContaining(expectedAvailable));
      expect(availableNeighbors).toHaveLength(expectedAvailable.length);
    });
  });
});