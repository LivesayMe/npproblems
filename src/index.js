import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Corral from './pages/corral';

import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Tictactoe from './pages/tictactoe';
import Masyu from './pages/masyu';
import NQueens from './pages/nqueens';
import BullsCows from './pages/bullscows';
import Blocks from './pages/blocks';

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
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals