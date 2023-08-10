import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Card from './Card/Card'

const root = ReactDOM.createRoot(document.getElementById('root'));

const Header = ({ headerStyle }) => {
  return(
    <div className='header' style={{...headerStyle, background: 'orange'}}>
      Ciao Head
    </div>
  )
}

root.render(
  <React.StrictMode>
    <Card
      Header={Header}
      headerHeight={160}
    >
      <div>Ciao</div>
    </Card>
  </React.StrictMode>
);
