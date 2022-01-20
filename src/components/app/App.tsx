// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import React from 'react';
import './App.scss';
import OsakeKauppaLaskuriView from "../views/osakekauppa/OsakeKauppaLaskuriView";
import { APP_CLASS_NAME } from "../constants/classNames";

function App () {
  return (
    <div className={APP_CLASS_NAME}>
      <header className={APP_CLASS_NAME+'-header'}>
        <h1>Laskurit</h1>
      </header>
      <section className={APP_CLASS_NAME+'-content'}>

            <OsakeKauppaLaskuriView

            />

      </section>
    </div>
  );
}

export default App;
