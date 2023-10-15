import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {useEffect} from 'react';
import {gapiLoaded, gisLoaded} from "./helper.js";
import 'leaflet/dist/leaflet.css';

useEffect(() => {
  const script = document.createElement('script');
  const script2 = document.createElement('script');
  script.src = "https://apis.google.com/js/api.js";
  script.async = true;
  script.defer = true;
  script.onload = () => {gapiLoaded()};
  script2.async = true;
  script2.defer = true;
  script.onload = ()=>{gisLoaded()};
  document.body.appendChild(script);
  document.body.appendChild(script2);
  return () => {
    document.body.removeChild(script);
    document.body.removeChild(script2);
  }

}, []);
export default function App() {
  return (
  <MapContainer className="w-full h-full" center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[51.505, -0.09]}>
      <Popup>
        A pretty CSS3 popup. <br /> Easily customizable.
      </Popup>
    </Marker>
  </MapContainer>
     
  );
}
