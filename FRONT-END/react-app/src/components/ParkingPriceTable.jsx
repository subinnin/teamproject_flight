import React,{useContext} from "react";
import { IsmobileContext } from "../IsmobileContext/IsmobileContext";
import windowsCss from "../sass/windows.module.scss";
import mobileCss from "../sass/mobile.module.scss";



function ParkingPriceTable() {
    let css = null;
    const mobile = useContext(IsmobileContext);
    if(mobile){
        css = mobileCss;
    }else{
        css = windowsCss;
    }
    return <table className={css.Table}>
            <thead>
                <tr>
                    <th colSpan="2">구분</th>
                    <th colSpan="2">주차요금</th>
                </tr>
                <tr>
                    <th>주차장</th>
                    <th>기준 시간</th>
                    <th>소형</th>
                    <th>대형</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td rowSpan="3">단기주차장</td>
                    <td>기본 30분</td>
                    <td>1,200원</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td className={css.highlightRed}>초과 15분당</td>
                    <td className={css.highlightRed}>600원</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td className={css.highlightBlue}>1일</td>
                    <td className={css.highlightBlue}>24,000원</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td rowSpan="3">장기주차장</td>
                    <td>시간당</td>
                    <td>1,000원</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>30분당</td>
                    <td>-</td>
                    <td>1,200원</td>
                </tr>
                <tr>
                    <td className={css.highlightBlue}>1일</td>
                    <td className={css.highlightBlue}>9,000원</td>
                    <td className={css.highlightBlue}>12,000원</td>
                </tr>

            </tbody>
        </table>
}


export default ParkingPriceTable;