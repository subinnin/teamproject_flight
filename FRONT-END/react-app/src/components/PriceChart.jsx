import React, { useEffect, useRef, useState, useContext } from 'react';
import { IsmobileContext } from "../IsmobileContext/IsmobileContext";
import * as d3 from 'd3';

const PriceChart = ({ data }) => {
  const chartRef = useRef(null);
  const mobile = useContext(IsmobileContext);
  const [chartWidth, setChartWidth] = useState(1250);
  const [chartHeight, setChartHeight] = useState(800);

  useEffect(() => {
    if (!chartRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setChartWidth(width);
      setChartHeight(height);
    });

    resizeObserver.observe(chartRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!data || !chartRef.current || !data.length) return;

    // 기존 차트 제거
    d3.select(chartRef.current).selectAll('*').remove();

    // 차트 기본 설정
    const margin = { top: 20, right: 50, bottom: 50, left: 100 };
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 스케일 설정
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);

    const minPrice = d3.min(data, d => d.price) * 0.600;
    const maxPrice = d3.max(data, d => d.price) * 1.080;
    const y = d3.scaleLinear()
      .domain([minPrice, maxPrice])
      .range([height, 0]);

    // 라인 생성기 설정
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.price))
      .curve(d3.curveMonotoneX);

    // 그리드 설정
    svg.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(y.ticks(6))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#9AC7E1')
      .attr('stroke-width', 1);

    // X축 설정
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('class', 'x-axis')
      .call(d3.axisBottom(x)
        .ticks(data.length)
        .tickFormat(d => {
          const format = d3.timeFormat('\n%b');
          return format(d);
        }))
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '50px')
      .style('color', '#999')
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())
      .call(g => g.selectAll('.tick text')
        .style('fill', '#999')
        .attr('dy', '1em'));

    // Y축 설정
    svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y)
        .ticks(6)
        .tickSize(-width))
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '18px')
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke', '#f1f1f1')
        .attr('stroke-width', 1))
      .call(g => g.selectAll('.tick text')
        .attr('x', -30)
        .style('fill', '#999'));

    // 메인 라인 애니메이션 설정
    const path = svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', 'rgb(135, 165, 190)')
      .attr('stroke-width', 3)
      .attr('d', line);

    // 라인 애니메이션
    const pathLength = path.node().getTotalLength();
    path
      .attr('stroke-dasharray', pathLength)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // 막대 그래프 애니메이션
    svg.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.date) - (mobile?10:20))
      .attr('y', height) // 시작 위치를 아래로 설정
      .attr('width', mobile? 15:40)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('height', 0) // 초기 높이를 0으로 설정
      .attr('fill', 'url(#barGradient)')
      .style('filter', 'drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.2))')
      .transition() // 애니메이션 시작
      .duration(1500)
      .delay((d, i) => i * 50) // 각 막대마다 약간의 딜레이를 줌
      .attr('y', d => y(d.price))
      .attr('height', d => height - y(d.price));

    // 그라데이션 설정
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'barGradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgb(237, 240, 241, 0.1)');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgb(189, 197, 212, 0.4)');

    // 호버 효과 설정
    const focus = svg.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    focus.append('circle')
      .attr('r', 7)
      .attr('fill', 'orange')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);
        if (data && data.length > 0) {
        focus.attr('transform', `translate(${x(data[0].date)},${y(data[0].price)})`);
      }
    focus.append('rect')
      .attr('class', 'tooltip-bg')
      .attr('fill', 'white')
      .attr('rx', 4)
      .attr('ry', 4)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');

    const tooltipText = focus.append('text')
      .attr('class', 'tooltip-text')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '13px')
      .style('fill', '#666');

    // svg.append('text')
    //   .attr('x', 5)
    //   .attr('y', -5)
    //   .style('font-family', 'Inter, sans-serif')
    //   .style('font-size', '18px')
    //   .style('font-weight', '500')
    //   .style('padding-left','100px')
    //   .style('fill', '#666')
    //   .text('');

    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', function(event) {
  focus.style('display', null);
  // Immediately call mousemove to set initial position
  mousemove(event);
})
      .on('mouseout', () => focus.style('display', 'none'))
      .on('mousemove', mousemove);

    function mousemove(event) {
      // Guard clause to ensure data exists
      if (!data || !data.length) return;

      const bisect = d3.bisector(d => d.date).left;
      const x0 = x.invert(d3.pointer(event)[0]);
      
      // Make sure we don't exceed array bounds
      const i = Math.min(data.length - 1, bisect(data, x0, 1));
      
      // Guard against invalid indices
      if (i <= 0 || i >= data.length) {
        const d = i <= 0 ? data[0] : data[data.length - 1];
        updateTooltip(d);
        return;
      }
      
      const d0 = data[i - 1];
      const d1 = data[i];
      
      // Ensure both data points exist before comparing
      if (!d0 || !d1) {
        // Use whatever valid data point we have
        const d = d0 || d1 || data[0];
        updateTooltip(d);
        return;
      }
      
      // Choose the closest data point
      const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      updateTooltip(d);
    }
    
    function updateTooltip(d) {
      // Position the focus circle
      focus.attr('transform', `translate(${x(d.date)},${y(d.price)})`);

      // Update tooltip text
      const tooltipContent = `${d3.timeFormat('%b')(d.date)} - ₩${d.price.toLocaleString()}`;
      tooltipText.text(tooltipContent);

      // Position the tooltip based on text size
      const textBBox = tooltipText.node().getBBox();
      focus.select('.tooltip-bg')
        .attr('x', textBBox.x - 6)
        .attr('y', textBBox.y - 4)
        .attr('width', textBBox.width + 12)
        .attr('height', textBBox.height + 8);

      // Adjust tooltip position based on chart edge proximity
      const xPos = x(d.date);
      tooltipText.attr('transform', `translate(${xPos > width / 2 ? -100 : 10}, -20)`);
      focus.select('.tooltip-bg').attr('transform', `translate(${xPos > width / 2 ? -100 : 10}, -20)`);
    }

  }, [data, chartWidth, chartHeight]);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        // padding: '20px',
      }}
    />
  );
};

export default PriceChart;