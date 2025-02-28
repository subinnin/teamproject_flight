import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import windowsCss from "../sass/windows.module.scss";
import mobileCss from "../sass/mobile.module.scss";
import { IsmobileContext } from "../IsmobileContext/IsmobileContext";
import weatherKey from "../key/weather";

const Weather = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const mobile = useContext(IsmobileContext);
  const [imgUrl, setImgUrl] = useState("img/cloud.png");
  //const API_KEY = "94832e045f9210fcb25d6ceb6c2b43d2"
  let css = null;
  if (mobile) {
    css = mobileCss;
  } else {
    css = windowsCss;
  }
  useEffect(() => {
    const fetchWeather = async () => {
  if (city && weatherKey) {
    const timestamp = new Date().getTime();
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherKey}&units=metric&_=${timestamp}`
      );

      if (response.data.name === "Turan") {
        response.data.name = "Da Nang";
      }
      if (response.data.name === "Phu Quoc") {
        response.data.name = "PhuQuoc";
      }

      setWeather(response.data);
    } catch (error) {
      console.error("요청을 만드는 중 오류 발생:", error.message);
    }
  }
};


    fetchWeather();
    // console.log(city);
  }, [city]);


  useEffect(() => {
    if (weather?.weather?.[0]?.description) {
      let imgurl = "";
      let description = weather.weather[0].description;
      if(description.includes("clear")){
        imgurl = "/weather/sunny.png";
      }else if(description.includes("rain")){
        imgurl = "/weather/rain.png";
      }else if(description.includes("thunder")){
        imgurl = "/weather/thunderstorm.png";
      }else if(description.includes("clouds")){
        imgurl = "/weather/clouds.png";
      }else if(description.includes("snow")){
        imgurl = "/weather/snow.png";
      }else if(description.includes("haze")){
        imgurl = "/weather/haze.png";
      }else if(description.includes("mist")){
        imgurl = "/weather/mist.png";
      }else if(description.includes("fog")){
        imgurl = "/weather/fog.png";
      }else if(description.includes("thunderstorm")){
        imgurl = "/weather/thunderstorm.png";
      }else if(description.includes("smoke")){
        imgurl = "/weather/smoke.png";
      }else if(description.includes("dust")){
        imgurl = "/weather/dust.png";
      }else if(description.includes("squall")){
        imgurl = "/weather/squall.png";
      }else if(description.includes("tornado")){
        imgurl = "/weather/tornado.png";
      }else if(description.includes("drizzle")){
        imgurl = "/weather/drizzle.png";
      }
      
      setImgUrl(imgurl);
    }
  }, [weather]);

  return (
    <div className={css.weatherTotaloneFrame}>
      {/* <h2>🌤️ 현재 날씨</h2> */}
      {weather ? (
        <div className={css.weatherTotaltwoFrame}>
          <div className={css.locationName} style={{ paddingLeft: "10px" }}>
            <i className="fa-solid fa-location-dot" ></i><div>{weather.name}</div>
          </div>
          <img className={css.weatherImg} src={imgUrl} alt="weatherImg"></img>
          <p className={css.weatherDegree}>{weather.main.temp}<sup>°C</sup></p>
          <p className={css.weatherInfo}>{weather.weather[0].description}</p>
          <div className={css.totalAttrHumidSpeedArea}>
            <div className={css.attrHumidSpeedArea}>
              <img className={css.humidityImg} src="/weather/humidity.png" alt="humidImg"></img>
              <div className={css.attrHumidSpeedInfoArea}>
                <p><span style={{color: "navy"}}>{weather.main.humidity}%</span></p>
                <p>Humidity</p>
              </div>
            </div>
            <div className={css.attrHumidSpeedArea}>
              {/* img classname */}
              <img className={css.humidityImg} src="/weather/windSpeed.png" alt="windImg"></img>
              <div className={css.attrHumidSpeedInfoArea}>
                <p><span style={{color: "red"}}>{weather.wind.speed}km/h</span></p>
                <p>Wind Speed</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>날씨 정보를 불러오는 중...</p>
      )}
    </div>
  );
};

export default Weather;
