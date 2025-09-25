import { useState, useEffect } from 'react';
import addressData from '../data/tree.json';

/**
 * Custom hook for managing address data from tree.json
 * @returns {object} Address data and helper functions
 */
export const useAddressData = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    // Transform data: rename communes to wards
    const transformedData = addressData.map(province => ({
      ...province,
      districts: province.districts.map(district => ({
        ...district,
        wards: district.communes || [] // Rename communes to wards
      }))
    }));
    
    setProvinces(transformedData);
  }, []);

  /**
   * Get districts for a specific province
   * @param {string} provinceName - Name of the province
   * @returns {array} Array of districts
   */
  const getDistrictsByProvince = (provinceName) => {
    const province = provinces.find(p => p.name === provinceName);
    return province ? province.districts : [];
  };

  /**
   * Get wards for a specific district
   * @param {string} provinceName - Name of the province
   * @param {string} districtName - Name of the district
   * @returns {array} Array of wards
   */
  const getWardsByDistrict = (provinceName, districtName) => {
    const province = provinces.find(p => p.name === provinceName);
    if (!province) return [];
    
    const district = province.districts.find(d => d.name === districtName);
    return district ? district.wards : [];
  };

  /**
   * Search provinces by name
   * @param {string} searchTerm - Search term
   * @returns {array} Filtered provinces
   */
  const searchProvinces = (searchTerm) => {
    if (!searchTerm) return provinces;
    return provinces.filter(province => 
      province.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  /**
   * Search districts by name within a province
   * @param {string} provinceName - Province name
   * @param {string} searchTerm - Search term
   * @returns {array} Filtered districts
   */
  const searchDistricts = (provinceName, searchTerm) => {
    const districts = getDistrictsByProvince(provinceName);
    if (!searchTerm) return districts;
    return districts.filter(district => 
      district.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  /**
   * Search wards by name within a district
   * @param {string} provinceName - Province name
   * @param {string} districtName - District name
   * @param {string} searchTerm - Search term
   * @returns {array} Filtered wards
   */
  const searchWards = (provinceName, districtName, searchTerm) => {
    const wards = getWardsByDistrict(provinceName, districtName);
    if (!searchTerm) return wards;
    return wards.filter(ward => 
      ward.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return {
    provinces,
    districts,
    wards,
    getDistrictsByProvince,
    getWardsByDistrict,
    searchProvinces,
    searchDistricts,
    searchWards
  };
};

export default useAddressData;