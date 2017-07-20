/* eslint-disable no-undef */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

var initialCenter = { lng: -90.1056957, lat: 29.9717272 }

if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(function(position) {
             initialCenter = {
               lat: position.coords.latitude,
               lng: position.coords.longitude
             };

             ReactDOM.render(
               <App initialCenter={initialCenter}/>,
               document.getElementById('root')
             );
         });
}
else {
  ReactDOM.render(
    <App initialCenter={initialCenter}/>,
    document.getElementById('root')
  );
}
