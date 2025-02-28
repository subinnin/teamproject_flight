const writeJson = () =>{
    const fs = require("fs").promises;
    const axios = require("axios");
    const airportKey = require("../key/opensky");
    const path = require("../modules/pathModule")("/assets/jsons/airportPath.json");
    const dataWrite = async () =>{
        try {
            const res = await axios.get("https://opensky-network.org/api/states/all",{
            headers: {
                "Authorization": `Basic ${airportKey}`
            }
            })
            const koreanAirFlights = res.data.states.filter((flight) => 
            flight[1]?.trim().startsWith("KAL") && // 대한항공(KAL) 필터
            flight[2]?.trim().endsWith("Korea") && // 출발 국가가 한국인 항공기만
            flight[5] !== null && flight[6] !== null // 위치 데이터가 존재하는 경우만
            );
            const airPortData = koreanAirFlights.map((flight)=>{
                flight[1] = flight[1].trim().replace(/^KAL/g,"KE");
                return flight;
            }); // 출발하는 대한항공 항공기 정보 출력
            const airport = airPortData.map((item,i)=>{
            return {id: i+1,
                code: item[0], // "71c011"
                flightNumber: item[1], // "KE901"
                country: item[2], // "Republic of Korea"
                timestamp: item[3], // 1740066730
                longitude: item[5], // 46.6786 경도
                latitude: item[6], // 20.7315 위도
                altitude: item[7], // 10972.8 고도
                velocity: item[9], // 212.58
                heading: item[11], // 296.44
                verticalRate: item[12] // 0
            }});
            const jsonAirPortData = {"id":"0603","airportList":airport};
            const jsonData = JSON.stringify(jsonAirPortData, null, 2);
            const postSaveData = async (filePath) =>{
                try {
                    await fetch(filePath,{
                        method:"POST",
                        headers:{"Content-Type":"application/json"},
                        body:jsonData
                    });
                    console.log(`JSON ARRAY POST SUCESS`);
                }catch(err){
                    console.log(`ERROR OPENSKY POST ERROR:${err}`);
                }
            }
            const saveData = async (filePath,id) =>{
                try {
                    // await fs.writeFile(filePath,jsonData,"utf-8");
                    await fetch(filePath,{
                        method:"PUT",
                        headers:{"Content-Type":"application/json"},
                        body:jsonData
                    });
                    console.log(`SUCESS: OPENSKY DATA WRITE`);
                }catch(err){
                    console.log("ERROR OPENSKY WRITE FILE");
                }
            }
            const fileCheck = async (path) =>{
                try{
                    const fileData = await fs.readFile(path,"utf-8");
                    if(JSON.parse(fileData).airport.length === 0){
                        postSaveData("http://localhost:25039/airport");
                        // http://kkms4001.iptime.org:25039/airport
                    }else{
                        saveData("http://localhost:25039/airport/0603");
                        //http://kkms4001.iptime.org:25039/airport/0603
                    }
                }catch(err){
                    console.log(`OPENSKY FILE DATA READ ERROR:${err}`);
                }
            }

            fileCheck(path);
        }catch(err){
            console.log(`OPENSKY GET DATA ERROR:${err}`);
        }
        setTimeout(dataWrite,2*60*1000);
    }
    dataWrite();
}

module.exports = writeJson;