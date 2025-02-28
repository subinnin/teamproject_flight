import React,{ useState, useEffect} from "react";
import windowsCss from "../sass/windows.module.scss";
import mobileCss from "../sass/mobile.module.scss";
import {IsmobileContext} from "../IsmobileContext/IsmobileContext";
import Header from "./header";
import Main from "./main";

function Airport() {
    const [isMobile, setIsMobile] = useState(window.innerWidth<1100);
    const [isAirport, setIsAirport] = useState(true);
    // const [flightPath, setFlightPath] = useState();
    useEffect(()=>{
        const mobileCheck = () =>{
            setIsMobile(window.innerWidth<1100);
        }
        window.addEventListener("resize",mobileCheck);
        return ()=>{
           window.removeEventListener("resize",mobileCheck);
        }
    },[]);
    
        
    return <IsmobileContext.Provider value={isMobile}>
        <div id="AirportFrame" className={isMobile? mobileCss.AirportFrame:windowsCss.AirportFrame} >
            <Header setIsAirport={setIsAirport} />
            <Main isAirport={isAirport} />
        </div>
    </IsmobileContext.Provider>
}

export default Airport;