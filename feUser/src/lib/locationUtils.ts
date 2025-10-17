// @ts-ignore
import { findBestMatch } from 'string-similarity';

// src/lib/locationUtils.ts
import locationTree from '@/../public/tree.json';
// Định nghĩa kiểu dữ liệu cho cây địa chỉ
interface District {
  name: string;
  communes: string[]; // Trong tree.json, communes là mảng string
}

interface Province {
  name: string;
  districts: District[];
}

const locationData: {
  provinces: { original: string; normalized: string }[];
  districts: { [key: string]: { original: string; normalized: string }[] };
  communes: { [key: string]: { original: string; normalized: string }[] };
} = {
  provinces: [],
  districts: {},
  communes: {},
};

const PREFIXES = /^(thanh pho|tp|tinh|quan|q|huyen|thi xa|tx|phuong|xa|thi tran|tt)\.?\s*/i;

// Hàm chuẩn hóa tên để so sánh
function normalizeForComparison(s: string): string {
  if (!s || typeof s !== 'string') return '';
  let x = s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
  
  x = x.replace(PREFIXES, '').trim();
  
  if (/^\d+$/.test(x)) {
    x = String(parseInt(x, 10));
  }
  
  return x.replace(/\s+/g, '');
}

// Xử lý dữ liệu từ tree.json một lần
(locationTree as Province[]).forEach(province => {
  const provinceName = province.name;
  locationData.provinces.push({
    original: provinceName,
    normalized: normalizeForComparison(provinceName)
  });

  const districtList: { original: string; normalized: string }[] = [];
  locationData.districts[provinceName] = districtList;

  (province.districts || []).forEach(district => {
    const districtName = district.name;
    districtList.push({
      original: districtName,
      normalized: normalizeForComparison(districtName)
    });

    const communeList: { original: string; normalized: string }[] = [];
    locationData.communes[`${provinceName}_${districtName}`] = communeList;

    (district.communes || []).forEach((communeName: string) => {
      communeList.push({
        original: communeName,
        normalized: normalizeForComparison(communeName)
      });
    });
  });
});

// Hàm tìm tên khớp nhất
function findBestMatchName(
  nameFromApi: string,
  officialNameObjects: { original: string; normalized: string }[]
): string {
  if (!nameFromApi || !officialNameObjects || officialNameObjects.length === 0) {
    return nameFromApi;
  }

  const normalizedApiName = normalizeForComparison(nameFromApi);
  const officialNormalizedNames = officialNameObjects.map(item => item.normalized);

  const directMatchIndex = officialNormalizedNames.indexOf(normalizedApiName);
  if (directMatchIndex > -1) {
    return officialNameObjects[directMatchIndex].original;
  }

  const ratings = findBestMatch(normalizedApiName, officialNormalizedNames);
  if (ratings.bestMatch.rating > 0.7) {
    return officialNameObjects[ratings.bestMatchIndex].original;
  }

  return nameFromApi; // Trả về tên gốc nếu không khớp
}

// Hàm quan trọng nhất: Ánh xạ dữ liệu từ Goong Maps sang dữ liệu chuẩn
export const mapGoongLocationToStandard = (compound: {
  province?: string;
  district?: string;
  commune?: string;
}) => {
  if (!compound) {
    return { province: '', district: '', commune: '' };
  }

  const { province: rawProvince, district: rawDistrict, commune: rawCommune } = compound;

  const mappedProvince = findBestMatchName(rawProvince || '', locationData.provinces);
  const districtObjects = locationData.districts[mappedProvince] || [];
  const mappedDistrict = findBestMatchName(rawDistrict || '', districtObjects);
  const communeObjects = locationData.communes[`${mappedProvince}_${mappedDistrict}`] || [];
  const mappedCommune = findBestMatchName(rawCommune || '', communeObjects);

  return {
    province: mappedProvince,
    district: mappedDistrict,
    commune: mappedCommune,
  };
};
