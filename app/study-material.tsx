import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, FlatList, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

type Category = "all" | "textbooks" | "stationery" | "tech";
type Faculty = "all" | "engineering" | "business" | "science" | "arts" | "health" | "law";
type Year = "all" | "1" | "2" | "3" | "4";

type Product = {
  id: string;
  name: string;
  category: "textbooks" | "stationery" | "tech";
  faculty?: Faculty;
  year?: Year;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
  detailedDescription?: string;
  specifications?: string[];
};

type CartItem = Product & { quantity: number };

type Institution = {
  id: string;
  name: string;
  logo: string;
};

const INSTITUTIONS: Institution[] = [
  { id: "ub", name: "University of Botswana", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/University_of_Botswana_logo.svg/200px-University_of_Botswana_logo.svg.png" },
  { id: "uct", name: "University of Cape Town", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/University_of_Cape_Town_logo.svg/200px-University_of_Cape_Town_logo.svg.png" },
  { id: "wits", name: "University of the Witwatersrand", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/University_of_the_Witwatersrand_Logo.svg/200px-University_of_the_Witwatersrand_Logo.svg.png" },
  { id: "up", name: "University of Pretoria", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/36/University_of_Pretoria_logo.svg/200px-University_of_Pretoria_logo.svg.png" },
  { id: "sun", name: "Stellenbosch University", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Stellenbosch_University_Logo.svg/200px-Stellenbosch_University_Logo.svg.png" },
  { id: "ukzn", name: "University of KwaZulu-Natal", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/35/University_of_KwaZulu-Natal_logo.svg/200px-University_of_KwaZulu-Natal_logo.svg.png" },
];

const PRODUCTS: Product[] = [
  // Engineering Textbooks - Year 1
  {
    id: "eng-tb-1",
    name: "Engineering Mathematics I",
    category: "textbooks",
    faculty: "engineering",
    year: "1",
    price: 650,
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=500&fit=crop",
    description: "First-year engineering mathematics textbook",
    detailedDescription: "Comprehensive coverage of calculus, linear algebra, and differential equations for first-year engineering students. Includes worked examples and practice problems.",
    specifications: ["Author: K. A. Stroud", "Pages: 1264", "Edition: 7th", "ISBN: 978-1-352-01007-2"],
    inStock: true,
  },
  {
    id: "eng-tb-2",
    name: "Introduction to Engineering Design",
    category: "textbooks",
    faculty: "engineering",
    year: "1",
    price: 580,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=500&fit=crop",
    description: "Engineering design principles and methodology",
    detailedDescription: "Learn the fundamentals of engineering design process, problem-solving techniques, and project management for first-year students.",
    specifications: ["Author: Dym & Little", "Pages: 352", "Edition: 4th", "ISBN: 978-1-118-32458-5"],
    inStock: true,
  },
  {
    id: "eng-tb-3",
    name: "Physics for Engineers I",
    category: "textbooks",
    faculty: "engineering",
    year: "1",
    price: 720,
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=500&fit=crop",
    description: "Mechanics and thermodynamics for engineers",
    detailedDescription: "First-year physics covering mechanics, waves, thermodynamics, and their engineering applications.",
    specifications: ["Author: Serway & Jewett", "Pages: 1312", "Edition: 10th", "ISBN: 978-1-337-55320-7"],
    inStock: true,
  },

  // Engineering Textbooks - Year 2
  {
    id: "eng-tb-4",
    name: "Thermodynamics Fundamentals",
    category: "textbooks",
    faculty: "engineering",
    year: "2",
    price: 720,
    image: "https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=400&h=500&fit=crop",
    description: "Complete guide to thermodynamics principles",
    detailedDescription: "Advanced thermodynamics covering energy systems, heat transfer, and power cycles for second-year engineering students.",
    specifications: ["Author: Cengel & Boles", "Pages: 976", "Edition: 9th", "ISBN: 978-1-259-82267-4"],
    inStock: true,
  },
  {
    id: "eng-tb-5",
    name: "Circuit Analysis & Design",
    category: "textbooks",
    faculty: "engineering",
    year: "2",
    price: 680,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=500&fit=crop",
    description: "Electrical circuit theory and applications",
    detailedDescription: "Comprehensive coverage of AC/DC circuits, network theorems, and circuit design for electrical engineering students.",
    specifications: ["Author: Nilsson & Riedel", "Pages: 896", "Edition: 11th", "ISBN: 978-0-134-74698-4"],
    inStock: true,
  },

  // Engineering Textbooks - Year 3
  {
    id: "eng-tb-6",
    name: "Control Systems Engineering",
    category: "textbooks",
    faculty: "engineering",
    year: "3",
    price: 795,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=500&fit=crop",
    description: "Modern control systems theory and design",
    detailedDescription: "Third-year control systems covering feedback control, stability analysis, and digital control systems.",
    specifications: ["Author: Norman Nise", "Pages: 944", "Edition: 8th", "ISBN: 978-1-119-47422-7"],
    inStock: true,
  },

  // Business Textbooks - Year 1
  {
    id: "bus-tb-1",
    name: "Principles of Economics",
    category: "textbooks",
    faculty: "business",
    year: "1",
    price: 480,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=500&fit=crop",
    description: "Microeconomics and macroeconomics fundamentals",
    detailedDescription: "Introduction to economic principles, market structures, and macroeconomic policy for first-year business students.",
    specifications: ["Author: Mankiw", "Pages: 896", "Edition: 9th", "ISBN: 978-1-337-51671-5"],
    inStock: true,
  },
  {
    id: "bus-tb-2",
    name: "Introduction to Business Management",
    category: "textbooks",
    faculty: "business",
    year: "1",
    price: 520,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=500&fit=crop",
    description: "Fundamentals of business management",
    detailedDescription: "Comprehensive introduction to management principles, organizational behavior, and business operations.",
    specifications: ["Author: Robbins & Coulter", "Pages: 672", "Edition: 14th", "ISBN: 978-0-134-52760-4"],
    inStock: true,
  },

  // Business Textbooks - Year 2
  {
    id: "bus-tb-3",
    name: "Financial Accounting",
    category: "textbooks",
    faculty: "business",
    year: "2",
    price: 620,
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=500&fit=crop",
    description: "South African accounting standards and practices",
    detailedDescription: "Second-year financial accounting covering IFRS, financial statements, and South African tax principles.",
    specifications: ["Author: Greuning et al.", "Pages: 784", "Edition: 8th", "ISBN: 978-0-190-74532-1"],
    inStock: true,
  },
  {
    id: "bus-tb-4",
    name: "Marketing Management",
    category: "textbooks",
    faculty: "business",
    year: "2",
    price: 550,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop",
    description: "Modern marketing strategies and consumer behavior",
    detailedDescription: "Marketing principles, digital marketing, brand management, and consumer psychology for business students.",
    specifications: ["Author: Kotler & Keller", "Pages: 832", "Edition: 15th", "ISBN: 978-0-133-85646-0"],
    inStock: true,
  },

  // Business Textbooks - Year 3
  {
    id: "bus-tb-5",
    name: "Strategic Management",
    category: "textbooks",
    faculty: "business",
    year: "3",
    price: 695,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=500&fit=crop",
    description: "Corporate strategy and competitive advantage",
    detailedDescription: "Advanced strategic management covering competitive analysis, corporate governance, and strategic planning.",
    specifications: ["Author: Thompson et al.", "Pages: 896", "Edition: 22nd", "ISBN: 978-1-260-07547-0"],
    inStock: true,
  },

  // Science Textbooks - Year 1
  {
    id: "sci-tb-1",
    name: "General Chemistry",
    category: "textbooks",
    faculty: "science",
    year: "1",
    price: 590,
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=500&fit=crop",
    description: "Principles of chemistry with lab manual",
    detailedDescription: "First-year chemistry covering atomic structure, chemical bonding, stoichiometry, and basic organic chemistry.",
    specifications: ["Author: Zumdahl & Zumdahl", "Pages: 1184", "Edition: 10th", "ISBN: 978-1-305-95748-3"],
    inStock: true,
  },
  {
    id: "sci-tb-2",
    name: "General Biology",
    category: "textbooks",
    faculty: "science",
    year: "1",
    price: 510,
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=500&fit=crop",
    description: "Comprehensive biology textbook with illustrations",
    detailedDescription: "Introduction to cell biology, genetics, evolution, and ecology for first-year science students.",
    specifications: ["Author: Campbell et al.", "Pages: 1488", "Edition: 12th", "ISBN: 978-0-135-18813-2"],
    inStock: true,
  },

  // Science Textbooks - Year 2
  {
    id: "sci-tb-3",
    name: "Organic Chemistry",
    category: "textbooks",
    faculty: "science",
    year: "2",
    price: 690,
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=500&fit=crop",
    description: "Complete guide to organic chemistry",
    detailedDescription: "Second-year organic chemistry covering reaction mechanisms, synthesis, and spectroscopy.",
    specifications: ["Author: Wade", "Pages: 1280", "Edition: 9th", "ISBN: 978-0-134-16203-0"],
    inStock: true,
  },

  // Arts & Humanities Textbooks - Year 1
  {
    id: "arts-tb-1",
    name: "Introduction to Psychology",
    category: "textbooks",
    faculty: "arts",
    year: "1",
    price: 450,
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=500&fit=crop",
    description: "Comprehensive psychology textbook for first-year students",
    detailedDescription: "Introduction to psychological principles, research methods, and major psychological theories.",
    specifications: ["Author: Myers & DeWall", "Pages: 896", "Edition: 13th", "ISBN: 978-1-319-13224-5"],
    inStock: true,
  },
  {
    id: "arts-tb-2",
    name: "Sociology: A Global Perspective",
    category: "textbooks",
    faculty: "arts",
    year: "1",
    price: 420,
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=500&fit=crop",
    description: "Understanding society and social structures",
    detailedDescription: "First-year sociology covering social institutions, inequality, culture, and globalization.",
    specifications: ["Author: Macionis", "Pages: 672", "Edition: 17th", "ISBN: 978-0-134-73217-8"],
    inStock: true,
  },

  // Health Sciences Textbooks - Year 1
  {
    id: "health-tb-1",
    name: "Human Anatomy & Physiology",
    category: "textbooks",
    faculty: "health",
    year: "1",
    price: 750,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=500&fit=crop",
    description: "Detailed anatomy and physiology with full-color illustrations",
    detailedDescription: "First-year anatomy and physiology covering all body systems with detailed diagrams and clinical applications.",
    specifications: ["Author: Marieb & Hoehn", "Pages: 1248", "Edition: 11th", "ISBN: 978-0-134-58076-6"],
    inStock: true,
  },
  {
    id: "health-tb-2",
    name: "Medical Microbiology",
    category: "textbooks",
    faculty: "health",
    year: "2",
    price: 680,
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=500&fit=crop",
    description: "Microbiology for health science students",
    detailedDescription: "Second-year microbiology covering bacteria, viruses, fungi, and parasites with clinical relevance.",
    specifications: ["Author: Murray et al.", "Pages: 960", "Edition: 9th", "ISBN: 978-0-323-67324-0"],
    inStock: true,
  },

  // Law Textbooks - Year 1
  {
    id: "law-tb-1",
    name: "Introduction to South African Law",
    category: "textbooks",
    faculty: "law",
    year: "1",
    price: 520,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=500&fit=crop",
    description: "Fundamentals of South African legal system",
    detailedDescription: "First-year law covering the South African legal system, sources of law, and basic legal principles.",
    specifications: ["Author: Du Plessis et al.", "Pages: 512", "Edition: 6th", "ISBN: 978-0-190-41234-5"],
    inStock: true,
  },
  {
    id: "law-tb-2",
    name: "Constitutional Law",
    category: "textbooks",
    faculty: "law",
    year: "2",
    price: 650,
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&h=500&fit=crop",
    description: "South African constitutional law and human rights",
    detailedDescription: "Second-year constitutional law covering the Constitution, Bill of Rights, and constitutional litigation.",
    specifications: ["Author: Currie & De Waal", "Pages: 896", "Edition: 2nd", "ISBN: 978-0-702-18894-7"],
    inStock: true,
  },

  // Stationery Items
  {
    id: "stat-1",
    name: "A4 Notebook Pack (5)",
    category: "stationery",
    price: 85,
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=500&fit=crop",
    description: "5 ruled A4 notebooks, 200 pages each",
    detailedDescription: "Premium quality A4 notebooks with durable covers. Perfect for lectures and note-taking. 200 pages per notebook, ruled lines.",
    specifications: ["Size: A4 (210 x 297mm)", "Pages: 200 per notebook", "Quantity: 5 notebooks", "Ruling: Feint ruled"],
    inStock: true,
  },
  {
    id: "stat-2",
    name: "Pen Set (12 Pack)",
    category: "stationery",
    price: 45,
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=500&fit=crop",
    description: "Blue and black ballpoint pens",
    detailedDescription: "Smooth-writing ballpoint pens in blue and black. Comfortable grip, reliable ink flow. Pack of 12 pens (6 blue, 6 black).",
    specifications: ["Type: Ballpoint", "Colors: Blue & Black", "Quantity: 12 pens", "Tip size: 0.7mm"],
    inStock: true,
  },
  {
    id: "stat-3",
    name: "Scientific Calculator",
    category: "stationery",
    price: 250,
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=500&fit=crop",
    description: "Casio FX-82ZA PLUS II scientific calculator",
    detailedDescription: "Official South African curriculum calculator. 252 functions including statistics, trigonometry, and calculus. Solar and battery powered.",
    specifications: ["Model: Casio FX-82ZA PLUS II", "Functions: 252", "Display: 2-line natural textbook", "Power: Solar + Battery"],
    inStock: true,
  },
  {
    id: "stat-4",
    name: "Highlighter Set (6)",
    category: "stationery",
    price: 55,
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=500&fit=crop",
    description: "Assorted color highlighters",
    detailedDescription: "Vibrant highlighters in 6 colors: yellow, green, blue, pink, orange, and purple. Chisel tip for thick and thin lines.",
    specifications: ["Colors: 6 assorted", "Tip: Chisel", "Quantity: 6 highlighters", "Features: Fade-resistant ink"],
    inStock: true,
  },
  {
    id: "stat-5",
    name: "A4 Paper Ream",
    category: "stationery",
    price: 120,
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=500&fit=crop",
    description: "500 sheets of premium A4 paper",
    detailedDescription: "High-quality 80gsm A4 copy paper. Suitable for printing, photocopying, and writing. Bright white finish.",
    specifications: ["Size: A4 (210 x 297mm)", "Weight: 80gsm", "Quantity: 500 sheets", "Whiteness: 95%"],
    inStock: true,
  },
  {
    id: "stat-6",
    name: "Geometry Set",
    category: "stationery",
    price: 75,
    image: "https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=400&h=500&fit=crop",
    description: "Complete geometry set with compass and protractor",
    detailedDescription: "8-piece geometry set including compass, protractor, 30cm ruler, set squares, pencil, eraser, and sharpener. Durable plastic case.",
    specifications: ["Pieces: 8", "Includes: Compass, protractor, rulers", "Material: Metal & plastic", "Case: Hard plastic"],
    inStock: true,
  },
  {
    id: "stat-7",
    name: "Sticky Notes Pack",
    category: "stationery",
    price: 35,
    image: "https://images.unsplash.com/photo-1599492906227-c4c5e5a4b7c8?w=400&h=500&fit=crop",
    description: "Assorted color sticky notes, 6 pads",
    detailedDescription: "Colorful sticky notes for organizing and marking important information. 6 pads in different colors, 100 sheets per pad.",
    specifications: ["Pads: 6", "Sheets per pad: 100", "Size: 76 x 76mm", "Colors: Assorted"],
    inStock: true,
  },
  {
    id: "stat-8",
    name: "Ring Binder A4 (Pack of 3)",
    category: "stationery",
    price: 95,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=500&fit=crop",
    description: "Durable 4-ring binders for organizing notes",
    detailedDescription: "Heavy-duty A4 ring binders with 4 D-rings. Clear pocket on front cover for customization. Pack of 3 in assorted colors.",
    specifications: ["Size: A4", "Rings: 4 D-rings (25mm)", "Quantity: 3 binders", "Features: Clear front pocket"],
    inStock: true,
  },
  {
    id: "stat-9",
    name: "Pencil Case",
    category: "stationery",
    price: 65,
    image: "https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=400&h=500&fit=crop",
    description: "Large capacity pencil case with compartments",
    detailedDescription: "Spacious pencil case with multiple compartments for organizing stationery. Durable canvas material with zipper closure.",
    specifications: ["Material: Canvas", "Compartments: 3", "Size: 22 x 11 x 5cm", "Closure: Double zipper"],
    inStock: true,
  },
  {
    id: "stat-10",
    name: "Correction Tape (Pack of 3)",
    category: "stationery",
    price: 42,
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=500&fit=crop",
    description: "White correction tape for clean corrections",
    detailedDescription: "Easy-to-use correction tape for instant corrections. No drying time needed. Pack of 3 tapes, 5mm x 8m each.",
    specifications: ["Width: 5mm", "Length: 8m per tape", "Quantity: 3 tapes", "Features: Instant dry"],
    inStock: true,
  },

  // Tech & Digital Devices
  {
    id: "tech-1",
    name: "Dell Latitude 3520 Laptop",
    category: "tech",
    price: 12500,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=500&fit=crop",
    description: "15.6\" laptop with Intel i5, 8GB RAM, 256GB SSD",
    detailedDescription: "Professional student laptop with Intel Core i5 11th Gen processor, 8GB DDR4 RAM, 256GB SSD storage. Perfect for assignments, research, and online learning. Windows 11 Pro included.",
    specifications: ["Processor: Intel Core i5-1135G7", "RAM: 8GB DDR4", "Storage: 256GB SSD", "Display: 15.6\" FHD (1920x1080)", "OS: Windows 11 Pro", "Battery: Up to 8 hours"],
    inStock: true,
  },
  {
    id: "tech-2",
    name: "HP 14s Laptop",
    category: "tech",
    price: 9800,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=500&fit=crop",
    description: "14\" lightweight laptop with AMD Ryzen 5, 8GB RAM",
    detailedDescription: "Compact and portable laptop ideal for students. AMD Ryzen 5 processor, 8GB RAM, 512GB SSD. Lightweight design for easy carrying between classes.",
    specifications: ["Processor: AMD Ryzen 5 5500U", "RAM: 8GB DDR4", "Storage: 512GB SSD", "Display: 14\" FHD", "Weight: 1.46kg", "OS: Windows 11 Home"],
    inStock: true,
  },
  {
    id: "tech-3",
    name: "Lenovo IdeaPad 3",
    category: "tech",
    price: 8500,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=500&fit=crop",
    description: "Budget-friendly 15.6\" laptop for students",
    detailedDescription: "Affordable laptop for everyday student tasks. Intel Core i3 processor, 4GB RAM (upgradeable), 256GB SSD. Great for document editing and web browsing.",
    specifications: ["Processor: Intel Core i3-1115G4", "RAM: 4GB DDR4 (upgradeable)", "Storage: 256GB SSD", "Display: 15.6\" HD", "OS: Windows 11 Home"],
    inStock: true,
  },
  {
    id: "tech-4",
    name: "Apple MacBook Air M1",
    category: "tech",
    price: 18999,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=500&fit=crop",
    description: "13.3\" MacBook Air with M1 chip, 8GB RAM, 256GB SSD",
    detailedDescription: "Premium laptop with Apple M1 chip for exceptional performance and battery life. Perfect for creative students and demanding applications. Includes macOS.",
    specifications: ["Processor: Apple M1 chip", "RAM: 8GB unified memory", "Storage: 256GB SSD", "Display: 13.3\" Retina (2560x1600)", "Battery: Up to 18 hours", "OS: macOS"],
    inStock: true,
  },
  {
    id: "tech-5",
    name: "Samsung Galaxy Tab S8",
    category: "tech",
    price: 11500,
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=500&fit=crop",
    description: "11\" Android tablet with S Pen included",
    detailedDescription: "Versatile tablet for note-taking and reading. Includes S Pen for handwriting and drawing. 8GB RAM, 128GB storage, expandable via microSD.",
    specifications: ["Display: 11\" LCD (2560x1600)", "Processor: Snapdragon 8 Gen 1", "RAM: 8GB", "Storage: 128GB (expandable)", "Includes: S Pen", "OS: Android 12"],
    inStock: true,
  },
  {
    id: "tech-6",
    name: "iPad 10th Gen (2022)",
    category: "tech",
    price: 7999,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=500&fit=crop",
    description: "10.9\" iPad with A14 Bionic chip, 64GB",
    detailedDescription: "Latest iPad with A14 Bionic chip for smooth performance. Perfect for note-taking with Apple Pencil (sold separately), reading textbooks, and multimedia.",
    specifications: ["Display: 10.9\" Liquid Retina", "Processor: A14 Bionic", "Storage: 64GB", "Camera: 12MP rear, 12MP front", "OS: iPadOS 16"],
    inStock: true,
  },
  {
    id: "tech-7",
    name: "USB Flash Drive 64GB (Pack of 2)",
    category: "tech",
    price: 180,
    image: "https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=400&h=500&fit=crop",
    description: "High-speed USB 3.0 flash drives",
    detailedDescription: "Fast and reliable USB 3.0 flash drives for storing and transferring files. Pack of 2 drives, 64GB each. Compatible with Windows, Mac, and Linux.",
    specifications: ["Capacity: 64GB each", "Quantity: 2 drives", "Interface: USB 3.0", "Speed: Up to 100MB/s read"],
    inStock: true,
  },
  {
    id: "tech-8",
    name: "Wireless Mouse",
    category: "tech",
    price: 180,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=500&fit=crop",
    description: "Ergonomic wireless mouse with USB receiver",
    detailedDescription: "Comfortable wireless mouse with ergonomic design. 2.4GHz wireless connection, adjustable DPI, long battery life. Includes USB receiver.",
    specifications: ["Connection: 2.4GHz wireless", "DPI: 800/1200/1600", "Battery: 1 AA (included)", "Range: Up to 10m", "Compatibility: Windows, Mac, Linux"],
    inStock: true,
  },
  {
    id: "tech-9",
    name: "Laptop Stand Aluminum",
    category: "tech",
    price: 320,
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=500&fit=crop",
    description: "Adjustable aluminum laptop stand",
    detailedDescription: "Ergonomic laptop stand to improve posture and reduce neck strain. Adjustable height and angle, aluminum construction with anti-slip pads. Fits laptops up to 17\".",
    specifications: ["Material: Aluminum alloy", "Adjustable height: 6 levels", "Max load: 5kg", "Compatibility: 10-17\" laptops"],
    inStock: true,
  },
  {
    id: "tech-10",
    name: "Noise-Cancelling Headphones",
    category: "tech",
    price: 1250,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop",
    description: "Over-ear headphones with active noise cancellation",
    detailedDescription: "Premium wireless headphones with active noise cancellation. Perfect for studying in noisy environments. 30-hour battery life, Bluetooth 5.0, comfortable ear cushions.",
    specifications: ["Type: Over-ear", "ANC: Yes", "Battery: Up to 30 hours", "Connection: Bluetooth 5.0", "Features: Built-in mic, foldable"],
    inStock: true,
  },
  {
    id: "tech-11",
    name: "Webcam HD 1080p",
    category: "tech",
    price: 450,
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=500&fit=crop",
    description: "Full HD webcam with built-in microphone",
    detailedDescription: "High-quality webcam for online lectures and video calls. 1080p resolution at 30fps, built-in stereo microphones, auto light correction. USB plug-and-play.",
    specifications: ["Resolution: 1080p (1920x1080)", "Frame rate: 30fps", "Microphone: Stereo built-in", "Connection: USB 2.0", "Compatibility: Windows, Mac, Chrome OS"],
    inStock: true,
  },
  {
    id: "tech-12",
    name: "External Hard Drive 1TB",
    category: "tech",
    price: 850,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=500&fit=crop",
    description: "Portable external hard drive with USB 3.0",
    detailedDescription: "Reliable external storage for backing up assignments, projects, and media files. 1TB capacity, USB 3.0 for fast transfers, compact and portable design.",
    specifications: ["Capacity: 1TB", "Interface: USB 3.0", "Speed: Up to 5Gbps", "Size: 11.5 x 8 x 1.5cm", "Compatibility: Windows, Mac"],
    inStock: true,
  },
  {
    id: "tech-13",
    name: "Keyboard & Mouse Combo",
    category: "tech",
    price: 380,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=500&fit=crop",
    description: "Wireless keyboard and mouse combo set",
    detailedDescription: "Complete wireless keyboard and mouse set. Full-size keyboard with number pad, quiet keys, spill-resistant design. Includes wireless mouse and USB receiver.",
    specifications: ["Connection: 2.4GHz wireless", "Keyboard: Full-size, spill-resistant", "Mouse: 3-button optical", "Battery: Keyboard 2 AAA, Mouse 1 AA", "Range: Up to 10m"],
    inStock: true,
  },
  {
    id: "tech-14",
    name: "Laptop Backpack",
    category: "tech",
    price: 450,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop",
    description: "Padded laptop backpack with USB charging port",
    detailedDescription: "Durable backpack with dedicated padded laptop compartment (fits up to 15.6\"). Multiple pockets for organization, USB charging port, water-resistant material.",
    specifications: ["Laptop compartment: Up to 15.6\"", "Material: Water-resistant polyester", "Features: USB port, anti-theft pocket", "Capacity: 25L"],
    inStock: true,
  },
  {
    id: "tech-15",
    name: "Portable Power Bank 20000mAh",
    category: "tech",
    price: 380,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=500&fit=crop",
    description: "High-capacity power bank with fast charging",
    detailedDescription: "Keep your devices charged throughout the day. 20000mAh capacity, dual USB outputs, USB-C input/output, LED display showing remaining power.",
    specifications: ["Capacity: 20000mAh", "Input: USB-C 18W", "Output: 2x USB-A, 1x USB-C", "Features: LED display, fast charging"],
    inStock: true,
  },
];

const CATEGORIES = [
  { key: "all" as Category, label: "All Categories", icon: "square.grid.2x2" },
  { key: "textbooks" as Category, label: "Textbooks", icon: "book.fill" },
  { key: "stationery" as Category, label: "Stationery", icon: "pencil" },
  { key: "tech" as Category, label: "Tech & Devices", icon: "laptopcomputer" },
];

const FACULTIES = [
  { key: "all" as Faculty, label: "All Faculties" },
  { key: "engineering" as Faculty, label: "Engineering" },
  { key: "business" as Faculty, label: "Business" },
  { key: "science" as Faculty, label: "Science" },
  { key: "arts" as Faculty, label: "Arts" },
  { key: "health" as Faculty, label: "Health" },
  { key: "law" as Faculty, label: "Law" },
];

const YEARS = [
  { key: "all" as Year, label: "All Years" },
  { key: "1" as Year, label: "Year 1" },
  { key: "2" as Year, label: "Year 2" },
  { key: "3" as Year, label: "Year 3" },
  { key: "4" as Year, label: "Year 4" },
];

export default function StudyMaterialScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty>("all");
  const [selectedYear, setSelectedYear] = useState<Year>("all");
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesFaculty = selectedFaculty === "all" || product.faculty === selectedFaculty;
    const matchesYear = selectedYear === "all" || product.year === selectedYear;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesFaculty && matchesYear && matchesSearch;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    Toast.show({
      type: "success",
      text1: "Added to Cart",
      text2: product.name,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map((item) => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter((item) => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 50 : 0;
  const total = cartTotal + deliveryFee;

  const handleCheckout = () => {
    router.push("/study-material-checkout" as any);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => setSelectedProduct(item)}
      className="mb-4 rounded-2xl overflow-hidden bg-surface"
      style={{
        width: CARD_WIDTH,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: CARD_WIDTH, height: CARD_WIDTH * 0.85 }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View className="p-3">
        <Text className="text-sm font-bold text-foreground mb-1" numberOfLines={2}>
          {item.name}
        </Text>
        <Text className="text-xs text-muted mb-2" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-primary">R{item.price.toFixed(2)}</Text>
          {item.inStock ? (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                addToCart(item);
              }}
              className="bg-primary rounded-full p-2"
            >
              <IconSymbol name="plus" size={16} color="white" />
            </TouchableOpacity>
          ) : (
            <Text className="text-xs text-error font-semibold">Out of Stock</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const selectedCategoryLabel = CATEGORIES.find(c => c.key === selectedCategory)?.label || "All Categories";
  const selectedFacultyLabel = FACULTIES.find(f => f.key === selectedFaculty)?.label || "All Faculties";
  const selectedYearLabel = YEARS.find(y => y.key === selectedYear)?.label || "All Years";
  const selectedInstitutionData = INSTITUTIONS.find(i => i.id === selectedInstitution);

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Marketplace-Style Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground mb-1">
              Study Material
            </Text>
            <Text className="text-sm text-muted-foreground">
              Textbooks, stationery & tech essentials
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setShowCart(true)}
              className="w-10 h-10 rounded-full bg-muted items-center justify-center relative"
            >
              <IconSymbol name="cart.fill" size={18} color={colors.primary} />
              {cart.length > 0 && (
                <View className="absolute -top-1 -right-1 bg-primary rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">{cart.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-muted items-center justify-center"
            >
              <IconSymbol name="xmark" size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View
          className="bg-surface rounded-2xl px-5 py-4 flex-row items-center gap-3 mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
          }}
        >
          <IconSymbol name="magnifyingglass" size={22} color={colors.muted} />
          <TextInput
            placeholder="Search for products..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-base text-foreground"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Institution Selector */}
        <TouchableOpacity
          onPress={() => setShowInstitutionModal(true)}
          className="bg-white border-2 border-gray-200 rounded-2xl px-5 py-4 flex-row items-center justify-between mb-4"
        >
          {selectedInstitutionData ? (
            <View className="flex-row items-center gap-3 flex-1">
              <Image
                source={{ uri: selectedInstitutionData.logo }}
                style={{ width: 32, height: 32 }}
                contentFit="contain"
              />
              <Text className="text-base font-semibold text-gray-900 flex-1" numberOfLines={1}>
                {selectedInstitutionData.name}
              </Text>
            </View>
          ) : (
            <Text className="text-base font-semibold text-gray-900">Select Institution</Text>
          )}
          <IconSymbol name="chevron.down" size={20} color="#1f2937" />
        </TouchableOpacity>

        {/* 3 Horizontal Dropdowns */}
        <View className="flex-row gap-3 mb-6">
          {/* Category Dropdown */}
          <TouchableOpacity
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
          >
            <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
              {selectedCategoryLabel}
            </Text>
            <IconSymbol name="chevron.down" size={16} color="#1f2937" />
          </TouchableOpacity>

          {/* Faculty Dropdown */}
          {(selectedCategory === "textbooks" || selectedCategory === "all") && (
            <TouchableOpacity
              onPress={() => setShowFacultyDropdown(!showFacultyDropdown)}
              className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                {selectedFacultyLabel}
              </Text>
              <IconSymbol name="chevron.down" size={16} color="#1f2937" />
            </TouchableOpacity>
          )}

          {/* Year Dropdown */}
          {(selectedCategory === "textbooks" || selectedCategory === "all") && (
            <TouchableOpacity
              onPress={() => setShowYearDropdown(!showYearDropdown)}
              className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                {selectedYearLabel}
              </Text>
              <IconSymbol name="chevron.down" size={16} color="#1f2937" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Dropdown Menu */}
        {showCategoryDropdown && (
          <View className="bg-white border-2 border-gray-200 rounded-xl mb-4 overflow-hidden">
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                onPress={() => {
                  setSelectedCategory(category.key);
                  setShowCategoryDropdown(false);
                  if (category.key !== "textbooks" && category.key !== "all") {
                    setSelectedFaculty("all");
                    setSelectedYear("all");
                  }
                }}
                className={`px-4 py-3 flex-row items-center gap-3 ${
                  selectedCategory === category.key ? "bg-primary/10" : ""
                }`}
              >
                <IconSymbol
                  name={category.icon as any}
                  size={18}
                  color={selectedCategory === category.key ? colors.primary : "#1f2937"}
                />
                <Text
                  className={`text-base font-semibold ${
                    selectedCategory === category.key ? "text-primary" : "text-gray-900"
                  }`}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Faculty Dropdown Menu */}
        {showFacultyDropdown && (selectedCategory === "textbooks" || selectedCategory === "all") && (
          <View className="bg-white border-2 border-gray-200 rounded-xl mb-4 overflow-hidden">
            {FACULTIES.map((faculty) => (
              <TouchableOpacity
                key={faculty.key}
                onPress={() => {
                  setSelectedFaculty(faculty.key);
                  setShowFacultyDropdown(false);
                }}
                className={`px-4 py-3 ${selectedFaculty === faculty.key ? "bg-secondary/10" : ""}`}
              >
                <Text
                  className={`text-base font-semibold ${
                    selectedFaculty === faculty.key ? "text-secondary" : "text-gray-900"
                  }`}
                >
                  {faculty.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Year Dropdown Menu */}
        {showYearDropdown && (selectedCategory === "textbooks" || selectedCategory === "all") && (
          <View className="bg-white border-2 border-gray-200 rounded-xl mb-4 overflow-hidden">
            {YEARS.map((year) => (
              <TouchableOpacity
                key={year.key}
                onPress={() => {
                  setSelectedYear(year.key);
                  setShowYearDropdown(false);
                }}
                className={`px-4 py-3 ${selectedYear === year.key ? "bg-accent/10" : ""}`}
              >
                <Text
                  className={`text-base font-semibold ${
                    selectedYear === year.key ? "text-accent" : "text-gray-900"
                  }`}
                >
                  {year.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <IconSymbol name="tray" size={64} color={colors.muted} />
            <Text className="text-xl font-bold text-foreground mt-4 mb-2">No products found</Text>
            <Text className="text-base text-muted-foreground text-center">
              Try adjusting your filters or search query
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          />
        )}

        {/* Institution Modal */}
        <Modal visible={showInstitutionModal} animationType="slide" transparent>
          <View className="flex-1 bg-black/50">
            <View className="flex-1 mt-20 bg-background rounded-t-3xl">
              <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
                <Text className="text-xl font-bold text-foreground">Select Institution</Text>
                <TouchableOpacity onPress={() => setShowInstitutionModal(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 px-4 py-4">
                {INSTITUTIONS.map((institution) => (
                  <TouchableOpacity
                    key={institution.id}
                    onPress={() => {
                      setSelectedInstitution(institution.id);
                      setShowInstitutionModal(false);
                      Toast.show({
                        type: "success",
                        text1: "Institution Selected",
                        text2: institution.name,
                      });
                    }}
                    className={`bg-surface rounded-xl p-4 mb-3 flex-row items-center gap-4 border ${
                      selectedInstitution === institution.id ? "border-primary" : "border-border"
                    }`}
                  >
                    <Image
                      source={{ uri: institution.logo }}
                      style={{ width: 48, height: 48 }}
                      contentFit="contain"
                    />
                    <Text className="text-base font-semibold text-foreground flex-1">
                      {institution.name}
                    </Text>
                    {selectedInstitution === institution.id && (
                      <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Product Detail Modal */}
        <Modal visible={!!selectedProduct} animationType="slide" transparent>
          <View className="flex-1 bg-black/50">
            <View className="flex-1 mt-20 bg-background rounded-t-3xl">
              {selectedProduct && (
                <>
                  <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
                    <Text className="text-xl font-bold text-foreground">Product Details</Text>
                    <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                      <IconSymbol name="xmark" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView className="flex-1">
                    <Image
                      source={{ uri: selectedProduct.image }}
                      style={{ width: "100%", height: 300 }}
                      contentFit="cover"
                    />
                    <View className="p-4 gap-4">
                      <View>
                        <Text className="text-2xl font-bold text-foreground mb-2">
                          {selectedProduct.name}
                        </Text>
                        <Text className="text-3xl font-bold text-primary mb-2">
                          R{selectedProduct.price.toFixed(2)}
                        </Text>
                        {selectedProduct.inStock ? (
                          <View className="flex-row items-center gap-2">
                            <View className="w-2 h-2 rounded-full bg-success" />
                            <Text className="text-success font-semibold">In Stock</Text>
                          </View>
                        ) : (
                          <View className="flex-row items-center gap-2">
                            <View className="w-2 h-2 rounded-full bg-error" />
                            <Text className="text-error font-semibold">Out of Stock</Text>
                          </View>
                        )}
                      </View>

                      <View>
                        <Text className="text-lg font-bold text-foreground mb-2">Description</Text>
                        <Text className="text-base text-muted leading-6">
                          {selectedProduct.detailedDescription || selectedProduct.description}
                        </Text>
                      </View>

                      {selectedProduct.specifications && selectedProduct.specifications.length > 0 && (
                        <View>
                          <Text className="text-lg font-bold text-foreground mb-2">Specifications</Text>
                          <View className="bg-surface rounded-xl p-3 border border-border gap-2">
                            {selectedProduct.specifications.map((spec, index) => (
                              <View key={index} className="flex-row items-start gap-2">
                                <Text className="text-primary mt-1">•</Text>
                                <Text className="text-foreground flex-1">{spec}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {selectedProduct.category === "textbooks" && (
                        <View className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                          <View className="flex-row items-center gap-2 mb-2">
                            <IconSymbol name="info.circle.fill" size={20} color="#3b82f6" />
                            <Text className="text-blue-600 font-semibold">Textbook Information</Text>
                          </View>
                          <Text className="text-blue-600 text-sm">
                            Faculty: {FACULTIES.find(f => f.key === selectedProduct.faculty)?.label || "N/A"}
                          </Text>
                          <Text className="text-blue-600 text-sm">
                            Year: {selectedProduct.year ? `Year ${selectedProduct.year}` : "N/A"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </ScrollView>

                  {selectedProduct.inStock && (
                    <View className="px-4 py-4 border-t border-border">
                      <TouchableOpacity
                        onPress={() => {
                          addToCart(selectedProduct);
                          setSelectedProduct(null);
                        }}
                        className="bg-primary py-4 rounded-xl items-center"
                      >
                        <Text className="text-white font-bold text-lg">Add to Cart</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Cart Modal */}
        <Modal visible={showCart} animationType="slide" transparent>
          <View className="flex-1 bg-black/50">
            <View className="flex-1 mt-20 bg-background rounded-t-3xl">
              <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
                <Text className="text-xl font-bold text-foreground">Shopping Cart</Text>
                <TouchableOpacity onPress={() => setShowCart(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 px-4 py-4">
                {cart.length === 0 ? (
                  <View className="items-center justify-center py-12">
                    <IconSymbol name="cart" size={64} color={colors.muted} />
                    <Text className="text-muted mt-4">Your cart is empty</Text>
                  </View>
                ) : (
                  cart.map((item) => (
                    <View
                      key={item.id}
                      className="bg-surface rounded-xl p-3 mb-3 flex-row gap-3 border border-border"
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: 80, height: 80, borderRadius: 8 }}
                        contentFit="cover"
                      />
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-foreground mb-1">{item.name}</Text>
                        <Text className="text-lg font-bold text-primary mb-2">
                          R{(item.price * item.quantity).toFixed(2)}
                        </Text>
                        <View className="flex-row items-center gap-3">
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.id, -1)}
                            className="bg-surface border border-border rounded-full w-8 h-8 items-center justify-center"
                          >
                            <IconSymbol name="minus" size={14} color={colors.foreground} />
                          </TouchableOpacity>
                          <Text className="text-foreground font-semibold">{item.quantity}</Text>
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.id, 1)}
                            className="bg-primary rounded-full w-8 h-8 items-center justify-center"
                          >
                            <IconSymbol name="plus" size={14} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => removeFromCart(item.id)}
                            className="ml-auto"
                          >
                            <IconSymbol name="trash" size={18} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>

              {cart.length > 0 && (
                <View className="px-4 py-4 border-t border-border">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-foreground">Subtotal</Text>
                    <Text className="text-foreground font-semibold">R{cartTotal.toFixed(2)}</Text>
                  </View>
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-foreground">Delivery Fee</Text>
                    <Text className="text-foreground font-semibold">R{deliveryFee.toFixed(2)}</Text>
                  </View>
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-lg font-bold text-foreground">Total</Text>
                    <Text className="text-lg font-bold text-primary">R{total.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleCheckout}
                    className="bg-primary py-4 rounded-xl items-center"
                  >
                    <Text className="text-white font-bold text-lg">Proceed to Checkout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}
