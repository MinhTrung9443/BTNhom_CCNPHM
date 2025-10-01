"use client";

import { useState, useEffect, useCallback } from 'react';

interface District {
  name: string;
  communes: string[];
}

interface Province {
  name: string;
  districts: District[];
}

export function useAddress() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/tree.json')
      .then(response => response.json())
      .then(data => {
        setProvinces(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch address data:", error);
        setLoading(false);
      });
  }, []);

  const getDistricts = useCallback((provinceName: string): District[] => {
    if (!provinces.length) return [];
    const province = provinces.find(p => p.name === provinceName);
    return province ? province.districts : [];
  }, [provinces]);

  const getWards = useCallback((provinceName: string, districtName: string): string[] => {
    if (!provinces.length || !provinceName || !districtName) return [];
    const province = provinces.find(p => p.name === provinceName);
    if (!province) return [];
    const district = province.districts.find(d => d.name === districtName);
    return district ? district.communes : [];
  }, [provinces]);

  return { provinces, loading, getDistricts, getWards };
}