import * as React from 'react';

import * as css from './Sidebar.css';
import {Header} from '../Header';
import {NeighborhoodType} from '../App';
import {OptionsForm, OptionsFormProps} from "../OptionsForm";

const centerIcon = require('../../assets/icons/crosshair.svg');
const zoomInIcon = require('../../assets/icons/zoom-in.svg');
const zoomOutIcon = require('../../assets/icons/zoom-out.svg');
const zoomResetIcon = require('../../assets/icons/maximize.svg');
const playIcon = require('../../assets/icons/play.svg');
const pauseIcon = require('../../assets/icons/pause.svg');
const resetIcon = require('../../assets/icons/refresh-cw.svg');

interface SidebarState{
  isOpen: Boolean
}

export interface SidebarProps{
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
  isPaused: boolean,
  handleInputChange: any,
  togglePlay: any,
  reset: any,
  zoomIn: any,
  zoomOut: any,
  zoomReset: any,
  recenter: any
}

export class Sidebar extends React.Component<SidebarProps, SidebarState>{
  constructor(){
    super();

    this.state = {
      isOpen: (window.innerWidth > 500)
    };

    this.toggleOpen = this.toggleOpen.bind(this);
  }

  private toggleOpen(){
    const isOpen = !this.state.isOpen;
    this.setState({
      isOpen
    });
  }

  public render(){
    const sidebarClass = `${css.sidebar} ${this.state.isOpen ? css.sidebarOpen : ''}`;
    const hamburgerClass = `${css.hamburger} ${this.state.isOpen ? css.hamburgerOpen : ''}`;

    const playPauseImg = {
      src: this.props.isPaused ? playIcon : pauseIcon,
      alt: this.props.isPaused ? 'Play' : 'Pause'
    };

    const optionsFormProps: OptionsFormProps = {
      maxFPS: this.props.maxFPS,
      blur: this.props.blur,
      seedQty: this.props.seedQty,
      seedArea: this.props.seedArea,
      brush: this.props.brush,
      bRule: this.props.bRule,
      sRule: this.props.sRule,
      neighborhoodQty: this.props.neighborhoodQty,
      neighborhoodType: this.props.neighborhoodType,
      neighborhoodSize: this.props.neighborhoodSize,
      neighborhoodAddSelf: this.props.neighborhoodAddSelf,
      handleInputChange: this.props.handleInputChange,      
    }

    return(
      <aside className={sidebarClass}>
        <section className={css.sidebarContent}>
          <Header />
          <OptionsForm {...optionsFormProps}/>
        </section>
        <aside className={css.sidebarMenu}>
          <div onClick={this.toggleOpen} className={css.toggleSidebar}>
            <div className={hamburgerClass}>
              <div className={css.hamburgerLine}/>
              <div className={css.hamburgerLine}/>
              <div className={css.hamburgerLine}/>
            </div>
          </div>
          <div>
            <button className={css.actionButton} onClick={this.props.togglePlay}><img {...playPauseImg}/></button>
            <button className={css.actionButton} onClick={this.props.zoomIn}><img src={zoomInIcon} alt="Zoom in"/></button>
            <button className={css.actionButton} onClick={this.props.zoomOut}><img src={zoomOutIcon} alt="Zoom out"/></button>
            <button className={css.actionButton} onClick={this.props.zoomReset}><img src={zoomResetIcon} alt="Reset zoom"/></button>
            <button className={css.actionButton} onClick={this.props.recenter}><img src={centerIcon} alt="Center position"/></button>
            <button className={`${css.actionButton} ${css.actionButtonReset}`} onClick={this.props.reset}><img src={resetIcon} alt="Reset"/></button>
          </div>
        </aside>
      </aside>
    );
  }
}
