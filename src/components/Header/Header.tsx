import * as React from 'react';

const logo = require('../../assets/icons/icon.svg');
const github = require('../../assets/icons/github.svg');

import * as css from './Header.css';

export const Header: React.StatelessComponent = () => {
  return(
    <header className={css.header}>
      <h1 className={css.heading}><img className={css.headingLogo} src={logo} alt="L"/>ifelike</h1>
      <a className={css.link} href="https://github.com/Theomg/lifelike"><p className={css.subtitle}><img alt="GitHub logo" className={css.subtitleLogo} src={github}/>About and Source</p></a>
    </header>
  );
}