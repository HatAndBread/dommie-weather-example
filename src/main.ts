import app, { Template } from "dommie";
import { weatherForecast } from "./weather-forecast";
import style from "./style";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const t = (h: Template) => {
  const { component, div, p, h1, img } = h;
  return component(({ afterMounted, state }) => {
    const lngLat = state<{ lat: number; lng: number } | null>(null);

    afterMounted(() => {
      const map = L.map("map").setView([51.505, -0.09], 1);
      map.on("click", (e) => {
        let { lng, lat } = e.latlng;
        lng = lng % 180;
        lat = lat % 90;
        lngLat.update({ lng, lat });
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
    });
    div({ style: style.main }, () => {
      div(
        {
          style: {
            display: "flex",
            justifyContent: "center",
            padding: "16px",
          },
        },
        () => {
          div({ style: { textAlign: "center" } }, () => {
            img({
              src: "/icon.png",
              height: "100px",
              width: "100px",
              style: { borderRadius: "16px" },
            });
            h1({ text: "Dommie Example Weather App", style: { margin: 0 } });
            p({
              text: "Click anywhere in the world to get the current wearther.",
            });
          });
        },
      );
      weatherForecast(h, lngLat);
      div({ id: "map", style: style.map });
    });
  });
};

app(t, "#app");
