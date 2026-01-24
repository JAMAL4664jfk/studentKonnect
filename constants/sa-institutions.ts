// Comprehensive list of South African Higher Education Institutions
// Universities, TVET Colleges, and Private Colleges

export const SA_UNIVERSITIES = [
  // Traditional Universities
  "University of Cape Town (UCT)",
  "University of the Witwatersrand (Wits)",
  "Stellenbosch University",
  "University of Pretoria (UP)",
  "University of KwaZulu-Natal (UKZN)",
  "University of Johannesburg (UJ)",
  "University of the Free State (UFS)",
  "University of South Africa (UNISA)",
  "Rhodes University",
  "North-West University (NWU)",
  "Nelson Mandela University",
  "University of the Western Cape (UWC)",
  "University of Limpopo (UL)",
  "University of Fort Hare",
  "University of Venda (UNIVEN)",
  "University of Zululand (UNIZULU)",
  "Walter Sisulu University (WSU)",
  "Sefako Makgatho Health Sciences University",
  "Sol Plaatje University",
  "University of Mpumalanga",
  
  // Universities of Technology
  "Cape Peninsula University of Technology (CPUT)",
  "Central University of Technology (CUT)",
  "Durban University of Technology (DUT)",
  "Mangosuthu University of Technology (MUT)",
  "Tshwane University of Technology (TUT)",
  "Vaal University of Technology (VUT)",
];

export const SA_TVET_COLLEGES = [
  // Eastern Cape
  "Buffalo City TVET College",
  "East Cape Midlands TVET College",
  "Ikhala TVET College",
  "Ingwe TVET College",
  "King Hintsa TVET College",
  "King Sabata Dalindyebo TVET College",
  "Lovedale TVET College",
  "Port Elizabeth TVET College",
  
  // Free State
  "Flavius Mareka TVET College",
  "Goldfields TVET College",
  "Maluti TVET College",
  "Motheo TVET College",
  
  // Gauteng
  "Central Johannesburg TVET College",
  "Ekurhuleni East TVET College",
  "Ekurhuleni West TVET College",
  "Sedibeng TVET College",
  "South West Gauteng TVET College",
  "Tshwane North TVET College",
  "Tshwane South TVET College",
  "Western TVET College",
  
  // KwaZulu-Natal
  "Coastal KZN TVET College",
  "Elangeni TVET College",
  "Esayidi TVET College",
  "Majuba TVET College",
  "Mnambithi TVET College",
  "Mthashana TVET College",
  "Thekwini TVET College",
  "Umfolozi TVET College",
  "Umgungundlovu TVET College",
  
  // Limpopo
  "Capricorn TVET College",
  "Lephalale TVET College",
  "Letaba TVET College",
  "Mopani South East TVET College",
  "Sekhukhune TVET College",
  "Vhembe TVET College",
  "Waterberg TVET College",
  
  // Mpumalanga
  "Ehlanzeni TVET College",
  "Gert Sibande TVET College",
  "Nkangala TVET College",
  
  // Northern Cape
  "Northern Cape Rural TVET College",
  "Northern Cape Urban TVET College",
  
  // North West
  "Orbit TVET College",
  "Taletso TVET College",
  "Vuselela TVET College",
  
  // Western Cape
  "Boland TVET College",
  "College of Cape Town TVET College",
  "False Bay TVET College",
  "Northlink TVET College",
  "South Cape TVET College",
  "West Coast TVET College",
];

export const SA_PRIVATE_COLLEGES = [
  "Damelin",
  "Boston City Campus",
  "Varsity College",
  "Rosebank College",
  "Milpark Education",
  "Regent Business School",
  "Lyceum College",
  "CTI Education Group",
  "Oxbridge Academy",
  "INTEC College",
  "IMM Graduate School",
  "Cornerstone Institute",
  "Monash South Africa",
  "The IIE (Independent Institute of Education)",
  "AFDA (The School for the Creative Economy)",
  "Vega School",
  "Red & Yellow Creative School of Business",
  "AAA School of Advertising",
  "CityVarsity",
  "Inscape Design College",
  "Other Private College",
];

export const INSTITUTION_TYPES = [
  { label: "University", value: "university" },
  { label: "TVET College", value: "tvet_college" },
  { label: "Private College", value: "private_college" },
  { label: "Other", value: "other" },
];

// Combined list for easy dropdown
export const ALL_SA_INSTITUTIONS = [
  ...SA_UNIVERSITIES,
  ...SA_TVET_COLLEGES,
  ...SA_PRIVATE_COLLEGES,
].sort();

// Get institutions by type
export const getInstitutionsByType = (type: string) => {
  switch (type) {
    case "university":
      return SA_UNIVERSITIES;
    case "tvet_college":
      return SA_TVET_COLLEGES;
    case "private_college":
      return SA_PRIVATE_COLLEGES;
    default:
      return ALL_SA_INSTITUTIONS;
  }
};
