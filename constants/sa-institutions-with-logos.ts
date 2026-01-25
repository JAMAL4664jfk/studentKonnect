// South African Universities, TVET Colleges with Logos
// For production, replace placeholder URLs with actual institution logo URLs

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  logo: string; // URL or require() path
  type: "university" | "tvet" | "private";
}

export const SA_INSTITUTIONS: Institution[] = [
  // Traditional Universities
  {
    id: "uct",
    name: "University of Cape Town",
    shortName: "UCT",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/University_of_Cape_Town_logo.svg/200px-University_of_Cape_Town_logo.svg.png",
    type: "university",
  },
  {
    id: "wits",
    name: "University of the Witwatersrand",
    shortName: "Wits",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/University_of_the_Witwatersrand_Logo.svg/200px-University_of_the_Witwatersrand_Logo.svg.png",
    type: "university",
  },
  {
    id: "stellenbosch",
    name: "Stellenbosch University",
    shortName: "SU",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Stellenbosch_University_Logo.svg/200px-Stellenbosch_University_Logo.svg.png",
    type: "university",
  },
  {
    id: "up",
    name: "University of Pretoria",
    shortName: "UP",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/University_of_Pretoria_Logo.svg/200px-University_of_Pretoria_Logo.svg.png",
    type: "university",
  },
  {
    id: "ukzn",
    name: "University of KwaZulu-Natal",
    shortName: "UKZN",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/UKZN_logo.svg/200px-UKZN_logo.svg.png",
    type: "university",
  },
  {
    id: "uj",
    name: "University of Johannesburg",
    shortName: "UJ",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9c/University_of_Johannesburg_Logo.svg/200px-University_of_Johannesburg_Logo.svg.png",
    type: "university",
  },
  {
    id: "ufs",
    name: "University of the Free State",
    shortName: "UFS",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0f/University_of_the_Free_State_logo.svg/200px-University_of_the_Free_State_logo.svg.png",
    type: "university",
  },
  {
    id: "unisa",
    name: "University of South Africa",
    shortName: "UNISA",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/UNISA_logo.svg/200px-UNISA_logo.svg.png",
    type: "university",
  },
  {
    id: "rhodes",
    name: "Rhodes University",
    shortName: "Rhodes",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Rhodes_University_Logo.svg/200px-Rhodes_University_Logo.svg.png",
    type: "university",
  },
  {
    id: "nwu",
    name: "North-West University",
    shortName: "NWU",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/North-West_University_Logo.svg/200px-North-West_University_Logo.svg.png",
    type: "university",
  },
  {
    id: "nmu",
    name: "Nelson Mandela University",
    shortName: "NMU",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Nelson_Mandela_University_logo.svg/200px-Nelson_Mandela_University_logo.svg.png",
    type: "university",
  },
  {
    id: "uwc",
    name: "University of the Western Cape",
    shortName: "UWC",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/University_of_the_Western_Cape_logo.svg/200px-University_of_the_Western_Cape_logo.svg.png",
    type: "university",
  },
  {
    id: "ul",
    name: "University of Limpopo",
    shortName: "UL",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4f/University_of_Limpopo_logo.svg/200px-University_of_Limpopo_logo.svg.png",
    type: "university",
  },
  {
    id: "ufh",
    name: "University of Fort Hare",
    shortName: "UFH",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/University_of_Fort_Hare_logo.svg/200px-University_of_Fort_Hare_logo.svg.png",
    type: "university",
  },
  {
    id: "univen",
    name: "University of Venda",
    shortName: "UNIVEN",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/University_of_Venda_logo.svg/200px-University_of_Venda_logo.svg.png",
    type: "university",
  },
  {
    id: "unizulu",
    name: "University of Zululand",
    shortName: "UNIZULU",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/University_of_Zululand_logo.svg/200px-University_of_Zululand_logo.svg.png",
    type: "university",
  },
  {
    id: "wsu",
    name: "Walter Sisulu University",
    shortName: "WSU",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Walter_Sisulu_University_logo.svg/200px-Walter_Sisulu_University_logo.svg.png",
    type: "university",
  },
  {
    id: "smu",
    name: "Sefako Makgatho Health Sciences University",
    shortName: "SMU",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Sefako_Makgatho_Health_Sciences_University_logo.svg/200px-Sefako_Makgatho_Health_Sciences_University_logo.svg.png",
    type: "university",
  },
  {
    id: "spu",
    name: "Sol Plaatje University",
    shortName: "SPU",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/Sol_Plaatje_University_logo.svg/200px-Sol_Plaatje_University_logo.svg.png",
    type: "university",
  },
  {
    id: "ump",
    name: "University of Mpumalanga",
    shortName: "UMP",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/University_of_Mpumalanga_logo.svg/200px-University_of_Mpumalanga_logo.svg.png",
    type: "university",
  },

  // Universities of Technology
  {
    id: "cput",
    name: "Cape Peninsula University of Technology",
    shortName: "CPUT",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Cape_Peninsula_University_of_Technology_logo.svg/200px-Cape_Peninsula_University_of_Technology_logo.svg.png",
    type: "university",
  },
  {
    id: "cut",
    name: "Central University of Technology",
    shortName: "CUT",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/Central_University_of_Technology_logo.svg/200px-Central_University_of_Technology_logo.svg.png",
    type: "university",
  },
  {
    id: "dut",
    name: "Durban University of Technology",
    shortName: "DUT",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Durban_University_of_Technology_logo.svg/200px-Durban_University_of_Technology_logo.svg.png",
    type: "university",
  },
  {
    id: "mut",
    name: "Mangosuthu University of Technology",
    shortName: "MUT",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/Mangosuthu_University_of_Technology_logo.svg/200px-Mangosuthu_University_of_Technology_logo.svg.png",
    type: "university",
  },
  {
    id: "tut",
    name: "Tshwane University of Technology",
    shortName: "TUT",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Tshwane_University_of_Technology_logo.svg/200px-Tshwane_University_of_Technology_logo.svg.png",
    type: "university",
  },
  {
    id: "vut",
    name: "Vaal University of Technology",
    shortName: "VUT",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Vaal_University_of_Technology_logo.svg/200px-Vaal_University_of_Technology_logo.svg.png",
    type: "university",
  },

  // TVET Colleges - Eastern Cape
  {
    id: "buffalo-city-tvet",
    name: "Buffalo City TVET College",
    shortName: "Buffalo City",
    logo: "https://via.placeholder.com/100/4A90E2/FFFFFF?text=BC",
    type: "tvet",
  },
  {
    id: "east-cape-midlands-tvet",
    name: "East Cape Midlands TVET College",
    shortName: "ECM",
    logo: "https://via.placeholder.com/100/4A90E2/FFFFFF?text=ECM",
    type: "tvet",
  },
  {
    id: "ikhala-tvet",
    name: "Ikhala TVET College",
    shortName: "Ikhala",
    logo: "https://via.placeholder.com/100/4A90E2/FFFFFF?text=IK",
    type: "tvet",
  },
  {
    id: "ingwe-tvet",
    name: "Ingwe TVET College",
    shortName: "Ingwe",
    logo: "https://via.placeholder.com/100/4A90E2/FFFFFF?text=IW",
    type: "tvet",
  },
  {
    id: "king-hintsa-tvet",
    name: "King Hintsa TVET College",
    shortName: "King Hintsa",
    logo: "https://via.placeholder.com/100/4A90E2/FFFFFF?text=KH",
    type: "tvet",
  },
  {
    id: "king-sabata-tvet",
    name: "King Sabata Dalindyebo TVET College",
    shortName: "KSD",
    logo: "https://via.placeholder.com/100/4A90E2/FFFFFF?text=KSD",
    type: "tvet",
  },
  {
    id: "lovedale-tvet",
    name: "Lovedale TVET College",
    shortName: "Lovedale",
    logo: "https://via.placeholder.com/100/4A90E2/FFFFFF?text=LD",
    type: "tvet",
  },
  {
    id: "port-elizabeth-tvet",
    name: "Port Elizabeth TVET College",
    shortName: "PE",
    logo: "https://via.placeholder.com/100/4A90E2/FFFFFF?text=PE",
    type: "tvet",
  },

  // TVET Colleges - Free State
  {
    id: "flavius-mareka-tvet",
    name: "Flavius Mareka TVET College",
    shortName: "Flavius Mareka",
    logo: "https://via.placeholder.com/100/E74C3C/FFFFFF?text=FM",
    type: "tvet",
  },
  {
    id: "goldfields-tvet",
    name: "Goldfields TVET College",
    shortName: "Goldfields",
    logo: "https://via.placeholder.com/100/E74C3C/FFFFFF?text=GF",
    type: "tvet",
  },
  {
    id: "maluti-tvet",
    name: "Maluti TVET College",
    shortName: "Maluti",
    logo: "https://via.placeholder.com/100/E74C3C/FFFFFF?text=ML",
    type: "tvet",
  },
  {
    id: "motheo-tvet",
    name: "Motheo TVET College",
    shortName: "Motheo",
    logo: "https://via.placeholder.com/100/E74C3C/FFFFFF?text=MT",
    type: "tvet",
  },

  // TVET Colleges - Gauteng
  {
    id: "central-johannesburg-tvet",
    name: "Central Johannesburg TVET College",
    shortName: "CJC",
    logo: "https://via.placeholder.com/100/F39C12/FFFFFF?text=CJC",
    type: "tvet",
  },
  {
    id: "ekurhuleni-east-tvet",
    name: "Ekurhuleni East TVET College",
    shortName: "EE",
    logo: "https://via.placeholder.com/100/F39C12/FFFFFF?text=EE",
    type: "tvet",
  },
  {
    id: "ekurhuleni-west-tvet",
    name: "Ekurhuleni West TVET College",
    shortName: "EW",
    logo: "https://via.placeholder.com/100/F39C12/FFFFFF?text=EW",
    type: "tvet",
  },
  {
    id: "sedibeng-tvet",
    name: "Sedibeng TVET College",
    shortName: "Sedibeng",
    logo: "https://via.placeholder.com/100/F39C12/FFFFFF?text=SD",
    type: "tvet",
  },
  {
    id: "south-west-gauteng-tvet",
    name: "South West Gauteng TVET College",
    shortName: "SWG",
    logo: "https://via.placeholder.com/100/F39C12/FFFFFF?text=SWG",
    type: "tvet",
  },
  {
    id: "tshwane-north-tvet",
    name: "Tshwane North TVET College",
    shortName: "TN",
    logo: "https://via.placeholder.com/100/F39C12/FFFFFF?text=TN",
    type: "tvet",
  },
  {
    id: "tshwane-south-tvet",
    name: "Tshwane South TVET College",
    shortName: "TS",
    logo: "https://via.placeholder.com/100/F39C12/FFFFFF?text=TS",
    type: "tvet",
  },
  {
    id: "western-college-tvet",
    name: "Western College for TVET",
    shortName: "Western",
    logo: "https://via.placeholder.com/100/F39C12/FFFFFF?text=WC",
    type: "tvet",
  },

  // TVET Colleges - KwaZulu-Natal
  {
    id: "coastal-tvet",
    name: "Coastal KZN TVET College",
    shortName: "Coastal",
    logo: "https://via.placeholder.com/100/9B59B6/FFFFFF?text=CK",
    type: "tvet",
  },
  {
    id: "elangeni-tvet",
    name: "Elangeni TVET College",
    shortName: "Elangeni",
    logo: "https://via.placeholder.com/100/9B59B6/FFFFFF?text=EL",
    type: "tvet",
  },
  {
    id: "esayidi-tvet",
    name: "Esayidi TVET College",
    shortName: "Esayidi",
    logo: "https://via.placeholder.com/100/9B59B6/FFFFFF?text=ES",
    type: "tvet",
  },
  {
    id: "majuba-tvet",
    name: "Majuba TVET College",
    shortName: "Majuba",
    logo: "https://via.placeholder.com/100/9B59B6/FFFFFF?text=MJ",
    type: "tvet",
  },
  {
    id: "mnambithi-tvet",
    name: "Mnambithi TVET College",
    shortName: "Mnambithi",
    logo: "https://via.placeholder.com/100/9B59B6/FFFFFF?text=MN",
    type: "tvet",
  },
  {
    id: "mthashana-tvet",
    name: "Mthashana TVET College",
    shortName: "Mthashana",
    logo: "https://via.placeholder.com/100/9B59B6/FFFFFF?text=MT",
    type: "tvet",
  },
  {
    id: "thekwini-tvet",
    name: "Thekwini TVET College",
    shortName: "Thekwini",
    logo: "https://via.placeholder.com/100/9B59B6/FFFFFF?text=TK",
    type: "tvet",
  },
  {
    id: "umfolozi-tvet",
    name: "Umfolozi TVET College",
    shortName: "Umfolozi",
    logo: "https://via.placeholder.com/100/9B59B6/FFFFFF?text=UF",
    type: "tvet",
  },
  {
    id: "umgungundlovu-tvet",
    name: "Umgungundlovu TVET College",
    shortName: "Umgungundlovu",
    logo: "https://via.placeholder.com/100/9B59B6/FFFFFF?text=UG",
    type: "tvet",
  },

  // TVET Colleges - Limpopo
  {
    id: "capricorn-tvet",
    name: "Capricorn TVET College",
    shortName: "Capricorn",
    logo: "https://via.placeholder.com/100/16A085/FFFFFF?text=CP",
    type: "tvet",
  },
  {
    id: "lephalale-tvet",
    name: "Lephalale TVET College",
    shortName: "Lephalale",
    logo: "https://via.placeholder.com/100/16A085/FFFFFF?text=LP",
    type: "tvet",
  },
  {
    id: "letaba-tvet",
    name: "Letaba TVET College",
    shortName: "Letaba",
    logo: "https://via.placeholder.com/100/16A085/FFFFFF?text=LT",
    type: "tvet",
  },
  {
    id: "mopani-south-east-tvet",
    name: "Mopani South East TVET College",
    shortName: "Mopani SE",
    logo: "https://via.placeholder.com/100/16A085/FFFFFF?text=MSE",
    type: "tvet",
  },
  {
    id: "sekhukhune-tvet",
    name: "Sekhukhune TVET College",
    shortName: "Sekhukhune",
    logo: "https://via.placeholder.com/100/16A085/FFFFFF?text=SK",
    type: "tvet",
  },
  {
    id: "vhembe-tvet",
    name: "Vhembe TVET College",
    shortName: "Vhembe",
    logo: "https://via.placeholder.com/100/16A085/FFFFFF?text=VH",
    type: "tvet",
  },
  {
    id: "waterberg-tvet",
    name: "Waterberg TVET College",
    shortName: "Waterberg",
    logo: "https://via.placeholder.com/100/16A085/FFFFFF?text=WB",
    type: "tvet",
  },

  // TVET Colleges - Mpumalanga
  {
    id: "ehlanzeni-tvet",
    name: "Ehlanzeni TVET College",
    shortName: "Ehlanzeni",
    logo: "https://via.placeholder.com/100/E67E22/FFFFFF?text=EH",
    type: "tvet",
  },
  {
    id: "gert-sibande-tvet",
    name: "Gert Sibande TVET College",
    shortName: "Gert Sibande",
    logo: "https://via.placeholder.com/100/E67E22/FFFFFF?text=GS",
    type: "tvet",
  },
  {
    id: "nkangala-tvet",
    name: "Nkangala TVET College",
    shortName: "Nkangala",
    logo: "https://via.placeholder.com/100/E67E22/FFFFFF?text=NK",
    type: "tvet",
  },

  // TVET Colleges - Northern Cape
  {
    id: "northern-cape-rural-tvet",
    name: "Northern Cape Rural TVET College",
    shortName: "NC Rural",
    logo: "https://via.placeholder.com/100/8E44AD/FFFFFF?text=NCR",
    type: "tvet",
  },
  {
    id: "northern-cape-urban-tvet",
    name: "Northern Cape Urban TVET College",
    shortName: "NC Urban",
    logo: "https://via.placeholder.com/100/8E44AD/FFFFFF?text=NCU",
    type: "tvet",
  },

  // TVET Colleges - North West
  {
    id: "orbit-tvet",
    name: "Orbit TVET College",
    shortName: "Orbit",
    logo: "https://via.placeholder.com/100/C0392B/FFFFFF?text=OR",
    type: "tvet",
  },
  {
    id: "taletso-tvet",
    name: "Taletso TVET College",
    shortName: "Taletso",
    logo: "https://via.placeholder.com/100/C0392B/FFFFFF?text=TL",
    type: "tvet",
  },
  {
    id: "vuselela-tvet",
    name: "Vuselela TVET College",
    shortName: "Vuselela",
    logo: "https://via.placeholder.com/100/C0392B/FFFFFF?text=VS",
    type: "tvet",
  },

  // TVET Colleges - Western Cape
  {
    id: "boland-tvet",
    name: "Boland TVET College",
    shortName: "Boland",
    logo: "https://via.placeholder.com/100/27AE60/FFFFFF?text=BL",
    type: "tvet",
  },
  {
    id: "college-of-cape-town-tvet",
    name: "College of Cape Town for TVET",
    shortName: "CCT",
    logo: "https://via.placeholder.com/100/27AE60/FFFFFF?text=CCT",
    type: "tvet",
  },
  {
    id: "false-bay-tvet",
    name: "False Bay TVET College",
    shortName: "False Bay",
    logo: "https://via.placeholder.com/100/27AE60/FFFFFF?text=FB",
    type: "tvet",
  },
  {
    id: "northlink-tvet",
    name: "Northlink TVET College",
    shortName: "Northlink",
    logo: "https://via.placeholder.com/100/27AE60/FFFFFF?text=NL",
    type: "tvet",
  },
  {
    id: "south-cape-tvet",
    name: "South Cape TVET College",
    shortName: "South Cape",
    logo: "https://via.placeholder.com/100/27AE60/FFFFFF?text=SC",
    type: "tvet",
  },
  {
    id: "west-coast-tvet",
    name: "West Coast TVET College",
    shortName: "West Coast",
    logo: "https://via.placeholder.com/100/27AE60/FFFFFF?text=WC",
    type: "tvet",
  },
];

// Helper function to get institution by ID
export const getInstitutionById = (id: string): Institution | undefined => {
  return SA_INSTITUTIONS.find((inst) => inst.id === id);
};

// Helper function to get institutions by type
export const getInstitutionsByType = (type: Institution["type"]): Institution[] => {
  return SA_INSTITUTIONS.filter((inst) => inst.type === type);
};
