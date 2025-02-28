import React, {useContext, useEffect, useState, useRef, useCallback} from "react";
import { IsmobileContext } from "../IsmobileContext/IsmobileContext";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import { useReactToPrint } from 'react-to-print';
// import { airportJsonServerData } from "../airportjsonContext/airportjsondata";
import key from "../key/key";
import axios from "axios";
import windowsCss from "../sass/windows.module.scss";
import mobileCss from "../sass/mobile.module.scss";
import Globe from './Globe';
import PriceChart from "./PriceChart";
import GaugeChart from "./gauge";
import Weather from "./weather";





function AircraftInformation() {
    let css = null;
    const mobile = useContext(IsmobileContext);
    if(mobile){
        css = mobileCss;
    }else{
        css = windowsCss;
    }

    ///////////////////////////////////수빈////////////////
    const [size, setSize] = useState(window.innerWidth / 3);
    const [locationName, setLocationName] = useState('');
    const [city, setCity] = useState('');

    const handleResize = () => {
        const width = window.innerWidth / 2; 
        const height = window.innerWidth / 2; 
        setSize({ width, height });
    };
    useEffect(() => {
        const onResize = () => {
            requestAnimationFrame(handleResize);
        };

        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);
    //////////////////////////////////수빈//////////////////


    const [searchColor, setSearchColor] = useState(null);
    const airPortList = useRef([]);
    const airPortInput = useRef([]);
    ////////////////////////////////////////////////김건우 추가_b_2025_02_22
    const [inflight, setInFlight] = useState([]); 
    const [latLonVelocityCity, setLatLonVelocityCity] = useState({}); //위도 경도 속도 데이터_도착항공_25_02_21_김건우
    const [isToggle, setIsToggle] = useState(true); //토글 버튼 추가_25_02_21_김건우
    const [processedData,setProcessedData] = useState([]);
    const [nationData, setNationData] = useState([]);
    const [nationOption, setNationOption] = useState([]);
    const [nationTotalOption, setNationTotalOption] = useState([]);
    const printRef = useRef(null);
    ///////////////////////////////////////////////
    const [totalAirDataList,setTotalAirDataList] = useState(null);
    const [hour,month,date] = [new Date().getFullYear(),String(new Date().getMonth()+1).padStart(2,'0'),String(new Date().getDate()).padStart(2,'0')];
    const [airPortText,setAirPortText]= useState([]);
    
    const url = `http://apis.data.go.kr/B551177/statusOfAllFltDeOdp/getFltDeparturesDeOdp?serviceKey=${key}&pageNo=1&numOfRows=200&searchdtCode=E&searchDate=${hour+month+date}&searchFrom=0000&searchTo=2400&flightId=KE&passengerOrCargo=P&type=json`;
    useEffect(()=>{
            let color = ``;
            let clickPlane = null;
            const axsioAirportData = async () => {
                try {
                    const res = await axios.get(url);
                    const {response:{body:{items}}} = res.data;
                    //////////////////////////////////////////////////////////////////////////////////////////////////
                    //////////////////////////////////초기화면 랜더링 부분 함수/////////////////////////////////////////
                    /////////////////////////////////////////////////////////////////////////////////////////////////
                    const getRecentFightsData = (data, index, remarkData='') =>{
                        const Arrival = data.airport.replace(/[\/|()].+/g, "");
                        setLocationName(Arrival);
                        //////////////////////////////////////////////////////////////////////////////////////////////////
                        //////////////////////////////////월별 가격 데이터 표시부분/////////////////////////////////////////
                        ////////////////////////////////////////////////////////////////////////////////////////////////
                        const nationSend = async () =>{
                            try{
                                await axios.post("http://kkms4001.iptime.org:25038/nation",{
                                    // http://kkms4001.iptime.org:25038/nation
                                    "nation":Arrival
                                }).then(res=>{
                                    const month = {JANUARY:"JAN", FEBRUARY:"FEB", MARCH:"MAR", APRIL:"APR", MAY:"MAY", JUNE:"JUN", JULY:"JUL", AUGUST:"AUG", SEPTEMBER:"SEP", OCTOBER:"OCT", NOVEMBER:"NOV", DECEMBER:"DEC"}; 
                                    const monthList = res.data.map(nationData=>{
                                        return Object.keys(month).map(monthData=>{
                                            return {date: month[monthData], price:nationData[monthData]}
                                        });
                                    });
                                    setProcessedData(monthList[0].map(d => ({
                                        date: new Date(2024, ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].indexOf(d.date), 1),
                                        price: d.price
                                    })));
                                    setNationData({img:res.data[0].FLAG, nationLat:res.data[0].LATITUDE, nationLon:res.data[0].LONGITUDE});
                                });
                                console.log(`SUCESS SEND NATION`);
                            }catch(err){
                                console.log(`ERROR SEND NATION:${err}`);
                            }
                        }
                        nationSend();
                        //////////////////////////////////////////////////////////////////////////////////////////////////
                        //////////////////////////////////월별 가격 데이터 표시부분/////////////////////////////////////////
                        ////////////////////////////////////////////////////////////////////////////////////////////////

                        setLatLonVelocityCity({//위도 경도 속도 데이터_도착항공_25_02_21_김건우
                            lat: data.latitude,
                            lon: data.longitude,
                            velocity: data.velocity,
                            altitude: data.altitude,
                            ArrivalAirport: Arrival
                        });
                        // let remarkText = ``;
                        // if (remarkData) {
                        //     remarkText = remarkData;
                        // } else {
                        //     remarkText = data.remark ? data.remark : "비고";
                        // }
                        const getHourMinutes = (airPortData) =>{
                            const [year,monthMinutesData,time] = [...airPortData.match(/\d{1,4}/g)];
                            const [month, date] = [...monthMinutesData.match(/\d{1,2}/g)];
                            const [hour, minutes ] = [...time.match(/\d{1,2}/g)];
                            return [month, date, hour, minutes];
                        }
                        const [,,scheduleHour,scheduleMin] = [...getHourMinutes(data.scheduleDatetime)];
                        const [,,estimatedHour,estimatedMin] = [...getHourMinutes(data.estimatedDatetime)];
                        if(!mobile){
                            setAirPortText([<div key={"RecentFightsDetailFrame"+index} className={css.RecentFightsDetailFrame}>
                            <li>
                                    {/* ({data.masterFlightId})</p> */}
                                <p>항공사</p>
                                <p>대한항공</p>
                                <p>{data.flightId}</p>
                            </li>
                            <li>
                                <p>여정</p>
                                <p>인천 <i className="fa-solid fa-arrow-right"></i> {data.airport} </p>
                                <p>출발 {scheduleHour}:{scheduleMin} (KST)</p>
                                <p>예상 {estimatedHour}:{estimatedMin}</p>
                            </li>
                            <li>
                                <p>GATE</p>
                                <p>{data.gateNumber}</p>
                                {/* <p>Check-In</p> */}
                                {/* <p>({data.chkinRange})</p> */}
                            </li>
                            <li>
                                <p>상태</p>
                                <p>{remarkData}</p>
                            </li>
                            </div>
                            ]);
                        }else{ //모바일 상태 현황
                            setAirPortText([<div key={"RecentFightsDetailFrame"+index} className={css.RecentFightsDetailFrame}>
                            <li>
                                    {/* ({data.masterFlightId})</p> */}
                                <div className={css.mobileRecntFightsOneFrame}>
                                    <p>항공사: </p>
                                    <p>대한항공</p>
                                    <p>({data.flightId})</p>
                                </div>
                                <div className={css.mobileRecntFightsTwoFrame}>
                                    <p>FROM: </p>
                                    <p>인천</p>
                                    <p>TO: </p>
                                    <p>{data.airport}</p>
                                </div>
                                <div className={css.mobileRecntFightsThreeFrame}>
                                    <p>출발: </p>
                                    <p>{scheduleHour}:{scheduleMin} (KST)</p>
                                    <p>예상: </p>
                                    <p>{estimatedHour}:{estimatedMin}</p>
                                </div>
                                <div className={css.mobileRecntFightsFourFrame}>
                                    <p>GATE: </p>
                                    <p>{data.gateNumber}</p>
                                </div>
                            </li>
                            <li>
                                <div className={css.mobileRecntFightsFiveFrame}>
                                    <p>상태</p>
                                    <p>{remarkData}</p>
                                </div>
                            </li>
                            </div>
                            ]);
                        }
                    }
                    //////////////////////////////////////////////////////////////////////////////////////////////////
                    //////////////////////////////////초기화면 랜더링 부분 함수/////////////////////////////////////////
                    /////////////////////////////////////////////////////////////////////////////////////////////////


                    const getFlyElements = async (data, index, remarkData = '') => {
                        // console.log(data.flightId);
                        clickPlane = await data.flightId; // 선택 된 비행중인 고도, 위도 값 넘기기 위해 ID 대입
                        getRecentFightsData(data, index, remarkData);
                    
                    }


                    //////////////////////////////////////////////////////////////////////////////////////////////////
                    //////////////////////////////////비행중인 함수 JSON-SEVER DATA 받아오기///////////////////////////
                    /////////////////////////////////////////////////////////////////////////////////////////////////
                    const airportJsonServer = async () =>{
                        try{
                            const res = await axios.get("http://kkms4001.iptime.org:25039/airport");
                            const response = res.data[0].airportList.map(v=>v);
                            const codeArr = response.map(code=> code.flightNumber);
                            const filterFlyList = items.filter(code => codeArr.includes(code.flightId));
                            const flyaddList = filterFlyList.map(filtercode => {
                            for (let i = 0; i < response.length; i++) {
                                if (response[i].flightNumber === filtercode.flightId) {
                                        return {
                                            airport: filtercode.airport,
                                            remark: filtercode.remark,
                                            gateNumber: filtercode.gateNumber,
                                            chkinRange: filtercode.chkinRange,
                                            scheduleDatetime: filtercode.scheduleDatetime,
                                            estimatedDatetime: filtercode.estimatedDatetime,
                                            flightId: response[i].flightNumber,
                                            altitude: response[i].altitude,
                                            heading: response[i].heading,
                                            latitude: response[i].latitude,
                                            longitude: response[i].longitude,
                                            velocity: response[i].velocity
                                        };
                                        break;
                                    }
                                }
                            });
                            // console.log(clickPlane);
                            if(clickPlane === null){
                                flyaddList.map((data, index)=>{
                                if(index === 0){
                                        getRecentFightsData(data, index, '비행중');
                                    }
                                });
                            }else{
                                flyaddList.map((data, index)=>{
                                    if(data.flightId === clickPlane){
                                        getRecentFightsData(data, index, '비행중');
                                    }
                                });
                            }
                            setNationTotalOption(items.map((data, index)=>{
                                return <option key={"totalNationOption"+index} data-key={data.flightId} value={data.airport}>{data.airport} ({data.flightId})</option>
                            }));
                            // setNationTotalOption();
                            setNationOption(flyaddList.map((data, index)=>{
                                    return <option key={"nationOption"+index} data-key={data.flightId} value={data.airport}>{data.airport} ({data.flightId})</option>
                            }));

                            setInFlight(flyaddList.map((data, index)=>{
                                return <li id={data.flightId} className={data.airport} key={"AirData"+index} onClick={()=>getFlyElements(data, index, "비행중")}>
                                    <p className={css.airPortCheck}>
                                        <i className="fa-solid fa-circle" style={{color:"#b012f1"}}></i>
                                    </p>
                                    <div className={css.airlinerTextFrame}>
                                        <p className={css.flightIdText}>{data.flightId}</p>
                                        <p className={css.airportText}>{data.airport}</p>
                                        <p className={css.remarkText} >비행중</p>
                                    </div>
                                </li>
                            }));
                            //////////////////////////////////////////////////////////////////////////////////////////////////
                            //////////////////////////////////비행중인 함수 JSON-SEVER DATA 받아오기///////////////////////////
                            /////////////////////////////////////////////////////////////////////////////////////////////////
                        }catch(err){
                            console.log(`JSON-SERVER GET DATA ERROR:${err}`);
                        }
                        setTimeout(airportJsonServer, 2* 60 * 1000); // 2분 마다 재 실행 
                    }
                    airportJsonServer();

                    //////////////////////////////////////////////////////////////////////////////////////////////////
                    //////////////////////////////////페이지 로드 될 때 값 뿌려주는 함수////////////////////////////////
                    /////////////////////////////////////////////////////////////////////////////////////////////////
                    const AirDataList = items.map((data, index)=>{
                        if(data.remark === "탑승준비"){color = "yellow";
                        }else if(data.remark === "탑승중"){color="#09e609";
                        }else if(data.remark === "출발"){color="#0000a5";
                        }else if(data.remark === "지연"){color="#F7630C";
                        }else if(data.remark === "탑승마감"){color="red";}
                        else{color="gray"}
                        return <li id={data.flightId} className={data.airport} key={"AirData"+index} onClick={()=>{getFlyElements(data, index, data.remark?data.remark:"비고")}}>
                            <p className={css.airPortCheck}>
                                <i className="fa-solid fa-circle" style={{color:color}}></i>
                            </p>
                            <div className={css.airlinerTextFrame}>
                                <p className={css.flightIdText}>{data.flightId}</p>
                                <p className={css.airportText}>{data.airport}</p>
                                <p className={css.remarkText} >{data.remark ? data.remark : "비고"}</p>
                            </div>
                        </li>
                    });
                    //////////////////////////////////////////////////////////////////////////////////////////////////
                    //////////////////////////////////페이지 로드 될 때 값 뿌려주는 함수////////////////////////////////
                    /////////////////////////////////////////////////////////////////////////////////////////////////
                    setTotalAirDataList(AirDataList);
                }catch(err){
                    console.log(`GET AIRPORT DATA ERROR:${err}`)
                }finally{
                    console.log(`GET AIRPORT DATA SUCESS`)
                }
        }
        axsioAirportData();
    },[mobile]);

    //////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////국가명 한글 -> 영어 번역////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////
    useEffect(()=>{
        const googleTranslate = async (locationName) => {
            // const apiKey = 'AIzaSyDITKa78JbRrAtmyvJ1jSgLPeH-oLyzbFY'; // 발급받은 Google API Key
            const apiKey = 'AIzaSyBVqbs2sqJDDgvKN54AQoJfbo9Ccdz2zUI';
            const url = `https://translation.googleapis.com/language/translate/v2`;

            await axios.post(url, null, {
                params: {
                    q: locationName,
                    target: 'en',  // 번역할 목표 언어
                    source: 'ko',  // 원본 언어
                    key: apiKey,    // Google API Key
                },
            })
                .then(response => {
                    console.log(response.data.data.translations[0].translatedText); // 번역된 텍스트 출력
                    let cityName = response.data.data.translations[0].translatedText;
                    if(cityName === "fly"){setCity("Paris");}
                    else if(cityName === "trade"){setCity("Changsha");}
                    else if(cityName === "danang"){setCity("Danang"); }
                    else if(cityName === "cyanogen"){ setCity("Xi'an"); }
                    else if(cityName === "Dallas Fort Worth"){ setCity("Dallas"); }
                    else if(cityName === "details"){ setCity("Cebu"); }
                    else if(cityName === "New Ulaanbaatar"){ setCity("Ulaanbaatar"); }
                    else if(cityName === "propaganda"){ setCity("Shenzhen"); }
                    else if(cityName === "Phu Quoc"){ setCity("phu khuong"); }
                    else{
                        setCity(cityName);
                    }
                })
                .catch(error => {
                    console.error('구글 번역 API 호출 실패:', error);
                })
        };
        googleTranslate(locationName);
    },[locationName]);
    //////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////국가명 한글 -> 영어 번역////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////
    


    
    //////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////리스트 목록 스타일 부분//////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////
    const listEvent = ()=>{
        const element1 = airPortList.current[0];
        const element2 = airPortList.current[1];
        const element3 = airPortList.current[2];
        const element4 = airPortList.current[3];
        // console.log(element4);
        if(getComputedStyle(element1).width && element1.style.width !== "0%"){
            element1.style.width = "0%";
            element2.classList.add(css.move);
            element2.classList.remove(css.reMove);
            element3.style.width = "70%";
            element4.style.paddingLeft = "50px";
            // element4.style.width = "30%";
            // element3.classList.remove(css.opacity);
        }else{
            element1.style.width = "20%";
            element2.classList.remove(css.move);
            element2.classList.add(css.reMove);
            element3.style.width = "50%";
            element4.style.paddingLeft = "0";
            // element4.style.width = "30%";
            // element3.classList.add(css.opacity);
        } 
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////리스트 목록 스타일 부분//////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////



    //////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////로딩부분//////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////
    useEffect(()=>{ /////////김건우_b_loading 부분 디자인 수정 할 예정.............................
        if(inflight.length !== 0){
            const element =document.getElementById("loading");
            // console.log(element);
            if(element){
                element.remove();
            }
        }else{
            if(document.getElementById("AirportFrame")){
                document.getElementById("AirportFrame").insertAdjacentHTML("beforeend", `<div id="loading" class=${css.loading}><img src=${"/loading/airport.gif"} alt="not Img"></div>`);
            }
        }
            //inflight 추가
    },[inflight, airPortText]);
    //////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////로딩부분//////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////



    //////////////////////////////////////////토글 했을 시 색칠한 부분 초기화////////////////////////////
    let colorChangeNation = ``;
    let colorChangeSearch = ``;
    useEffect(()=>{
        if(searchColor){
            searchColor.children[0].style.background = "none";
            searchColor.style.background = "none";
        }
    },[isToggle]);
    //////////////////////////////////////////토글 했을 시 색칠한 부분 초기화////////////////////////////
    
    

    //////////////////////////////////////////////////선택 시 색상 표시 및 제거 //////////////////////////////////////
    const handleNationChange = useCallback((e) => {
        const elementID = document.getElementById(e.target.selectedOptions[0].dataset.key);
        if(elementID){
            if(colorChangeNation){
                colorChangeNation.children[0].style.background = "none";
                if(colorChangeSearch){
                    colorChangeSearch.style.background = "none";
                }
            }
            const parent = elementID.parentElement;
            parent.scrollTo({behavior:'smooth', top: elementID.offsetTop-400});
            elementID.children[0].style.background="#BFF5C4";
            colorChangeNation = elementID;
            setSearchColor(colorChangeNation);
        }
        airPortInput.current[0].placeholder = ' 편명을 입력해주세요';
        airPortInput.current[0].value = '';
    }, []);

    const handleSearchColor = useCallback((e)=>{
        let value = null;
        if(airPortInput.current[0].value){
            value = airPortInput.current[0].value.toUpperCase();
        }
        const elementID = document.getElementById(value);
        const elementClass = document.querySelector(`[class="${value}"]`);

        if(colorChangeNation){
            colorChangeNation.children[0].style.background = "none";
            setSearchColor(colorChangeNation);
        }
        if(elementID){
            if(colorChangeSearch){
                colorChangeSearch.style.background = "none";
                if(colorChangeNation){
                    colorChangeNation.children[0].style.background = "none";
                }
            }
            const parent = elementID.parentElement;
            parent.scrollTo({behavior:'smooth', top: elementID.offsetTop-400});
            elementID.children[0].style.background="#BFF5C4";
            colorChangeSearch = elementID.children[0];
            setSearchColor(colorChangeSearch);
        }else if(elementClass){
            const parent = elementClass.parentElement;
            parent.scrollTo({behavior:'smooth', top: elementClass.offsetTop-400});
            elementClass.querySelector("p").style.background = "#BFF5C4";
            colorChangeSearch = elementClass.querySelector("p");
            setSearchColor(colorChangeSearch);
        }else{
            airPortInput.current[0].value = ``;
            airPortInput.current[0].placeholder = "다시 입력해주세요";    
        }
    },[]);
    //////////////////////////////////////////////////선택 시 색상 표시 및 제거 //////////////////////////////////////



    ///////////////////////////////print///////////////////////////////////////////
     const handlePrint = () => {

        const airPortElement = airPortList.current[2]; // airPortList.current[2] 참조
        let htmlString = `<table>
    <thead>
        <tr>
            <th>월</th>
            <th>요금</th>
        </tr>
    </thead>
    <tbody>`;

        processedData.forEach(v => {
            const date = new Date(v.date);
            const month = date.toLocaleString("en-US", { month: "short" }); // "Feb" 같은 값 추출

            htmlString += `
        <tr>
            <td>${month}</td>
            <td>${v.price.toLocaleString(undefined)}원</td>
        </tr>`;
        });

        htmlString += `</tbody></table>`;
        const articles = airPortElement.querySelectorAll('article');

        const articlesWithoutLast = Array.from(articles).slice(0, -1);

        let printContent = '<html><head><title>Print</title>';

        const styleSheets = Array.from(document.styleSheets);
        styleSheets.forEach(styleSheet => {
            try {
                const rules = Array.from(styleSheet.cssRules);
                rules.forEach(rule => {
                    printContent += `<style>${rule.cssText}
                    *{overflow: hidden;}
                    article:nth-child(1){ width: 70%; height: 30%; }
                    article{overflow: hidden;}
                    @page {
                        size: A4 landscape; /* 가로 모드 */
                        margin: 0; /* 여백 제거 */
                    }
                    </style>`;
                });

            } catch (e) {
                console.log("스타일을 가져오는 중 오류 발생: ", e);
            }
        });
        printContent += `
        <style>
            
            .${windowsCss.RecentFightsDetailFrame} {
                    width: 100%;
                    height: 80%;
                    list-style-type: none;
                    display: flex;
                    justify-content: space-around;
                    align-items: flex-start;
                    font-size:1.7vw;
                    
                }
    
                .${windowsCss.RecentFightsDetailFrame} li {
                    transition: 0.5s;
                    border-radius: 0 0 20px 20px;
                    overflow: hidden;
                    position: relative;
                    box-shadow: 0 0 5px #cbcfd7;
                    padding-top: 10px;
                    width: 40%;
                    height: 100%;
                    color: #43444d;
                }
                .${windowsCss.RecentFightsDetailFrame} li::after {
                    content: "";
                    width: 100%;
                    position: absolute;
                    border-bottom: 15px solid #97bcd8;
                    bottom: 0;
                            }
                .${windowsCss.RecentFightsDetailFrame} li p{
                    font-size: 17px;
                    margin: 8px 0;
                    padding-left: 15px;
                    width: 90%;
                    font-family : font-family: 'Noto Sans KR', 'Malgun Gothic', 'sans-serif';
                }   
                .${windowsCss.FlightDetailsFrame} h4{
                     font-size: 20px;
                }
                 .${windowsCss.RecentFightsDetailFrame} li{
                    p {
                        font-family : font-family: 'Noto Sans KR', 'Malgun Gothic', 'sans-serif';
                        color: #43444d;
                    }
                    p:nth-child(1) { font-size: 1vw; font-weight: 500; }
                    p:nth-child(2) { font-size: 1.3vw; font-weight: 700; }
                    p:nth-child(3) {  font-family: 'Montserrat'; font-size: 1vw; font-weight: 500; }
                    p:nth-child(4) {  font-family: 'Montserrat'; font-size: 1vw; font-weight: 500; }
                 }
                    .${windowsCss.RecentFightsDetailFrame} li:nth-child(3){
                    p:nth-child(1) { font-size: 1vw; font-weight: 500; }
                    p:nth-child(2) { font-size: 1.5vw; font-weight: 700; color: #e45d72; }
                    
                        
                 }
                table {
                    width: 18%;
                    height: 57%;
                    margin: auto;
                    font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
                    font-size: 18px;
                    border-collapse: collapse;
                    background-color: hsl(0, 0%, 100%);
                    text-align: center;
                    margin-top: 15px;
                    position: absolute;
                    top: 100px;
                    right: 0px;
                    th {
                        background-color: #99cae7;
                        border-bottom: 1px solid white;
                        border-right: 1px solid white;
                        height: 30px;
                        width: 50px;
                        font-size: 14px;
                        color: white;
                        padding: 5px;
                    }

                    td {
                        font-size: 14px;
                        height: 25px;
                        padding: 5px;
                        border: 1px solid #ddd;
                    }

                    tr:nth-child(even) {
                        background-color: #f2f2f2; // 줄마다 다른 색 적용
                    }
                }
            /* 추가적으로 mobileCss에서도 스타일을 가져올 수 있음 */
        </style>
    `;
        printContent += '</head><body>';

        // 제외된 article 요소들을 프린트 내용에 추가
        articlesWithoutLast.forEach((article) => {
            printContent += article.outerHTML;  // article의 HTML을 그대로 삽입
        });
        printContent += htmlString;
        printContent += '</body></html>';

        // 새 창을 열어서 프린트할 HTML을 삽입
        let printWindow = window.open('', '', 'height=500,width=1000');
        printWindow.document.write(printContent);  // 프린트할 HTML 내용 삽입
        printWindow.document.close();  // 문서 닫기
        printWindow.print();  // 프린트 실행
    };



    ///////////////////////////////print///////////////////////////////////////////




    // console.log(latLonVelocityCity);;

    return <div className={css.AircraftInformationFrame}>
        <section className={css.AirPortlistFrame} ref={(ref)=>airPortList.current[0]=ref}>
            <i className={`fa-solid fa-plane ${css.AirPortTotalListIcon}`} onClick={listEvent} ref={(ref)=>airPortList.current[1]=ref}></i>
            <article className={css.AirPortlist}>
                <ul className={css.totalAirDataList} >
                    <div className={css.mobileBackImg} style={{backgroundImage:`url("/airportimg/airport.jpg")`}}></div>
                    <div className={css.ListInputliFrame}>
                        <div className={css.companyTitle} style={{backgroundImage:`url("/airportimg/koreanAir.png")`}}></div>
                        {/* <div className={css.BoardingStatus}>
                            <i className="fa-solid fa-circle" style={{color:"yellow"}}><span>탑승준비</span></i>
                            <i className="fa-solid fa-circle" style={{color:"#09e609"}}><span>탑승중</span></i>
                            <i className="fa-solid fa-circle" style={{color:"#0000A5"}}><span>출발</span></i>
                            <i className="fa-solid fa-circle" style={{color:"#F7630C"}}><span>지연</span></i>
                            <i className="fa-solid fa-circle" style={{color:"red"}}><span>마감</span></i>
                            <i className="fa-solid fa-circle" style={{color:"gray"}}><span>비고</span></i>
                        </div> */}
                        <div className={css.toggleFrame}>
                            <div className={css.toggleContainer} >
                                <input 
                                    type="checkbox" 
                                    id="toggleButton" 
                                    checked={isToggle} 
                                    onChange={() => setIsToggle(!isToggle)} 
                                />
                                <label htmlFor="toggleButton" className={css.toggleLabel}>
                                    <span className={`${css.toggleOption} ${!isToggle ? css.active : ""}`}>all</span>
                                    <span className={`${css.toggleOption} ${isToggle ? css.active : ""}`}>fly</span>
                                    <div className={css.toggleSlider}></div>
                                </label>
                            </div>
                        </div>
                        <i className={`fa-solid fa-caret-up ${css.airPortListUpButton}`} onClick={()=>airPortInput.current[1].scrollTo({top:0,behavior:'smooth'})}></i>
                        <div className={css.totalInputArea}>
                            <div className={css.inputLabelDepartureArrivalArea}>
                                    <p>출발지</p>
                                    <p>도착지</p>
                                </div>
                                <div className={css.inputDepartureArrivalArea}>
                                    <input className={css.inputDeparture} type="text" placeholder="&nbsp;인천"  readOnly />
                                    <p className={css.inputFlyImg} style={{ backgroundImage: `url("/airportimg/fly.png")`}}></p>
                                    <select className={css.inputArrival} onChange={handleNationChange}>
                                        {isToggle? nationOption:nationTotalOption}
                                    </select>
                                </div>
                            <p className={css.or}>OR</p>
                            <p className={css.ListInputSearchFrame}>
                                <label><input className={css.ListInput} type="text" placeholder="&nbsp;편명을 입력해주세요" ref={(ref)=>airPortInput.current[0]=ref}/></label>
                                <i className="fa-solid fa-magnifying-glass" onClick={handleSearchColor}></i>
                            </p>
                        </div>
                    </div>
                    <div className={css.AirliListFrame} ref={(ref)=>airPortInput.current[1]=ref}>
                        {isToggle? inflight: totalAirDataList} 
                    </div>
                </ul>
            </article>
        </section>
        <section className={css.AirPortInformationFrame} ref={(ref)=>airPortList.current[2]=ref}>
            <article className={css.RecentFightsFrame}>
                <ul className={css.RecentFights}>
                    {airPortText} 
                </ul>
            </article>
            <article className={css.FlightDetailsFrame} >
                <div className={css.printIcon} style={{backgroundImage:`url("/airportimg/printIcon.png")`}} onClick={handlePrint}></div> 
                <h4 className={css.PriceTitle}>Price Trend</h4>
                <PriceChart data={processedData} />
            </article>
            <article className={css.AvionicsDataFrame} ref={(ref)=>airPortList.current[3]=ref}>
                {mobile? <h4>Gauge Chart</h4>:''}
                <ul className={css.AvionicsData}>
                    {/* {avionicsList} */}
                    <li key={"avionicsData1"}><GaugeChart value={(latLonVelocityCity.velocity*3.6)} size={size} minValue={0} maxValue={3500} unit={"km/h"} data={"Velocity"}/></li>
                    <li key={"avionicsData2"}><GaugeChart value={(latLonVelocityCity.altitude)} size={size} minValue={0} maxValue={13000} unit={"m"} data={"Altitude"}/></li>
                    <li key={"avionicsData3"}><GaugeChart value={(latLonVelocityCity.lat)} size={size} minValue={-90}  maxValue={90} unit={"°"} data={"Latitude"}/></li>
                    <li key={"avionicsData4"}><GaugeChart value={(latLonVelocityCity.lon)} size={size} minValue={-180} maxValue={180} unit={"°"} data={"Longitude"}/></li>
                </ul>
            </article>
        </section>
        <section className={css.AirPortMapWeatherFrame} >
                <div className={css.MapTotalFrame}>
                    <h4 className={css.MapTitle}>map</h4>
                    <Globe data={{latLonVelocityCity, nationData}} />
                    <article className={css.MapFrame}>

                    </article>
                </div>
                <div className={css.WeatherTotalFrame}>
                <h4 className={css.WeatherTitle}>weather information</h4>
                    <article className={css.WeatherFrame}>
                        <ul className={css.Weather}>
                            {/* {weatherList} */}
                            <li key={"weatherData1"}><Weather city={"Incheon"} /></li>
                            <li key={"weatherData2"} ><Weather city={city} /></li>
                        </ul>
                    </article>
                </div>
        </section>
    </div>
}



export default AircraftInformation;
