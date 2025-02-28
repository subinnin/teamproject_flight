import React, {useContext, useState} from "react";
import { IsmobileContext } from "../IsmobileContext/IsmobileContext";
import AircraftInformation from "./aircraftInformation";
import Parking from "./parking";
import windowsCss from "../sass/windows.module.scss";
import mobileCss from "../sass/mobile.module.scss";
import Icon from "./Icon";

function Main({isAirport,AirportFrame}) {
    // console.log(AirportFrame);
    window.onload = ()=>{
        window.scrollTo(0,0);
    }
    let css = null;
    const mobile = useContext(IsmobileContext);
    // const jsonServerData = useContext(airportJsonServerData);
    if(mobile){
        css = mobileCss;
    }else{
        css = windowsCss;
    }

    return <main className={css.MainFrame}>
        <div className={css.AirPortTotalFrame}>
            {isAirport? <AircraftInformation />:<Parking />}
        </div>
        <Icon />
    </main>
}

export default Main;