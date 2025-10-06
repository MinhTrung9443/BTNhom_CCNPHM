// src/components/shared/goong-location-picker.tsx
"use client";

import React, { useEffect, useRef, useCallback } from 'react';

// Định nghĩa kiểu dữ liệu cho props
interface GoongLocationPickerProps {
  onLocationChange: (locationData: any) => void;
}

// Định nghĩa kiểu cho các đối tượng trên window
declare global {
  interface Window {
    goongjs: any;
    GoongGeocoder: any;
  }
}

// Hàm tải script và stylesheet động
const loadScript = (src: string, onLoad: () => void) => {
  if (document.querySelector(`script[src="${src}"]`)) {
    onLoad();
    return;
  }
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.onload = onLoad;
  document.body.appendChild(script);
};

const loadStylesheet = (href: string) => {
  if (document.querySelector(`link[href="${href}"]`)) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};

const GOONG_MAPS_KEY = process.env.NEXT_PUBLIC_GOONG_MAPS_KEY || '';
const GOONG_API_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY || '';

const GoongLocationPicker = ({ onLocationChange }: GoongLocationPickerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const handleLocationUpdate = useCallback((data: any) => {
    onLocationChange(data);
  }, [onLocationChange]);

  useEffect(() => {
    loadStylesheet('https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css');
    loadStylesheet('https://cdn.jsdelivr.net/npm/@goongmaps/goong-geocoder@1.1.1/dist/goong-geocoder.css');

    const initializeMap = () => {
      if (!window.goongjs || !window.GoongGeocoder || mapRef.current || !mapContainerRef.current) return;

      window.goongjs.accessToken = GOONG_MAPS_KEY;

      const map = new window.goongjs.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [105.834160, 9.559373], // Default to Sóc Trăng
        zoom: 13,
      });

      mapRef.current = map;

      const marker = new window.goongjs.Marker({ color: 'red', draggable: true });

      const geocoder = new window.GoongGeocoder({
        accessToken: GOONG_API_KEY,
        goongjs: window.goongjs,
        marker: false,
      });

      if (geocoderContainerRef.current) {
        geocoderContainerRef.current.innerHTML = ''; // Clear previous geocoder
        geocoderContainerRef.current.appendChild(geocoder.onAdd(map));
      }

      const reverseGeocode = async (lat: number, lng: number) => {
        const url = `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          const item = data?.results?.[0];
          if (item) {
            handleLocationUpdate({
              lat,
              lng,
              address: item.formatted_address,
              ...item.compound,
            });
          }
        } catch (e) {
          console.warn('Reverse geocode failed:', e);
        }
      };

      geocoder.on('result', (e: any) => {
        const payload = e?.result?.result || {};
        const loc = payload.geometry?.location || {};
        if (loc.lat && loc.lng) {
          marker.setLngLat([loc.lng, loc.lat]).addTo(map);
          map.flyTo({ center: [loc.lng, loc.lat], zoom: 15 });
          reverseGeocode(loc.lat, loc.lng); // Luôn gọi reverse geocode để đảm bảo dữ liệu đầy đủ
        }
      });

      map.on('click', (e: any) => {
        const { lng, lat } = e.lngLat;
        marker.setLngLat([lng, lat]).addTo(map);
        map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 15) });
        reverseGeocode(lat, lng);
      });

      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat();
        reverseGeocode(lat, lng);
      });

      map.on('load', () => map.resize());

      const resizeObserver = new ResizeObserver(() => map.resize());
      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
        map.remove();
      };
    };

    // Tải script theo đúng thứ tự để tránh lỗi
    loadScript('https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js', () => {
      loadScript('https://cdn.jsdelivr.net/npm/@goongmaps/goong-geocoder@1.1.1/dist/goong-geocoder.min.js', initializeMap);
    });
  }, [handleLocationUpdate]);

  return (
    <div className="space-y-4 w-full">
      <div id="geocoder-container" ref={geocoderContainerRef} className="relative z-10"></div>
      <div
        ref={mapContainerRef}
        className="w-full h-64 md:h-80 rounded-lg shadow-inner"
        style={{ overflow: 'hidden' }}
      ></div>
      <p className="text-sm text-muted-foreground">
        Gợi ý: nếu kết quả tìm kiếm chưa chính xác, hãy <b>click lên bản đồ</b> hoặc <b>kéo thả marker</b> đến vị trí đúng.
      </p>
    </div>
  );
};

export default GoongLocationPicker;
