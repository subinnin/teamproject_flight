import React, { useEffect, useState, useRef } from 'react'; 
import * as d3 from 'd3';
import '../sass/ParkingChart.css';

const ParkingChart = () => {
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0, barHeight: 0 });
  const chartContainerRef = useRef(null);
  const svgRef = useRef(null);
  const dataFirstTerminal = [
    { time: "00시", value: 4 }, { time: "02시", value: 3 },
    { time: "04시", value: 41 }, { time: "06시", value: 90 },
    { time: "08시", value: 89 }, { time: "10시", value: 71 },
    { time: "12시", value: 60 }, { time: "14시", value: 47 },
    { time: "16시", value: 62 }, { time: "18시", value: 61 },
    { time: "20시", value: 22 }, { time: "22시", value: 14 }
  ];
  
  const dataSecondTerminal = [
    { time: "00시", value: 0 }, { time: "02시", value: 0 },
    { time: "04시", value: 22 }, { time: "06시", value: 74 },
    { time: "08시", value: 51 }, { time: "10시", value: 27 },
    { time: "12시", value: 26 }, { time: "14시", value: 34 },
    { time: "16시", value: 50 }, { time: "18시", value: 33 },
    { time: "20시", value: 12 }, { time: "22시", value: 1 }
  ];
  

  const [selectedTerminal, setSelectedTerminal] = useState('first');

  const [currentData, setCurrentData] = useState(dataFirstTerminal);


  const selectTerminal = (terminal) => {
    if (terminal === 'first') {
      setSelectedTerminal('first');
      setCurrentData(dataFirstTerminal);
    } else {
      setSelectedTerminal('second');
      setCurrentData(dataSecondTerminal);
    }
  };

  function formatTimeText(time) {
    const hour = parseInt(time);
    if (hour < 12) return `오늘 오전 ${time}`;
    if (hour === 12) return `오늘 오후 ${time}`;
    return `오늘 오후 ${hour - 12}시`;
  }


  function getColor(value) {
    if (value >= 75) return "#657b91"; 
    if (value >= 50) return "#909cbc"; 
    if (value >= 25) return "#99afc7"; 
    return "#afcdd8"; 
  }


  const hideTooltip = () => {
    d3.selectAll(".bar")
      .transition()
      .duration(200)
      .attr("opacity", 1)
      .attr("stroke", "none");
    

    d3.select(".guideline-group")
      .style("display", "none");
    
    setTooltip({ visible: false, text: '', x: 0, y: 0, barHeight: 0 });
  };

  const renderChart = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 15, right: 20, bottom: 30, left: 20 };
    const width = chartContainerRef.current.offsetWidth;
    const height = chartContainerRef.current.offsetHeight;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleBand()
      .range([0, chartWidth])
      .domain(currentData.map(d => d.time))
      .padding(0.15);

    const yScale = d3.scaleLinear()
      .range([chartHeight, 0])
      .domain([0, 100]);

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);


    g.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("path.domain")
      .attr("stroke", "none");
    

    g.selectAll(".tick text")
      .attr("font-size", "12px")
      .attr("font-family", "Arial, sans-serif")
      .attr("fill", "#555");

    const guidelineGroup = svg.append("g")
      .attr("class", "guideline-group")
      .style("display", "none");
    
    guidelineGroup.append("line")
      .attr("class", "guideline")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");


    g.selectAll(".value-label")
      .data(currentData)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", d => xScale(d.time) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.value) - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "9px")
      .attr("font-weight", "bold")
      .attr("fill", "#555")
      .text(d => `${d.value}%`);


    g.selectAll(".bar")
      .data(currentData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.time))
      .attr("width", xScale.bandwidth())
      .attr("y", chartHeight)
      .attr("height", 0)
      .attr("rx", 5) 
      .attr("ry", 5)
      .attr("fill", d => getColor(d.value))
      .on("mouseover", function (event, d) {

        const svgRect = svgRef.current.getBoundingClientRect();
        const xPosition = svgRect.left + margin.left + xScale(d.time) + xScale.bandwidth() / 2;
        const yPosition = svgRect.top + margin.top; 
        const barHeight = chartHeight - yScale(d.value);
        const barY = yScale(d.value);
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.6)
          .attr("stroke", "#333")
          .attr("stroke-width", 1);


        const guidelineGroup = d3.select(".guideline-group")
          .style("display", "block");
        
        guidelineGroup.select(".guideline")
          .attr("x1", margin.left + xScale(d.time) + xScale.bandwidth() / 2)
          .attr("y1", margin.top)
          .attr("x2", margin.left + xScale(d.time) + xScale.bandwidth() / 2)
          .attr("y2", margin.top + barY);

        setTooltip({
          visible: true,
          text: `${formatTimeText(d.time)}`,
          x: xPosition,
          y: yPosition,
          barHeight: barHeight
        });
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke", "none");
        

        d3.select(".guideline-group")
          .style("display", "none");
        
        setTooltip({ ...tooltip, visible: false });
      })

      .on("click", function() {
        hideTooltip();
      })

      .on("touchstart", function(event, d) {

        const svgRect = svgRef.current.getBoundingClientRect();
        const xPosition = svgRect.left + margin.left + xScale(d.time) + xScale.bandwidth() / 2;
        const yPosition = svgRect.top + margin.top;
        const barHeight = chartHeight - yScale(d.value);
        const barY = yScale(d.value);
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.6)
          .attr("stroke", "#333")
          .attr("stroke-width", 1);

        const guidelineGroup = d3.select(".guideline-group")
          .style("display", "block");
        
        guidelineGroup.select(".guideline")
          .attr("x1", margin.left + xScale(d.time) + xScale.bandwidth() / 2)
          .attr("y1", margin.top)
          .attr("x2", margin.left + xScale(d.time) + xScale.bandwidth() / 2)
          .attr("y2", margin.top + barY);

        setTooltip({
          visible: true,
          text: `${formatTimeText(d.time)}`,
          x: xPosition,
          y: yPosition,
          barHeight: barHeight
        });
      })
      .on("touchend", function() {

        hideTooltip();
      })
      .transition()
      .duration(800)
      .attr("y", d => yScale(d.value))
      .attr("height", d => chartHeight - yScale(d.value));
  };

  useEffect(() => {
    renderChart();
    

    const handleResize = () => {
      renderChart();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentData]);

  return (
    <div className="chart-outer-container">
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

      <div ref={chartContainerRef} className="chart-container">
        <svg ref={svgRef} id="chart" width="100%" height="100%"></svg>
      </div>

      {tooltip.visible && (
        <div 
          className="tooltip" 
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y-25}px`,
            position: 'fixed',
            transform: 'translate(-50%, 0)',
            padding: '6px 8px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: 'rgba(33, 33, 33, 0.8)',
            color: '#fff',
            borderRadius: '6px',
            textAlign: 'center',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000
          }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default ParkingChart;