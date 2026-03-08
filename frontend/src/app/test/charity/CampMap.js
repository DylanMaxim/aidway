"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

function getRiskColor(riskLevel) {
  if (riskLevel === "red") return "#dc2626";
  if (riskLevel === "orange") return "#f59e0b";
  return "#16a34a";
}

function getMarkerRadius(totalRequests) {
  const safeTotal = Number(totalRequests || 0);
  return Math.max(8, Math.min(14, 8 + Math.floor(safeTotal / 5)));
}

export default function CampMap({ camps }) {
  const mapStyle = {
    height: 420,
    width: "100%"
  };

  return (
    <MapContainer center={[24, 40]} zoom={4} style={mapStyle} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {(camps || []).map((camp) => (
        <CircleMarker
          key={camp.campId}
          center={[camp.lat, camp.lng]}
          radius={getMarkerRadius(camp.totalRequests)}
          pathOptions={{
            color: getRiskColor(camp.riskLevel),
            fillColor: getRiskColor(camp.riskLevel),
            fillOpacity: 0.75,
            weight: 2
          }}
        >
          <Popup>
            <div style={{ fontSize: 13, lineHeight: 1.4 }}>
              <div><strong>campId:</strong> {camp.campId}</div>
              <div><strong>regionName:</strong> {camp.regionName}</div>
              <div><strong>totalRequests:</strong> {camp.totalRequests}</div>
              <div><strong>flaggedCount:</strong> {camp.flaggedCount}</div>
              <div><strong>highUrgencyCount:</strong> {camp.highUrgencyCount}</div>
              <div><strong>sanitaryPadsCount:</strong> {camp.sanitaryPadsCount}</div>
              <div><strong>riskLevel:</strong> {camp.riskLevel}</div>
              <div>
                <strong>predictedNextMonthPads:</strong>{" "}
                {camp.predictedNextMonthPads ?? "unavailable"}
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
