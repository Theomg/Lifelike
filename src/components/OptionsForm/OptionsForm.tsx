import * as React from 'react';
import {NeighborhoodType} from '../App';

import * as css from './OptionsForm.css';

export interface OptionsFormProps{
  maxFPS: number,
  blur: number,
  seedQty: number,
  seedArea: [number, number],
  brush: [number, number][],
  bRule: number[],
  sRule: number[],
  neighborhoodQty: number,
  neighborhoodType: NeighborhoodType,
  neighborhoodSize: number,
  neighborhoodAddSelf: boolean,
  handleInputChange: any
}

export class OptionsForm extends React.Component<OptionsFormProps, {}>{
  constructor(){
    super();
  }

  private makeCheckboxes = (name: string, baseValues: number[], checkedValues: number[]) => baseValues.map(value => {
    const isChecked = checkedValues.includes(value);
    return ([
      <input checked={isChecked}
             name={name}
             id={`${name}-${value}`}
             type="checkbox" 
             value={value} 
             key={`input-${value}`}
             onChange={this.props.handleInputChange}
      />,
      <label htmlFor={`${name}-${value}`}
             className={css.labelRule}
             key={`label-${value}`}>
      {value}
      </label>
    ]);
  });

  public render(){
    const maxRuleNumbers = Array.from(new Array(this.props.neighborhoodQty), (v, i)=>i+1);
    const bRuleCheckboxes = this.makeCheckboxes('bRule', maxRuleNumbers, this.props.bRule);
    const sRuleCheckboxes = this.makeCheckboxes('sRule', maxRuleNumbers, this.props.sRule);

    const neighborhoodTypeRadios = (Object as any).values(NeighborhoodType)
                                                  .filter((v: any) => isNaN(+v))
                                                  .map((v: string) => {
      const isChecked = (this.props.neighborhoodType === +NeighborhoodType[v as any]);
      return([
        <input type="radio"
               checked={isChecked}
               name="neighborhoodType"
               id={`neighborhoodType-${v}`}
               value={v}
               key={`input-${v}`}
               onChange={this.props.handleInputChange}
        />,
        <label htmlFor={`neighborhoodType-${v}`} className={css.blockInput} key={`label-${v}`}>{v.replace(/([a-z])([A-Z])/g, '$1 $2')}</label>
      ]);
    });

    return(
      <form>
        <label className={css.titleLabel}>Generations per second
          <input type="number"
                 name="maxFPS"
                 onChange={this.props.handleInputChange}
                 value={this.props.maxFPS}
                 step="5"
                 min="0"
                 className={`${css.blockInput} ${css.inputFPS}`}
          />
        </label>
        <label className={css.titleLabel}>Blur
          <input type="range"
                 name="blur"
                 onChange={this.props.handleInputChange}
                 value={this.props.blur}
                 step="0.1"
                 min="0"
                 max="1"
                 className={`${css.blockInput} ${css.inputBlur}`}
          />
        </label>
        <label className={css.titleLabel}>Initial cells quantity
          <input type="number"
                 name="seedQty"
                 onChange={this.props.handleInputChange}
                 value={this.props.seedQty}
                 step="100"
                 min="0"
                 className={`${css.blockInput} ${css.inputCellQty}`}
          />
        </label>
        <label className={css.titleLabel}>Initial cells area</label>
        <input type="number"
               aria-label="Initial cells width"
               name="seedAreaX"
               onChange={this.props.handleInputChange}
               value={this.props.seedArea[0]}
               step="50"
               min="0"
               className={css.inputArea}
        />
        by
        <input type="number"
               aria-label="Initial cells height"
               name="seedAreaY"
               onChange={this.props.handleInputChange}
               value={this.props.seedArea[1]}
               step="50"
               min="0"
               className={css.inputArea}
        />
        <label className={css.titleLabel}>Birth condition</label>
        {bRuleCheckboxes}
        <label className={css.titleLabel}>Survival condition</label>
        {sRuleCheckboxes}
        <label className={css.titleLabel}>Neighborhood Type</label>
        {neighborhoodTypeRadios}
        <label className={css.titleLabel}>
          Neighborhood Radius
          <input type="number"
                 name="neighborhoodSize"
                 onChange={this.props.handleInputChange}
                 value={this.props.neighborhoodSize}
                 min="1"
                 className={`${css.inputRadius} ${css.blockInput}`}
          />
        </label>
        <input type="checkbox"
               name="neighborhoodAddSelf"
               id="neighborhoodAddSelf"
               onChange={this.props.handleInputChange}
               checked={this.props.neighborhoodAddSelf}
               className={`${css.blockInput}`}
        />
        <label htmlFor="neighborhoodAddSelf" className={css.titleLabel}>Add self to neighborhood</label>
      </form>
    );
  }
}