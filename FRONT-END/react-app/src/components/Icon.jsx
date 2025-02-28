import React, { useContext } from "react";
import { IsmobileContext } from "../IsmobileContext/IsmobileContext";
import windowsCss from "../sass/windows.module.scss";
import mobileCss from "../sass/mobile.module.scss";


function Icon() {
    let css = null;
    const mobile = useContext(IsmobileContext);
    if (mobile) {
        css = mobileCss;
    } else {
        css = windowsCss;
    }

    return <div className={css.iconBox}>
            <a href="http://kkms4001.iptime.org" target="_blank">
                <div className={css.githubIcon}></div>
            </a>
            <a href="http://google.com" target="_blank">
                <div className={css.pdfIcon}></div>
            </a>
        </div>
}

export default Icon;