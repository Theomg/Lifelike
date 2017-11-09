import * as React from 'react';

import * as css from './Sidebar.css';
import {Header} from '../Header';
import {NeighborhoodType} from '../App/App';

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
  neighborhoodType: NeighborhoodType,
  neighborhoodSize: number,
  neighborhoodAddSelf: boolean,
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
      isOpen: true
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
    return(
      <aside className={sidebarClass}>
        <section className={css.sidebarContent}>
          <Header />
        </section>
          <div className={css.sidebarMenu}>
            <div onClick={this.toggleOpen} className={css.toggleSidebar}>
              <div className={hamburgerClass}>
                <div className={css.hamburgerLine}/>
                <div className={css.hamburgerLine}/>
                <div className={css.hamburgerLine}/>
              </div>
            </div>
            <div>
              <div>BTN</div>
            </div>
         </div>
      </aside>
    );
  }
}
