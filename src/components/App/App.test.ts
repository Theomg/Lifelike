import {App, NeighborhoodType} from './';

describe('App', ()=>{
  const app = new App();
  describe('generateNeighborhood', ()=>{
    it('should be able to generate a moore neighborhood matrix', ()=>{
      const expected = [
        [-1,-1], [0, -1], [1, -1],
        [-1, 0],          [1,  0],
        [-1, 1], [0,  1], [1,  1]
      ];
      const neighborhood = app.generateNeighborhood(NeighborhoodType.Moore, 1, false);
      expect(neighborhood).toEqual(expect.arrayContaining(expected));
      expect(neighborhood).toHaveLength(expected.length);
    });

    it('should be able to generate a von neumann neighborhood matrix', ()=>{
      const expected = [
                 [0, -1], 
        [-1, 0],          [1,  0],
                 [0,  1], 
      ];
      const neighborhood = app.generateNeighborhood(NeighborhoodType.vonNeumann, 1, false);
      expect(neighborhood).toEqual(expect.arrayContaining(expected));
      expect(neighborhood).toHaveLength(expected.length);
    });
    
    it('should be able to generate a neighborhood matrix including itself', ()=>{
      const expected = [
                 [0, -1], 
        [-1, 0], [0,  0], [1,  0],
                 [0,  1], 
      ];
      const neighborhood = app.generateNeighborhood(NeighborhoodType.vonNeumann, 1, true);
      expect(neighborhood).toEqual(expect.arrayContaining(expected));
      expect(neighborhood).toHaveLength(expected.length);
    });
    
    it('should be able to generate a neighborhood matrix with radius 2', ()=>{
      const expected = [
        [-2,-2], [-1,-2], [0, -2], [1, -2], [2, -2],
        [-2,-1], [-1,-1], [0, -1], [1, -1], [2, -1],
        [-2, 0], [-1, 0],          [1,  0], [2,  0],
        [-2, 1], [-1, 1], [0,  1], [1,  1], [2,  1],
        [-2, 2], [-1, 2], [0,  2], [1,  2], [2,  2],
      ];
      const neighborhood = app.generateNeighborhood(NeighborhoodType.Moore, 2, false);
      expect(neighborhood).toEqual(expect.arrayContaining(expected));
      expect(neighborhood).toHaveLength(expected.length);
    });
  });
});