import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

// 전역 변수로 데이터 캐싱
let cachedGeoData = null;

const Globe = (props) => {
  const { latLonVelocityCity, nationData } = props.data;
  const { img, nationLat, nationLon } = nationData || {};
  const { lat, lon, ArrivalAirport } = latLonVelocityCity || {};
   
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 컨테이너 크기 측정 함수
  const measureContainer = () => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      // 높이는 너비의 0.75배로 설정 (4:3 비율)
      const height = width * 0.75;
      setDimensions({ width, height });
    }
  };

  // 마커 데이터 메모이제이션
  const locations = useMemo(() => {
    const markers = [];

  // 인천 공항 마커 (항상 표시)
    markers.push({
      name: "인천",
      coords: [126.9780, 37.5665],
      image: "https://flagicons.lipis.dev/flags/4x3/kr.svg"
    });

    // 도착 공항 마커 (nationLon, nationLat, img가 있으면 항상 추가)
    if (nationLon && nationLat && img) {
      markers.push({
        name: ArrivalAirport || "도착 공항",
        coords: [nationLon, nationLat],
        image: img
      });
    }

    // 현재 비행 위치 마커 (lat, lon이 있을 경우 추가)
    if (lat && lon) {
      markers.push({
        name: "현재 위치",
        coords: [lon, lat],
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Delhi_Metro_Line_AE.svg/640px-Delhi_Metro_Line_AE.svg.png"
      });
    }
    return markers;
  }, [ArrivalAirport, nationLon, nationLat, lon, lat, img]);

  // 윈도우 리사이즈 이벤트 처리
  useEffect(() => {
    measureContainer();

    const handleResize = () => {
      measureContainer();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || !locations.length) return;
    
    // 애니메이션 취소 함수
    const cleanup = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      d3.select(svgRef.current).selectAll("*").remove();
    };
    
    // 이전 애니메이션 정리
    cleanup();
    
    // 투영법 설정 (Orthographic: 구 형태)
    const projection = d3.geoOrthographic()
      .scale(dimensions.width * 0.35) // 컨테이너 크기에 비례하여 스케일 조정
      .translate([dimensions.width / 2, dimensions.height / 2])
      .rotate([-(nationLon || lon || 0), -15]);

    const path = d3.geoPath(projection);

    // SVG 설정
    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .style("background", "rgb(255, 255, 255, 0)");

    // 색상 스케일 
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, 200]);

    // 마커 위치 및 이미지 업데이트 함수 - 최적화 버전
    function updateMarkers() {
      // 가시성 체크 (지구본 뒤쪽에 있는 마커는 표시하지 않음)
      const visibleLocations = locations.filter(d => ({
        ...d,
        projectedCoords:projection(d.coords)
      })).filter(d=>d.projectedCoords !== null);
      
      // 이미지 업데이트 - enter/update/exit 패턴 사용
      const images = svg.selectAll("image.marker")
        .data(visibleLocations, d => d.name); // key 함수 추가
        
      // 업데이트: 기존 요소 위치만 변경
      images
        .attr("x", d => projection(d.coords)[0] - (dimensions.width * 0.02))
        .attr("y", d => projection(d.coords)[1] - (dimensions.width * 0.02));
      
      // 추가: 새 요소 생성
      images.enter()
        .append("image")
        .attr("class", "marker")
        .attr("width", dimensions.width * 0.04)
        .attr("height", dimensions.width * 0.04)
        .attr("href", d => d.image)
        .attr("x", d => projection(d.coords)[0] - (dimensions.width * 0.02))
        .attr("y", d => projection(d.coords)[1] - (dimensions.width * 0.02))
        .style("opacity", 0)
        .transition()
        .duration(300)
        .style("opacity", 1);
      
      // 제거: 필요없는 요소 페이드아웃
      images.exit()
        .transition()
        .duration(300)
        .style("opacity", 0)
        .remove();

      // 라벨 업데이트 최적화
      const labels = svg.selectAll("text.label")
        .data(visibleLocations, d => d.name);
        
      // 업데이트: 기존 라벨 위치만 변경
      labels
    .attr("x", d => projection(d.coords)[0] + (dimensions.width * 0.03))
  .attr("y", d => projection(d.coords)[1] + (dimensions.width * 0.01));
        
      // 추가: 새 라벨 추가
      labels.enter()
        .append("text")
        .attr("class", "label")
        .attr("fill", "#5D5D5D")
        .style("font-size", `${dimensions.width * 0.025}px`)
        .attr("x", d => projection(d.coords)[0] + (dimensions.width * 0.01))
        .attr("y", d => projection(d.coords)[1])
        .text(d => d.name)
        .style("opacity", 0)
        .transition()
        .duration(300)
        .style("opacity", 1);
        
      // 제거: 필요없는 라벨 페이드아웃
      labels.exit()
        .transition()
        .duration(300)
        .style("opacity", 0)
        .remove();
    }

    // 드래그 기능 - 성능 개선
    let lastEvent = null;
    const drag = d3.drag()
      .on("start", () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      })
      .on("drag", (event) => {
        lastEvent = event;
        requestAnimationFrame(() => {
          if (!lastEvent) return;
          const rotate = projection.rotate();
          projection.rotate([
            rotate[0] + lastEvent.dx * 0.25,
            rotate[1] - lastEvent.dy * 0.25
          ]);
          svg.selectAll("path.country, path.graticule").attr("d", path);
          updateMarkers();
          lastEvent = null;
        });
      })
      .on("end", () => {
        if (!animationRef.current) {
          animateGlobe();
        }
      });

    // requestAnimationFrame을 사용한 애니메이션 함수
    function animateGlobe() {
      const rotate = projection.rotate();
      const autoRotationSpeed = latLonVelocityCity ? 0.2 : 0.1; 
      projection.rotate([rotate[0] + autoRotationSpeed, rotate[1]]);
      
      // 필요한 요소만 업데이트
      svg.selectAll("path.country, path.graticule").attr("d", path);
      updateMarkers();
      
      animationRef.current = requestAnimationFrame(animateGlobe);
    }

    // 지구본 렌더링 함수
    function renderGlobe(data) {
      const countries = topojson.feature(data, data.objects.countries).features;

      // 국가 그리기
      svg.append("g")
        .selectAll("path.country")
        .data(countries)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("fill", d => colorScale(d.id % 100))
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .attr("d", path);

      // 그리드 추가 - 한 번만 생성
      const graticule = d3.geoGraticule();
      svg.append("g")
        .selectAll("path.graticule")
        .data(graticule.lines())
        .enter()
        .append("path")
        .attr("class", "graticule")
        .attr("fill", "none")
        .attr("stroke", "#474747")
        .attr("stroke-width", dimensions.width * 0.0002)
        .attr("d", path);

      // 초기 마커 설정
      updateMarkers();

      // 드래그 기능 활성화
      svg.call(drag);

      // 애니메이션 시작
      animateGlobe();
    }

    // 지구본 데이터 로드 및 그리기 (캐싱 활용)
    if (cachedGeoData) {
      renderGlobe(cachedGeoData);
    } else {
      d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(data => {
          cachedGeoData = data;
          renderGlobe(data);
        });
    }

    // 컴포넌트 언마운트 시 정리
    return cleanup;
  }, [dimensions, locations]);

  return (
    <div style={{ width: '90%', margin: '0 auto' }}>
      <div ref={containerRef} style={{ width: '100%' }}>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default Globe;