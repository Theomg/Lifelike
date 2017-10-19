export interface InitSettings {
  bRule: number[],
  sRule: number[],
  seedQty: number,
  seedArea: number[],
  maxFPS: number,
  neighborhood: [number, number][]
}

export interface RenderSettings {
  scale: number,
  pos: [number,number],
  blur: number
}