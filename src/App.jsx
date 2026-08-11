import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const defaultPosition = [28.6139, 77.2090];

const projectData = [
  { name: "Road Project", lat: 28.6145, lng: 77.2105, type: "Infrastructure" },
  { name: "Government School", lat: 28.6155, lng: 77.2120, type: "Education" },
  { name: "City Hospital", lat: 28.6125, lng: 77.2080, type: "Health" },
  { name: "Metro Station", lat: 28.6118, lng: 77.2140, type: "Transit" }
];

function getDistanceKm([lat1, lon1], [lat2, lon2]) {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

function App() {
  const [position, setPosition] = useState(defaultPosition);
  const [status, setStatus] = useState("Detecting your location...");

  const locateUser = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not available in your browser.");
      return;
    }

    setStatus("Requesting location access...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos = [pos.coords.latitude, pos.coords.longitude];
        setPosition(userPos);
        setStatus("Location detected successfully.");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("Location access denied. Showing default location.");
        } else {
          setStatus("Unable to retrieve location. Showing default location.");
        }
        setPosition(defaultPosition);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    locateUser();
  }, []);

  const nearbyProjects = useMemo(() => {
    return projectData
      .map((project) => ({
        ...project,
        distance: getDistanceKm(position, [project.lat, project.lng])
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [position]);

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <h1>Nearby Projects Map</h1>
          <p>
            This app shows your location and nearby project markers on a map.
            Use the button to refresh your current location.
          </p>
        </div>
        <button type="button" onClick={locateUser}>
          Refresh Location
        </button>
      </header>

      <section className="location-status">
        <div>
          <strong>Current position:</strong>
          <span>{position[0].toFixed(5)}, {position[1].toFixed(5)}</span>
        </div>
        <div className="status-message">{status}</div>
      </section>

      <main className="content-grid">
        <div className="map-panel">
          <MapContainer center={position} zoom={14} className="map-frame" scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <Marker position={position}>
              <Popup>You are here</Popup>
            </Marker>

            {projectData.map((project) => (
              <Marker key={project.name} position={[project.lat, project.lng]}>
                <Popup>
                  <strong>{project.name}</strong>
                  <br />
                  Type: {project.type}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <aside className="project-panel">
          <h2>Nearby Projects</h2>
          <ul className="project-list">
            {nearbyProjects.map((project) => (
              <li key={project.name} className="project-item">
                <div>
                  <strong>{project.name}</strong>
                  <div className="project-type">{project.type}</div>
                </div>
                <div className="project-distance">
                  {project.distance.toFixed(2)} km
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </main>
    </div>
  );
}

export default App;