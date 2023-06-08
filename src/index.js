import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Corral from './pages/corral';
import './index.css';

import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Tictactoe from './pages/tictactoe';
import Masyu from './pages/masyu';
import NQueens from './pages/nqueens';
import BullsCows from './pages/bullscows';
import Blocks from './pages/blocks';
import AIBlocks from './pages/ai_blocks';
import Uno from './pages/uno';
import DPC from './pages/dpc';
import Racing from './pages/racing';
import Personal from './pages/personal';
import Othello from './pages/othello';
import LiarsDice from './pages/liarsdice';
import SubsetSum from './pages/subsetsum';
import Towers from './pages/towers';
import WaveCollapse from "./pages/wfc";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>
  },
  {
    path: "/corral",
    element: <Corral/>
  },
  {
    path: "/tictactoe",
    element: <Tictactoe/>
  },
  {
    path: "/masyu",
    element: <Masyu/>
  },
  {
    path: "/nqueens",
    element: <NQueens/>
  },
  {
    path: "/bullscows",
    element: <BullsCows/>
  },
  {
    path: "/blocks",
    element: <Blocks/>
  },
  {
    path: "/aiblocks",
    element: <AIBlocks/>
  },
  {
    path: "/uno",
    element: <Uno/>
  },
  {
    path: "/dpc",
    element: <DPC/>
  },
  // {
  //   path: "/racing",
  //   element: <Racing/>
  // }
  {
    path: "/personal/:postId",
    element: <Personal/>
  },
  {
    path: "/personal",
    element: <Personal/>
  },
  {
    path: "/othello",
    element: <Othello/>
  },
  {
    path: "/liarsdice",
    element: <LiarsDice/>
  },
  {
    path: "/subsetsum",
    element: <SubsetSum/>
  },
  {
    path: "/towers",
    element: <Towers/>
  },
  {
    path: "/wfc",
    element: <WaveCollapse/>
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}/>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals