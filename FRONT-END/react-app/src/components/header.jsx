import React, {useContext, useRef} from "react";
import { IsmobileContext } from "../IsmobileContext/IsmobileContext";
import windowsCss from "../sass/windows.module.scss";
import mobileCss from "../sass/mobile.module.scss";

function Header({setIsAirport}) {
    const title = useRef([]);
    const mobile = useContext(IsmobileContext);
    let css = null;
    if(mobile){
        css = mobileCss;
    }else{
        css = windowsCss;
    }
    return <header className={css.HeaderFrame}>
        <h2 className={css.HeaderTitle} >Flight Dashboard</h2>
        {/* <i class="fa-brands fa-github"></i> */}
        <nav className={css.HeaderInventory}>
            <p className={css.subTitleAirpot} ref={(ref)=>title.current[0]=ref}><i onClick={(e)=>{
                title.current[0].style.backgroundColor = "#424981";
                title.current[1].style.backgroundColor = "#ababab";
                setIsAirport(true);
            }}>flight</i></p>
            <p className={css.subTitleParking} ref={(ref)=>title.current[1]=ref}><i onClick={(e)=>{
                title.current[1].style.backgroundColor = "#424981";
                title.current[0].style.backgroundColor = "#adadad";
                setIsAirport(false);
            }}>parking</i></p>
        </nav>
    </header>
}

export default Header;

