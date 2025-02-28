import React, { useContext, useEffect, useRef } from "react";
import { IsmobileContext } from "../IsmobileContext/IsmobileContext";
import * as d3 from "d3";

const Gauge1Chart = ({ value, size, minValue, maxValue, unit, data }) => {
    const mobile = useContext(IsmobileContext);
    const svgRef = useRef();
    let colors = ["#caf0f8", "#90e0ef", "#00b4d8"];
    if (data === "Velocity" || data === "Altitude") {
        colors = ["#caf0f8", "#90e0ef", "#00b4d8"];
    } else {
        colors = ["#fae0e4", "#f9bec7", "#ff99ac"];
    }


    useEffect(() => {
        const width = !mobile ? window.innerWidth / 15 : window.innerWidth / 14;
        const height = !mobile ? window.innerHeight / 9 : window.innerHeight / 3.6;
        const radius = !mobile ? width * 0.65 : width * 1.7;

        const svg = d3
            .select(svgRef.current)
            .attr("width", "100%")
            .attr("height", "100%");

        const gaugeGroup = svg
            .append("g")
            .attr("transform", `translate(${width / 2 + (mobile ? width * 2.7 : width * 0.3)},${(mobile ? width * 3.5 : height *1.3)} )`); // g 그룹에만 transform 적용

        // 반원형 아크 생성
        const arc = d3.arc()
            .innerRadius(radius - 20)
            .outerRadius(radius)
            .startAngle(d => d.startAngle)
            .endAngle(d => d.endAngle);

        // 데이터 범위 구간
        const sections = [
            { startAngle: -Math.PI / 2, endAngle: -Math.PI / 6, color: colors[0] },
            { startAngle: -Math.PI / 6, endAngle: Math.PI / 6, color: colors[1] },
            { startAngle: Math.PI / 6, endAngle: Math.PI / 2, color: colors[2] }
        ];

        // 아크 그리기
        gaugeGroup.selectAll("path")
            .data(sections)
            .enter().append("path")
            .attr("d", arc)
            .attr("fill", d => d.color);


        // 바늘 위치 계산
        const angleScale = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range([-Math.PI / 2, Math.PI / 2]);
        const needleLength = radius - 10;

        // 바늘 업데이트 함수
        const updateNeedle = (newValue) => {
            let middleValue = 0; 
            let fixedNum = 0;
            if(data === "Latitude"){
                middleValue = 90;
                fixedNum = 4;
            }else if(data === "Longitude"){
                middleValue = 180;
                fixedNum = 4;
            }else{
                middleValue = (minValue+maxValue)/2;
                if(data === "Velocity"){fixedNum = 2;}
                if(data === "Altitude"){fixedNum = 1;}
            }
           
            let calcValue = 0;
            let needleAngle = 0;
            let needleX = 0;
            let needleY = 0;
            if(isNaN(newValue) || newValue === undefined){
                newValue = 0;
                calcValue= 0;
                needleAngle= 0;
                needleX = 0;
                needleY  = 0;
                // calcValue = newValue - middleValue + Math.random()*(maxValue-minValue)/100;
                // needleAngle = angleScale(calcValue);
                // needleX = needleLength * Math.cos(needleAngle);
                // needleY = needleLength * Math.sin(needleAngle);
            }else{
                // newValue = 0;
                calcValue = newValue - middleValue + Math.random()*(maxValue-minValue)/100;
                needleAngle = angleScale(calcValue);
                needleX = needleLength * Math.cos(needleAngle);
                needleY = needleLength * Math.sin(needleAngle);
            }

            // 기존 바늘 삭제
            gaugeGroup.selectAll("line").remove();
            gaugeGroup.selectAll("text").remove();

            // 새로운 바늘 그리기
            gaugeGroup.append("line")
                .attr("x1", needleX)
                .attr("y1", needleY)
                .attr("stroke", "rgba(255,255,255,0.9)")
                .attr("stroke-width", 4)
                .transition()  // 부드러운 애니메이션 추가
                .duration(1000)  // 애니메이션 시간 (3초)
                .ease(d3.easeCubic); // 부드러운 애니메이션을 위한 ease 설정


            // 바늘 중심 원 추가
            gaugeGroup.selectAll("circle")
                .data([newValue])
                .enter().append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 5)
                .attr("fill", "black")
            // 눈금값 추가
            gaugeGroup.append("text")
                .attr("x", -radius+8) // 위치 조정
                .attr("y", 15)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .attr("font-family", "Montserrat")
                .text(minValue);

            gaugeGroup.append("text")
                .attr("x", 0)
                .attr("y", -radius - 40)
                .attr("text-anchor", "middle")
                .style("font-size", mobile?"13px":"13px")
                .attr("font-family", "Montserrat")
                .text(data);

            gaugeGroup.append('line')
                .attr("x1", -30)
                .attr("y1", -radius-30)
                .attr("x2", 30)
                .attr("y2", -radius-30)
                .attr("stroke","#88ae6f")

            gaugeGroup.append("text")
                .attr("x", radius - 10) // 위치 조정
                .attr("y", 15)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .attr("font-family", "Montserrat")
                .text(maxValue.toLocaleString(undefined, {maximumFractionDigits: fixedNum}));

            gaugeGroup.append("text")
                .attr("x", 0)
                .attr("y", -radius - 10)
                .attr("text-anchor", "middle")
                .style("font-size", mobile?"15px":"13px")
                .text(newValue = newValue? (newValue+ Math.random()*(maxValue-minValue)/100).toLocaleString(undefined, {minimumFractionDigits: fixedNum, maximumFractionDigits: fixedNum}) + unit:"0")
                .attr("font-family", "Montserrat")
                .style("font-weight", "bold");

        };

        // 애니메이션을 위한 함수
        const animateNeedle = () => {

            updateNeedle(value);

            setTimeout(animateNeedle, 1500); 
        };

        // 애니메이션 시작
        animateNeedle();

        return () => {
            svg.selectAll("*").remove();
        };

    }, [value, size, unit, data, colors, mobile, minValue, maxValue]);

    return <svg ref={svgRef}></svg>;
};

export default Gauge1Chart;



