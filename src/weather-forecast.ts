import { Template, State } from "dommie";
import style from "./style";
import { openMeteoRequest, codeToWeather } from "./open-meteo-request";

const weatherForecast = (
  h: Template,
  lngLat: State<{ lng: number; lat: number } | null>,
) => {
  const { component, div, img, button, span } = h;
  return component(({ state, subscribe }) => {
    const theWeather = state<Weather | null>(null);
    const fetchingWeather = state(false);

    const fetchWeather = async () => {
      if (!lngLat.value) return;
      fetchingWeather.update(true);
      const result = await openMeteoRequest(lngLat.value);
      const isDay = result.current.is_day;
      const weather = codeToWeather(result.current.weather_code, isDay);
      const temperature = `${result.current.temperature_2m}°C`;
      const apparentTemperature = `${result.current.apparent_temperature}°C`;
      const elevation = `${result.elevation}m`;
      const time = new Date(result.current.time).toLocaleTimeString();
      fetchingWeather.update(false);
      theWeather.update({
        img: weather.image,
        weatherDescription: weather.description,
        temperature,
        apparentTemperature,
        time,
        elevation,
        latitude: lngLat.value.lat,
        longitude: lngLat.value.lng,
      });
    };

    subscribe(async () => {
      if (!lngLat.value) return;
      await fetchWeather();
    }, [lngLat]);

    div(() => {
      div(
        {
          subscribe: [theWeather, fetchingWeather],
          style: { position: "relative" },
        },
        () => {
          if (!theWeather.value && !fetchingWeather.value) return;
          div({ style: style.weatherModal }, () => {
            if (fetchingWeather.value) {
              div(
                {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  },
                },
                () => {
                  div({ text: "Fetching weather..." });
                  span({ class: "loader" });
                },
              );
              return;
            }
            button({
              text: "✖︎",
              click: () => theWeather.update(null),
              style: style.closeButton,
            });
            div({ text: `Weather: ${theWeather.value!.weatherDescription}` });
            div({ text: `Temperature: ${theWeather.value!.temperature}` });
            div({
              text: `Feels like: ${theWeather.value!.apparentTemperature}`,
            });
            div({ text: `Time: ${theWeather.value!.time}` });
            div({ text: `Elevation: ${theWeather.value!.elevation}` });
            div({ text: `Latitude: ${theWeather.value!.latitude.toFixed(2)}` });
            div({
              text: `Longitude: ${theWeather.value!.longitude.toFixed(2)}`,
            });
            div(
              { style: { display: "flex", justifyContent: "center" } },
              () => {
                img({
                  src: theWeather.value!.img,
                  height: "100px",
                  width: "100px",
                });
              },
            );
          });
        },
      );
    });
  });
};

type Weather = {
  img: string;
  weatherDescription: string;
  temperature: string;
  apparentTemperature: string;
  time: string;
  elevation: string;
  latitude: number;
  longitude: number;
};

export { weatherForecast };
