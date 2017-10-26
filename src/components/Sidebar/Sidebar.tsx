import * as React from 'react';

import * as css from './Sidebar.css';
import {Header} from '../Header';

interface SidebarState{
  isOpen: Boolean
}

export class Sidebar extends React.Component<{}, SidebarState>{

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
        <div onClick={this.toggleOpen} className={css.toggleSidebar}>
          <div className={hamburgerClass}>
            <div className={css.hamburgerLine}/>
            <div className={css.hamburgerLine}/>
            <div className={css.hamburgerLine}/>
          </div>
        </div>
      </aside>
    );
  }
}
