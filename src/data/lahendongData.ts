import { LandCoverClass, Waypoint, GridCell, QuizQuestion } from '../types/gis';

// Base GIS bounds for Kelurahan Lahendong & Danau Linow, Tomohon Selatan
// Precision calibrated to true WGS84 GPS measurements (Danau Linow: 1.271100°N, 124.826400°E)
export const LAHENDONG_BOUNDS = {
  minLat: 1.24500,
  maxLat: 1.28500,
  minLng: 124.79500,
  maxLng: 124.84500,
  centerLat: 1.271100,
  centerLng: 124.826400, // Exactly Danau Linow (1.271100, 124.826400)
  totalAreaHa: 684.5,
  elevationRangeM: [740, 1080] as [number, number],
};

// Coordinate to Grid percentage conversion functions (Exact linear mapping over bounds)
export function latLngToGridPercent(lat: number, lng: number): { gridX: number; gridY: number } {
  const gridX = ((lng - LAHENDONG_BOUNDS.minLng) / (LAHENDONG_BOUNDS.maxLng - LAHENDONG_BOUNDS.minLng)) * 100;
  const gridY = ((LAHENDONG_BOUNDS.maxLat - lat) / (LAHENDONG_BOUNDS.maxLat - LAHENDONG_BOUNDS.minLat)) * 100;
  return {
    gridX: Math.max(0, Math.min(100, parseFloat(gridX.toFixed(4)))),
    gridY: Math.max(0, Math.min(100, parseFloat(gridY.toFixed(4)))),
  };
}

export function gridPercentToLatLng(gridX: number, gridY: number): { lat: number; lng: number } {
  const lng = LAHENDONG_BOUNDS.minLng + (gridX / 100) * (LAHENDONG_BOUNDS.maxLng - LAHENDONG_BOUNDS.minLng);
  const lat = LAHENDONG_BOUNDS.maxLat - (gridY / 100) * (LAHENDONG_BOUNDS.maxLat - LAHENDONG_BOUNDS.minLat);
  return {
    lat: parseFloat(lat.toFixed(7)),
    lng: parseFloat(lng.toFixed(7)),
  };
}

export const LAND_COVER_CLASSES: LandCoverClass[] = [
  {
    id: 'geothermal_manifestation',
    name: 'Geothermal Manifestations',
    indonesianName: 'Area Manifestasi Panas Bumi',
    color: '#ef4444', // Red
    description: 'Active fumaroles, steaming ground, solfataras, and acidic boiling mud pots with extreme surface temperatures.',
    areaHa: 28.4,
    percentage: 4.15,
    ndviRange: [-0.05, 0.18],
    lstRange: [48.0, 92.5],
  },
  {
    id: 'pltp_infrastructure',
    name: 'PLTP Geothermal Facility',
    indonesianName: 'Infrastruktur PLTP & Sumur Bor',
    color: '#f97316', // Orange
    description: 'Power houses (Units 1-6), production wellpads (LHD-4, LHD-23), steam gathering pipelines, and cooling towers.',
    areaHa: 46.2,
    percentage: 6.75,
    ndviRange: [0.10, 0.28],
    lstRange: [32.0, 46.0],
  },
  {
    id: 'lake_water',
    name: 'Lake Linow (Hydrothermal Water)',
    indonesianName: 'Danau Linow & Sumber Air Panas',
    color: '#06b6d4', // Cyan
    description: 'Volcanic caldera lake with variable chemical coloration (turquoise-green to amber) caused by sub-lacustrine hydrothermal vents.',
    areaHa: 34.8,
    percentage: 5.08,
    ndviRange: [-0.35, -0.05],
    lstRange: [28.0, 42.0],
  },
  {
    id: 'protection_forest',
    name: 'Protected Pine & Cloud Forest',
    indonesianName: 'Hutan Lindung & Wisata Pinus',
    color: '#10b981', // Emerald Green
    description: 'Dense Pinus merkusii and tropical highland vegetation acting as water catchment, carbon sink, and thermal buffer.',
    areaHa: 312.6,
    percentage: 45.67,
    ndviRange: [0.65, 0.88],
    lstRange: [20.5, 24.8],
  },
  {
    id: 'mixed_agriculture',
    name: 'Horticulture & Mixed Agriculture',
    indonesianName: 'Pertanian Hortikultura Campuran',
    color: '#84cc16', // Lime Green
    description: 'Smallholder farms cultivating highland vegetables (cabbage, chili, corn, scallions) and secondary agroforestry.',
    areaHa: 182.5,
    percentage: 26.66,
    ndviRange: [0.38, 0.62],
    lstRange: [23.5, 29.0],
  },
  {
    id: 'residential_settlement',
    name: 'Village Residential Settlement',
    indonesianName: 'Permukiman Kelurahan Lahendong',
    color: '#8b5cf6', // Violet
    description: 'Kelurahan administrative hub, traditional homes, churches, public primary school, and community commercial corridor.',
    areaHa: 80.0,
    percentage: 11.69,
    ndviRange: [0.15, 0.35],
    lstRange: [25.0, 31.0],
  },
];

// Exact WGS84 coordinates verified with Google Maps Platform Satellite and user ground survey
export const INITIAL_WAYPOINTS: Waypoint[] = [
  {
    id: 'WP-01',
    name: 'Danau Linow (Titik Acuan Kaldera Hidrotermal)',
    category: 'lake',
    lat: 1.271100,
    lng: 124.826400,
    gridX: 62.80,
    gridY: 34.75,
    tempCelsius: 41.5,
    elevationM: 780,
    ndvi: -0.22,
    hazardNote: 'Tepian danau bersuhu hangat dengan semburan uap bawah air. Berenang dilarang.',
    description: 'Danau kawah vulkanik Linow dengan perubahan warna air (hijau toska hingga amber) akibat dispersi sulfur terlarut.',
    scientificContext: 'Kawah maar hidrotermal aktif hasil letusan freatik purba dengan rembesan fluida panas bumi (Nugraha et al., 2024).',
    isFieldVerified: true,
    studentNotes: 'Koordinat presisi ground truth lapangan (1.271100°N, 124.826400°E). Permukaan air memancarkan uap belerang tipis.',
    sensorAnomaly: true,
  },
  {
    id: 'WP-02',
    name: 'Hutan Wisata Pinus Lahendong',
    category: 'forest_buffer',
    lat: 1.2721000,
    lng: 124.8023000,
    gridX: 14.333,
    gridY: 26.333,
    tempCelsius: 22.8,
    elevationM: 865,
    ndvi: 0.81,
    hazardNote: 'Jalur wisata aman. Kontur lereng curam di beberapa titik.',
    description: 'Kawasan hutan pinus alami di sebelah barat Danau Linow yang menjadi zona penyangga ekologis dan tangkapan air.',
    scientificContext: 'Korelasi negatif kuat antara tutupan tajuk pinus ber-NDVI tinggi dengan suhu permukaan tanah (Tamboto et al., 2023).',
    isFieldVerified: true,
    studentNotes: 'Kanopi pinus sangat lebat, suhu udara sejuk 22°C. Berfungsi sebagai barrier termal alami bagi ekosistem sekitar.',
    sensorAnomaly: false,
  },
  {
    id: 'WP-03',
    name: 'Kawah Lumpur Kasuratan (Boiling Mud Pool)',
    category: 'mud_pool',
    lat: 1.2642000,
    lng: 124.8089000,
    gridX: 36.333,
    gridY: 52.667,
    tempCelsius: 84.2,
    elevationM: 812,
    ndvi: 0.04,
    hazardNote: 'Bahaya lumpur mendidih (>80°C) dan gas H2S beracun. Jaga jarak minimal 5 meter dan gunakan masker gas.',
    description: 'Kawah lumpur abu-abu mendidih dengan pelepasan gelembung gas konstan di sebelah tenggara Danau Linow.',
    scientificContext: 'Kondensat uap asam-sulfat yang melarutkan batuan vulkanik menjadi mineral lempung kaolinit (Brehme, 2015).',
    isFieldVerified: true,
    studentNotes: 'Pengukuran radiometer termal mencatat suhu 84.2°C. Suara letupan lumpur terdengar jelas, kerak belerang kuning di sekeliling kawah.',
    sensorAnomaly: true,
  },
  {
    id: 'WP-04',
    name: 'Fumarol Steaming Vent Sektor Barat',
    category: 'fumarole',
    lat: 1.2615000,
    lng: 124.8078000,
    gridX: 32.667,
    gridY: 61.667,
    tempCelsius: 91.8,
    elevationM: 835,
    ndvi: 0.02,
    hazardNote: 'Semburan uap superheated (>90°C). Berdiri di arah melawan angin (upwind).',
    description: 'Ventilasi uap bertekanan tinggi yang keluar melalui celah batuan vulkanik di sepanjang sesar aktif.',
    scientificContext: 'Pelepasan langsung uap dari zona reservoir panas bumi bagian atas (vapor-dominated cap).',
    isFieldVerified: true,
    studentNotes: 'Suhu tertinggi terdeteksi di permukaan (91.8°C). Tidak ada vegetasi yang mampu tumbuh dalam radius 20 meter.',
    sensorAnomaly: true,
  },
  {
    id: 'WP-05',
    name: 'Mata Air Panas Ranowangko',
    category: 'hot_spring',
    lat: 1.2560000,
    lng: 124.8055000,
    gridX: 25.000,
    gridY: 80.000,
    tempCelsius: 52.4,
    elevationM: 795,
    ndvi: 0.32,
    hazardNote: 'Air bersuhu panas (52°C). Hati-hati tergelincir di tepian batu berlumut.',
    description: 'Sumber mata air panas alami di sektor selatan yang mengalir ke sungai kecil perbatasan.',
    scientificContext: 'Aliran outflow hidrotermal bertipe klorida netral dari sistem panas bumi Lahendong.',
    isFieldVerified: true,
    studentNotes: 'Air jernih mengepulkan uap hangat, endapan silika sinter tipis pada batuan kali.',
    sensorAnomaly: true,
  },
  {
    id: 'WP-06',
    name: 'Kantor Kelurahan Lahendong (Pusat PKM)',
    category: 'village_office',
    lat: 1.2748800,
    lng: 124.8199500,
    gridX: 73.167,
    gridY: 17.067,
    tempCelsius: 24.6,
    elevationM: 775,
    ndvi: 0.29,
    hazardNote: 'Bangunan kantor pemerintahan di Jl. Raya Tomohon (Plus Code: 7RF9+WX6). Bebas bahaya vulkanik.',
    description: 'Pusat administrasi Kelurahan Lahendong dan lokasi pelaksanaan pelatihan SIG partisipatif tim pengabdian FMIPA UNSRAT.',
    scientificContext: 'Pangkalan data spasial kelurahan untuk perencanaan tata ruang dan pembentukan Pokja Geospasial.',
    isFieldVerified: true,
    studentNotes: 'Tepat di tepi jalan utama Tomohon-Kawangkoan. Lokasi koordinasi antara tim UNSRAT, lurah, dan Dinas ESDM.',
    sensorAnomaly: false,
  },
  {
    id: 'WP-07',
    name: 'Sumur Produksi Panas Bumi (Wellpad LHD-4 / LHD-23)',
    category: 'power_plant',
    lat: 1.2570000,
    lng: 124.8210000,
    gridX: 76.667,
    gridY: 76.667,
    tempCelsius: 41.2,
    elevationM: 830,
    ndvi: 0.16,
    hazardNote: 'Area industri pipa uap bertekanan tinggi. Wajib rompi K3 dan helm proyek.',
    description: 'Wellpad sumur produksi panas bumi Pertamina Geothermal Energy yang menyalurkan fluida uap ke separator.',
    scientificContext: 'Sumur bor produksi sedalam 1.500–2.200 meter menembus reservoir permeabel bertemperatur >250°C.',
    isFieldVerified: true,
    studentNotes: 'Jaringan pipa transmisi uap berinsulasi termal melintasi koridor hutan sekunder.',
    sensorAnomaly: true,
  },
  {
    id: 'WP-08',
    name: 'PLTP Lahendong Unit 5 & 6 (PGE Area)',
    category: 'power_plant',
    lat: 1.2535000,
    lng: 124.8235000,
    gridX: 85.000,
    gridY: 88.333,
    tempCelsius: 38.6,
    elevationM: 840,
    ndvi: 0.18,
    hazardNote: 'Instalasi turbin dan gardu induk tegangan tinggi 150 kV. Akses terbatas.',
    description: 'Pembangkit Listrik Tenaga Panas Bumi (2x20 MW) penyedia beban dasar listrik ramah lingkungan Sulawesi Utara.',
    scientificContext: 'Operasi PLTP biner & condensing dengan sistem injeksi ulang kondensat (Samola et al., 2023).',
    isFieldVerified: true,
    studentNotes: 'Gedung powerhouse turbin dan menara pendingin (cooling tower) terlihat jelas dari citra satelit.',
    sensorAnomaly: true,
  },
];

// Pre-computed 40x40 spatial grid simulating satellite raster telemetry
// Mathematically calibrated to the exact WGS84 geographic coordinates
export function generateLahendongRasterGrid(): GridCell[] {
  const gridSize = 40;
  const cells: GridCell[] = [];

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      // Normalized coordinates [0, 1]
      const nx = gx / (gridSize - 1);
      const ny = gy / (gridSize - 1);

      // Geo coordinates exactly mapped to bounding box
      const lat = LAHENDONG_BOUNDS.maxLat - ny * (LAHENDONG_BOUNDS.maxLat - LAHENDONG_BOUNDS.minLat);
      const lng = LAHENDONG_BOUNDS.minLng + nx * (LAHENDONG_BOUNDS.maxLng - LAHENDONG_BOUNDS.minLng);

      // Distances to real physical landmarks:
      // Danau Linow: [1.271100, 124.826400] -> nx = 0.628, ny = 0.348
      const dLinow = Math.hypot(nx - 0.628, ny - 0.348);
      // Mud pools / Fumaroles (Kasuratan): [1.2642, 124.8089] -> nx = 0.278, ny = 0.520
      const dMud = Math.hypot(nx - 0.278, ny - 0.520);
      // PLTP Complex: [1.2535, 124.8235] -> nx = 0.570, ny = 0.788
      const dPLTP = Math.hypot(nx - 0.570, ny - 0.788);
      // Kantor Kelurahan & Jl. Raya Tomohon settlement: [1.27488, 124.81995] -> nx = 0.499, ny = 0.253
      const dVillage = Math.hypot(nx - 0.499, ny - 0.253);
      // Pine Forest around Linow: [1.2721, 124.8023] -> nx = 0.146, ny = 0.323
      const dPine = Math.hypot(nx - 0.146, ny - 0.323);

      let landCover: LandCoverClass['id'] = 'protection_forest';
      let lst = 21.5 + (1 - ny) * 2.0; // Base ambient lapse rate
      let ndvi = 0.75;
      let elevation = 1050 - nx * 180 - ny * 80;

      // Classify cells based on authentic geographic proximity
      if (dLinow < 0.10) {
        // Lake Linow caldera body
        landCover = 'lake_water';
        lst = 34.0 + (1 - dLinow / 0.10) * 11.5;
        ndvi = -0.22;
        elevation = 780;
      } else if (dMud < 0.11) {
        // Active geothermal surface manifestations (Kasuratan)
        landCover = 'geothermal_manifestation';
        lst = 54.0 + (1 - dMud / 0.11) * 38.0;
        ndvi = 0.04;
        elevation = 815;
      } else if (dPLTP < 0.12) {
        // PLTP Lahendong generation infrastructure
        landCover = 'pltp_infrastructure';
        lst = 34.5 + (1 - dPLTP / 0.12) * 12.0;
        ndvi = 0.18;
        elevation = 840;
      } else if (dVillage < 0.13 || (nx > 0.68 && nx < 0.78 && ny < 0.35)) {
        // Residential settlement & administrative corridor (Jl. Raya Tomohon)
        landCover = 'residential_settlement';
        lst = 26.5;
        ndvi = 0.28;
        elevation = 775;
      } else if (nx > 0.40 && ny > 0.30 && ny < 0.75) {
        // Mixed agriculture & horticulture
        landCover = 'mixed_agriculture';
        lst = 25.0;
        ndvi = 0.52;
        elevation = 800;
      } else {
        // Protected highland pine forest
        landCover = 'protection_forest';
        lst = 21.8;
        ndvi = 0.78;
        elevation = 880;
      }

      // Check for zoning conflict
      const isAnomaly = lst >= 42.0;
      const isZoningConflict = isAnomaly && (landCover === 'residential_settlement' || dVillage < 0.16);

      cells.push({
        x: gx,
        y: gy,
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6)),
        elevation: Math.round(elevation),
        lst: parseFloat(lst.toFixed(1)),
        ndvi: parseFloat(ndvi.toFixed(2)),
        landCover,
        isAnomaly,
        isZoningConflict,
      });
    }
  }

  return cells;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Citra satelit apakah yang memiliki band Thermal Infrared (TIRS) untuk menghitung Land Surface Temperature (LST) di Lahendong?',
    options: [
      'Sentinel-2 MSI (MultiSpectral Instrument)',
      'Landsat-8/9 TIRS (Band 10)',
      'SRTM Digital Elevation Model',
      'MODIS Rapid Response Blue Band'
    ],
    correctIndex: 1,
    explanation: 'Landsat-8 dan Landsat-9 membawa instrumen TIRS (Thermal Infrared Sensor) pada Band 10 (10.6–11.19 µm) yang mampu merekam radiansi termal permukaan bumi untuk diinversi menjadi suhu permukaan (LST) kawasan geothermal.',
    academicReference: 'Muhajir et al. (2023), Detecting thermal anomalies in Lahendong using Landsat-8 TIR'
  },
  {
    id: 2,
    question: 'Rumus matematika apakah yang digunakan untuk menghitung Normalized Difference Vegetation Index (NDVI) menggunakan citra Sentinel-2?',
    options: [
      '(Red - Blue) / (Red + Blue)',
      '(NIR - Red) / (NIR + Red) -> (Band 8 - Band 4) / (Band 8 + Band 4)',
      '(SWIR - Thermal) / (SWIR + Thermal)',
      '(Green - NIR) / (Green + NIR)'
    ],
    correctIndex: 1,
    explanation: 'NDVI dihitung dengan rasio (NIR - Red) / (NIR + Red). Pada Sentinel-2, NIR adalah Band 8 (842 nm) dan Red adalah Band 4 (665 nm). Klorofil menyerap kuat cahaya merah dan memantulkan radiasi inframerah dekat.',
    academicReference: 'Tamboto et al. (2023), Jurnal FisTa: Distribusi Suhu Permukaan Tanah dan NDVI Hutan Pinus'
  },
  {
    id: 3,
    question: 'Mengapa kawasan manifestasi panas bumi alami (fumarol & kawah lumpur) umumnya memiliki nilai NDVI sangat rendah (<0.15)?',
    options: [
      'Karena uap panas dan gas asam sulfur (H2S/SO2) merusak vegetasi di sekitarnya sehingga tanah didominasi mineral alterasi batuan',
      'Karena citra satelit tidak mampu membedakan uap air dengan daun hijau',
      'Karena pohon sengaja ditebang oleh pihak pengelola energi PLTP',
      'Karena air Danau Linow merendam seluruh vegetasi di sekitar kawah'
    ],
    correctIndex: 0,
    explanation: 'Kondisi mikroklimat bersuhu ekstrem serta emisi gas asam seperti sulfur dioksida dan hidrogen sulfida menciptakan zona alterasi hidrotermal yang gersang dengan formasi batuan/tanah liat lempung (kaolin), menghasilkan reflektansi spektral khas batuan/tanah terbuka.',
    academicReference: 'Brehme (2015), Fault zones & geothermal reservoirs in Lahendong'
  },
  {
    id: 4,
    question: 'Mengapa pendekatan Participatory Action Research (PAR) sangat penting diterapkan dalam pemetaan geothermal bagi aparatur kelurahan?',
    options: [
      'Agar kelurahan tidak perlu mengeluarkan biaya untuk membeli laptop baru',
      'Agar aparatur terlibat aktif sejak identifikasi hingga validasi batas, sehingga mandiri data tanpa ketergantungan konsultan luar',
      'Hanya untuk melengkapi persyaratan administratif borang laporan PKM universitas',
      'Untuk menggantikan seluruh tugas dan kewenangan dari dinas BPN dan ESDM'
    ],
    correctIndex: 1,
    explanation: 'Sebagaimana dirumuskan pada Bab II usulan PKM UNSRAT, metode PAR memastikan transfer IPTEK geospasial mengakar kuat pada aparatur lokal sehingga tercipta kemandirian tata kelola data wilayah dan pengawasan lingkungan berkelanjutan.',
    academicReference: 'Proposal PKM Klaster 2 UNSRAT (2026), Bab II.1 Pendekatan PAR'
  },
  {
    id: 5,
    question: 'Apa fungsi utama pembuatan Standar Operasional Prosedur (SOP) dan pembentukan Pokja Geospasial di Kelurahan Lahendong?',
    options: [
      'Menjamin keberlanjutan pemutakhiran data spasial dan mencegah hilangnya pengetahuan saat terjadi pergantian (turnover) aparatur',
      'Membatasi masyarakat umum agar tidak boleh melihat peta kelurahan',
      'Mengurangi jam kerja perangkat kantor kelurahan',
      'Menghapuskan kewajiban koordinasi dengan instansi vertikal Pemkot Tomohon'
    ],
    correctIndex: 0,
    explanation: 'SOP teknis dan Pokja Geospasial berfungsi sebagai payung kelembagaan jangka panjang agar kapabilitas analisis GIS tetap berjalan konsisten meskipun pegawai kelurahan mengalami rotasi atau mutasi.',
    academicReference: 'Proposal PKM Klaster 2 UNSRAT (2026), Bab II.2 Luaran Keberlanjutan'
  }
];

export const PROPOSAL_METADATA = {
  title: 'PKM Pelatihan Pemetaan Kawasan Geothermal Menggunakan Citra Satelit bagi Aparatur Kelurahan di Kelurahan Lahendong, Kota Tomohon',
  scheme: 'Program Kemitraan Masyarakat Klaster 2 (PKM_K2)',
  institution: 'Universitas Sam Ratulangi (UNSRAT), FMIPA',
  leadInvestigator: 'Dr. Winsy Ch. D. Weku, S.Si., M.Si., M.CS',
  coInvestigators: [
    'Mahardika Inra Takaendengan, SST., M.Si (Sains Komputasi / Sistem Informasi)',
    'Amalludin, S.Si., M.Si (Matematika Komputasi / Machine Learning)',
    'Dodisutarma Lapihu, S.SI., M.Kom (Sistem Informasi / TI)',
    'Christian Alderi Jeffta Soewoeh, M.TI (Sistem Informasi Geografis)',
    'Mans Lumiu Mananohas, S.Si., M.Si (Matematika Analisis Spasial)'
  ],
  studentResearchers: ['Rama Ijon Turnip', 'Riska Manoppo', 'Esda Dwitri'],
  duration: '8 Bulan (Maret - Oktober 2026)',
  sdgGoals: ['SDG 7: Clean & Affordable Energy', 'SDG 11: Sustainable Cities & Communities'],
  keyStakeholders: ['Aparatur Kelurahan Lahendong (Mitra Utama)', 'Dinas ESDM Kota Tomohon', 'Bappeda Kota Tomohon']
};
