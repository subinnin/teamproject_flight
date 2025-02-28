import React, { useContext, useEffect, useState, useRef } from "react";
import { IsmobileContext } from "../IsmobileContext/IsmobileContext";
// import { airportJsonServerData } from "../airportjsonContext/airportjsondata";
import key from "../key/key";
import axios from "axios";
import windowsCss from "../sass/windows.module.scss";
import mobileCss from "../sass/mobile.module.scss";
import ParkingChart from "./ParkingChart";
import ParkingPriceTable from "./ParkingPriceTable";

function Parking() {
    let css = null;
    const parkingT1 = [];
    const parkingT2 = [];
    const [groundT1, setGroundT1] = useState([]);
    const [unGroundP1, setUnGroundP1] = useState([]);
    const [unGroundP2, setUnGroundP2] = useState([]);
    const [unGroundP5, setUnGroundP5] = useState([]);
    const [groundT2, setGroundT2] = useState([]);
    const [reservationT2, setReservationT2] = useState([]);
    const [longTimeT2, setLongTimeT2] = useState([]);
    const regEx = /^T1.*/;
    const regExGround = /^T1\s단기주차장.*/;
    const regExunGroundP1P3 = /^T1\s장기\sP[13].*/;
    const regExunGroundP2P4 = /^T1\s장기\sP[24].*/;
    const regExunGroundP5 = /^T1\sP5.*/;
    const regExGroundT2 = /^T2\s단기.*/;
    const regExLongTimeT2 = /^T2\s장기.*/;
    const regExReservationT2 = /^T2\s예약.*/;
    const url = `http://apis.data.go.kr/B551177/StatusOfParking/getTrackingParking?serviceKey=${key}&numOfRows=50&pageNo=1&type=json`;
    useEffect(() => {
        axios.get(url)
            .then(res => {
                console.log(res.data);
                const { body: { items } } = res.data.response;
                items.forEach((parking, index) => {
                    if (regEx.test(parking.floor.trim())) {
                        parkingT1.push(parking);
                    } else {
                        parkingT2.push(parking);
                    }
                });
                const parkingCheck = (regEx, parkingList, type) => {
                    if (type === "T2") {//sort 
                        for (let i = 0; i < parkingList.length; i++) {
                            for (let j = i + 1; j < parkingList.length; j++) {
                                if (Number(parkingList[i].floor.slice(-2, -1)) < Number(parkingList[j].floor.slice(-2, -1))) {
                                    [parkingList[i], parkingList[j]] = [parkingList[j], parkingList[i]];
                                }
                            }
                        }
                    }
                    return parkingList.map((data, index) => {
                        if (regEx.test(data.floor.trim())) {
                            let status = ``;
                            let color = ``;
                            if (Number(data.parking) >= Number(data.parkingarea)) {
                                status = "만차";
                                color = "red";
                            } else {
                                status = (Number(data.parkingarea) - Number(data.parking)).toLocaleString(undefined) + " 대 가능";
                                color = "black";
                            }
                            return <p key={"status" + index} style={{ color: color }}>{status}</p>
                        }
                    });
                }
                setGroundT1(parkingCheck(regExGround, parkingT1).filter(data => Boolean(data)));
                setUnGroundP1(parkingCheck(regExunGroundP1P3, parkingT1).filter(data => Boolean(data)));
                setUnGroundP2(parkingCheck(regExunGroundP2P4, parkingT1).filter(data => Boolean(data)));
                setUnGroundP5(parkingCheck(regExunGroundP5, parkingT1).filter(data => Boolean(data)));
                setGroundT2(parkingCheck(regExGroundT2, parkingT2, "T2").filter(data => Boolean(data)));
                setLongTimeT2(parkingCheck(regExLongTimeT2, parkingT2, "T2").filter(data => Boolean(data)));
                setReservationT2(parkingCheck(regExReservationT2, parkingT2, "T2").filter(data => Boolean(data)));

            })
            .catch(err => { console.log(`GET PARKING DATA ERROR:${err}`) });
    }, []);

    const mobile = useContext(IsmobileContext);
    const T1Ref = useRef(null);
    const T2Ref = useRef(null);
    const onlyMobileRef = useRef(null);
    const parkingTotalArea = useRef(null);
    // 선택된 터미널을 상태로 관리 ('first' 또는 'second')
    const [selectedTerminal, setSelectedTerminal] = useState('first');

    // 터미널 선택 함수
    const selectTerminal = (terminal) => {
        if (terminal === 'first') {
            setSelectedTerminal('first');
        } else {
            setSelectedTerminal('second');
        }
    };
    if (mobile) {
        css = mobileCss;
    } else {
        css = windowsCss;
    }

    useEffect(() => {
        if (mobile) {
            if (selectedTerminal === 'first') {
                T1Ref.current.classList.add(css.active);
                T2Ref.current.classList.remove(css.active);

            } else if (selectedTerminal === 'second') {
                T1Ref.current.classList.remove(css.active);
                T2Ref.current.classList.add(css.active);

            }
        } else {
            onlyMobileRef.current.style.display = "none";
        }

    }, [mobile, selectTerminal]);
    return <div ref={parkingTotalArea} className={css.ParkingFrame}>
        <nav className={css.parkingInventory} style={mobile? {display:"block"}:{display:"none"}}>
            <div ref={onlyMobileRef} className={css.parkingToggleArea}>
                <div className="toggle-container">
                    <button
                        className={`toggle-btn ${selectedTerminal === 'first' ? 'active' : ''}`}
                        onClick={() => selectTerminal('first')}>
                        제1여객터미널
                    </button>
                    <button
                        className={`toggle-btn ${selectedTerminal === 'second' ? 'active' : ''}`}
                        onClick={() => selectTerminal('second')}>
                        제2여객터미널
                    </button>
                </div>
            </div>

        </nav>
        <section className={css.ParkingT1T2Frame} >
            {/* T1 주차장 정보 */}
            <article ref={T1Ref} className={css.ParkingT1Frame}>
                <h4>제1여객터미널</h4>
                <div className={css.ParkingT1img} style={{ backgroundImage: `url("/parking/airportT1parking.png")` }}>
                    <div className={css.ParkingGround}>
                        <div className={css.ParkingGroundTextFrame}>
                            {groundT1}
                        </div>
                    </div>
                    <div className={css.ParkingunGroundP1P2P3P4}>
                        <div className={css.ParkingP2TextFrame}>
                            {unGroundP2}
                        </div>
                        <div className={css.ParkingP1TextFrame}>
                            {unGroundP1}
                        </div>
                    </div>
                    <div className={css.ParkingunGroundP5}>
                        <div className={css.ParkingP5TextFrame}>
                            {unGroundP5}
                        </div>
                        <div className={css.ParkingP5subTextFrame}></div>
                    </div>
                </div>
            </article>
            {/* T2 주차장 정보 */}
            <article ref={T2Ref} className={css.ParkingT2Frame}>
                <h4>제2여객터미널</h4>
                <div className={css.ParkingT2img} style={{ backgroundImage: `url("/parking/airportT2parking.png")` }} >
                    <div className={css.ParkingT2Ground}>
                        {groundT2}
                    </div>
                    <div className={css.ParkingT2LongTimeReservation}>
                        {reservationT2}
                        {longTimeT2}
                    </div>
                </div>
            </article>
        </section>


        {/* //////////////////// */}
        <section className={css.ParkingChartExplantionFrame}>
            <article className={css.ParkingChartFrame}>
                <h4 className={css.ParkingTitle}>Traffic Congestion </h4>
                <ParkingChart />
            </article>

            <article className={css.ParkingExplantionFrame}>
                <h4 className={css.PriceTitle}>Parking Price</h4>
                <ParkingPriceTable />
            </article>
        </section>
    </div>
}


export default Parking;