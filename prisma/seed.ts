import "dotenv/config";
import { PrismaClient, CollegeType, DegreeType, ExamCategory } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clean existing data
  await prisma.collegeExamCutoff.deleteMany();
  await prisma.review.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.course.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.college.deleteMany();

  console.log("🧹 Cleaned existing data\n");

  // ─── Create Exams ────────────────────────────────────────────────
  const exams = await Promise.all([
    prisma.exam.create({
      data: {
        name: "JEE Main",
        fullName: "Joint Entrance Examination Main",
        category: ExamCategory.ENGINEERING,
      },
    }),
    prisma.exam.create({
      data: {
        name: "JEE Advanced",
        fullName: "Joint Entrance Examination Advanced",
        category: ExamCategory.ENGINEERING,
      },
    }),
    prisma.exam.create({
      data: {
        name: "CAT",
        fullName: "Common Admission Test",
        category: ExamCategory.MANAGEMENT,
      },
    }),
    prisma.exam.create({
      data: {
        name: "NEET",
        fullName: "National Eligibility cum Entrance Test",
        category: ExamCategory.MEDICAL,
      },
    }),
    prisma.exam.create({
      data: {
        name: "CLAT",
        fullName: "Common Law Admission Test",
        category: ExamCategory.LAW,
      },
    }),
    prisma.exam.create({
      data: {
        name: "BITSAT",
        fullName: "Birla Institute of Technology and Science Admission Test",
        category: ExamCategory.ENGINEERING,
      },
    }),
  ]);

  const examMap: Record<string, string> = {};
  for (const exam of exams) {
    examMap[exam.name] = exam.id;
  }

  console.log(`✅ Created ${exams.length} exams\n`);

  // ─── College Data ─────────────────────────────────────────────────
  const collegesData = [
    // IITs
    {
      name: "Indian Institute of Technology Bombay",
      city: "Mumbai",
      state: "Maharashtra",
      type: CollegeType.PUBLIC,
      description: "IIT Bombay is one of India's premier engineering institutions, consistently ranked among the top engineering colleges in Asia. Founded in 1958, it is known for its rigorous academic programs, world-class research facilities, and strong industry connections. The institute offers undergraduate, postgraduate, and doctoral programs across engineering, science, humanities, and management disciplines.",
      establishedYear: 1958,
      accreditation: "NAAC A++",
      rating: 4.8,
      totalStudents: 11000,
      acceptanceRate: 2.5,
      website: "https://www.iitb.ac.in",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 250000, seatsAvailable: 120, eligibility: "JEE Advanced qualified, 12th with PCM" },
        { name: "B.Tech Electrical Engineering", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 250000, seatsAvailable: 140, eligibility: "JEE Advanced qualified, 12th with PCM" },
        { name: "B.Tech Mechanical Engineering", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 250000, seatsAvailable: 140, eligibility: "JEE Advanced qualified, 12th with PCM" },
        { name: "M.Tech Computer Science", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 120000, seatsAvailable: 80, eligibility: "GATE qualified, B.Tech in relevant field" },
        { name: "MBA", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 950000, seatsAvailable: 40, eligibility: "CAT score, Bachelor's degree" },
      ],
      placements: [
        { year: 2024, averagePackage: 2300000, medianPackage: 2000000, highestPackage: 31000000, lowestPackage: 1200000, placementRate: 95, topRecruiters: ["Google", "Microsoft", "Goldman Sachs", "Apple", "Amazon"] },
        { year: 2023, averagePackage: 2100000, medianPackage: 1800000, highestPackage: 27000000, lowestPackage: 1100000, placementRate: 94, topRecruiters: ["Google", "Microsoft", "Adobe", "Samsung", "Flipkart"] },
      ],
      reviews: [
        { authorName: "Rahul Sharma", rating: 5, title: "Best Engineering College in India", content: "IIT Bombay offers an unparalleled academic experience. The faculty is exceptional, research opportunities are abundant, and the campus culture promotes innovation and critical thinking.", pros: "World-class faculty, excellent infrastructure, strong alumni network", cons: "Very competitive environment, limited hostel space", graduationYear: 2023, courseName: "B.Tech Computer Science" },
        { authorName: "Priya Patel", rating: 4.5, title: "Great academic experience", content: "The curriculum is rigorous but rewarding. Placement season is exciting with top companies visiting campus. The peer group is incredibly talented.", pros: "Top-tier placements, diverse course offerings", cons: "High academic pressure, Mumbai expenses", graduationYear: 2024, courseName: "B.Tech Electrical Engineering" },
      ],
      exams: ["JEE Advanced"],
      cutoffs: [
        { exam: "JEE Advanced", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 100, obcCutoffRank: 250, scCutoffRank: 500, stCutoffRank: 300 },
        { exam: "JEE Advanced", course: "B.Tech Electrical Engineering", year: 2024, generalCutoffRank: 500, obcCutoffRank: 900, scCutoffRank: 1500, stCutoffRank: 800 },
        { exam: "JEE Advanced", course: "B.Tech Mechanical Engineering", year: 2024, generalCutoffRank: 1000, obcCutoffRank: 2000, scCutoffRank: 3500, stCutoffRank: 2000 },
      ],
    },
    {
      name: "Indian Institute of Technology Delhi",
      city: "New Delhi",
      state: "Delhi",
      type: CollegeType.PUBLIC,
      description: "IIT Delhi is one of the oldest and most prestigious IITs in India. Established in 1961, it has consistently been ranked among the top technical institutions globally. Known for cutting-edge research and innovation, IIT Delhi produces leaders in technology, business, and academia.",
      establishedYear: 1961,
      accreditation: "NAAC A++",
      rating: 4.7,
      totalStudents: 9500,
      acceptanceRate: 3,
      website: "https://www.iitd.ac.in",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 240000, seatsAvailable: 85, eligibility: "JEE Advanced qualified" },
        { name: "B.Tech Electrical Engineering", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 240000, seatsAvailable: 120, eligibility: "JEE Advanced qualified" },
        { name: "M.Tech AI & ML", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 115000, seatsAvailable: 30, eligibility: "GATE qualified" },
        { name: "MBA", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 900000, seatsAvailable: 60, eligibility: "CAT score" },
      ],
      placements: [
        { year: 2024, averagePackage: 2250000, medianPackage: 1950000, highestPackage: 28000000, lowestPackage: 1150000, placementRate: 93, topRecruiters: ["Google", "Microsoft", "Amazon", "Uber", "Goldman Sachs"] },
        { year: 2023, averagePackage: 2050000, medianPackage: 1750000, highestPackage: 25000000, lowestPackage: 1050000, placementRate: 92, topRecruiters: ["Google", "Microsoft", "Adobe", "Samsung", "Qualcomm"] },
      ],
      reviews: [
        { authorName: "Amit Kumar", rating: 4.8, title: "Excellent institution with great opportunities", content: "IIT Delhi provides a comprehensive learning experience with excellent faculty and modern infrastructure. The placement cell is very active and ensures good opportunities for all students.", pros: "Strong alumni network, central location in Delhi", cons: "Hostel rooms could be better", graduationYear: 2024, courseName: "B.Tech Computer Science" },
      ],
      exams: ["JEE Advanced"],
      cutoffs: [
        { exam: "JEE Advanced", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 80, obcCutoffRank: 200, scCutoffRank: 400, stCutoffRank: 250 },
        { exam: "JEE Advanced", course: "B.Tech Electrical Engineering", year: 2024, generalCutoffRank: 400, obcCutoffRank: 800, scCutoffRank: 1300, stCutoffRank: 700 },
      ],
    },
    {
      name: "Indian Institute of Technology Madras",
      city: "Chennai",
      state: "Tamil Nadu",
      type: CollegeType.PUBLIC,
      description: "IIT Madras has been ranked as the top engineering institute in India for multiple consecutive years by NIRF. Established in 1959, it stands on a 620-acre campus inside the Guindy National Park, making it one of the most scenic campuses in the country. The institute is a pioneer in online education through NPTEL.",
      establishedYear: 1959,
      accreditation: "NAAC A++",
      rating: 4.9,
      totalStudents: 10000,
      acceptanceRate: 2,
      website: "https://www.iitm.ac.in",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 230000, seatsAvailable: 100, eligibility: "JEE Advanced qualified" },
        { name: "B.Tech Data Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 230000, seatsAvailable: 60, eligibility: "JEE Advanced qualified" },
        { name: "B.Tech Aerospace Engineering", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 230000, seatsAvailable: 50, eligibility: "JEE Advanced qualified" },
        { name: "M.Tech Machine Learning", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 110000, seatsAvailable: 25, eligibility: "GATE qualified" },
        { name: "PhD Computer Science", duration: "5 years", degreeType: DegreeType.PHD, fees: 50000, seatsAvailable: 30, eligibility: "M.Tech/MS with GATE" },
      ],
      placements: [
        { year: 2024, averagePackage: 2400000, medianPackage: 2100000, highestPackage: 35000000, lowestPackage: 1300000, placementRate: 96, topRecruiters: ["Google", "Microsoft", "Apple", "Qualcomm", "Texas Instruments"] },
        { year: 2023, averagePackage: 2200000, medianPackage: 1900000, highestPackage: 30000000, lowestPackage: 1200000, placementRate: 95, topRecruiters: ["Google", "Amazon", "Microsoft", "Intel", "Oracle"] },
      ],
      reviews: [
        { authorName: "Deepa Ramanathan", rating: 5, title: "Number 1 for a reason", content: "IIT Madras lives up to its top ranking. The research culture, campus environment, and academic rigor are unmatched. The deer in campus make studying even more enjoyable!", pros: "Beautiful campus, top research output, NPTEL courses", cons: "Chennai weather can be challenging", graduationYear: 2024, courseName: "B.Tech Computer Science" },
      ],
      exams: ["JEE Advanced"],
      cutoffs: [
        { exam: "JEE Advanced", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 120, obcCutoffRank: 300, scCutoffRank: 600, stCutoffRank: 350 },
        { exam: "JEE Advanced", course: "B.Tech Data Science", year: 2024, generalCutoffRank: 200, obcCutoffRank: 500, scCutoffRank: 900, stCutoffRank: 500 },
        { exam: "JEE Advanced", course: "B.Tech Aerospace Engineering", year: 2024, generalCutoffRank: 1500, obcCutoffRank: 3000, scCutoffRank: 5000, stCutoffRank: 3000 },
      ],
    },
    {
      name: "Indian Institute of Technology Kanpur",
      city: "Kanpur",
      state: "Uttar Pradesh",
      type: CollegeType.PUBLIC,
      description: "IIT Kanpur is known for its exceptional computer science and aerospace engineering programs. Founded in 1959 with the assistance of a consortium of American universities, IIT Kanpur was the first institute in India to offer Computer Science education.",
      establishedYear: 1959,
      accreditation: "NAAC A++",
      rating: 4.6,
      totalStudents: 8500,
      acceptanceRate: 3.5,
      website: "https://www.iitk.ac.in",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 235000, seatsAvailable: 90, eligibility: "JEE Advanced qualified" },
        { name: "B.Tech Aerospace Engineering", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 235000, seatsAvailable: 55, eligibility: "JEE Advanced qualified" },
        { name: "MBA", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 880000, seatsAvailable: 45, eligibility: "CAT score" },
      ],
      placements: [
        { year: 2024, averagePackage: 2100000, medianPackage: 1800000, highestPackage: 26000000, lowestPackage: 1000000, placementRate: 90, topRecruiters: ["Google", "Microsoft", "Adobe", "Tower Research", "DE Shaw"] },
      ],
      reviews: [
        { authorName: "Vikash Gupta", rating: 4.5, title: "Pioneer in Computer Science education", content: "IIT Kanpur's CS department is legendary. The theoretical foundations taught here are unmatched. Wonderful campus life with strong cultural activities.", pros: "Strong CS program, great campus culture", cons: "Kanpur city lacks amenities", graduationYear: 2023, courseName: "B.Tech Computer Science" },
      ],
      exams: ["JEE Advanced"],
      cutoffs: [
        { exam: "JEE Advanced", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 150, obcCutoffRank: 350, scCutoffRank: 700, stCutoffRank: 400 },
        { exam: "JEE Advanced", course: "B.Tech Aerospace Engineering", year: 2024, generalCutoffRank: 2000, obcCutoffRank: 4000, scCutoffRank: 7000, stCutoffRank: 4000 },
      ],
    },
    {
      name: "Indian Institute of Technology Kharagpur",
      city: "Kharagpur",
      state: "West Bengal",
      type: CollegeType.PUBLIC,
      description: "IIT Kharagpur is the oldest IIT, established in 1951. It has the largest campus among all IITs spanning 2,100 acres. Known for its diverse range of departments and interdisciplinary research, IIT Kharagpur has produced some of India's finest engineers and entrepreneurs.",
      establishedYear: 1951,
      accreditation: "NAAC A++",
      rating: 4.5,
      totalStudents: 12000,
      acceptanceRate: 4,
      website: "https://www.iitkgp.ac.in",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 220000, seatsAvailable: 80, eligibility: "JEE Advanced qualified" },
        { name: "B.Tech Electronics & Communication", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 220000, seatsAvailable: 100, eligibility: "JEE Advanced qualified" },
        { name: "Integrated M.Sc Mathematics", duration: "5 years", degreeType: DegreeType.MASTERS, fees: 200000, seatsAvailable: 60, eligibility: "JEE Advanced qualified" },
        { name: "MBA", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 850000, seatsAvailable: 120, eligibility: "CAT score" },
      ],
      placements: [
        { year: 2024, averagePackage: 2000000, medianPackage: 1700000, highestPackage: 24000000, lowestPackage: 950000, placementRate: 91, topRecruiters: ["Google", "Amazon", "JP Morgan", "McKinsey", "BCG"] },
      ],
      reviews: [
        { authorName: "Sourav Chatterjee", rating: 4.3, title: "The pioneer IIT experience", content: "Being the first IIT, Kharagpur has a rich heritage and diverse academic programs. The campus is massive with excellent facilities. Spring Fest is one of the biggest college festivals in Asia.", pros: "Largest IIT campus, diverse programs, strong heritage", cons: "Isolated location, limited city amenities", graduationYear: 2024, courseName: "B.Tech Computer Science" },
      ],
      exams: ["JEE Advanced"],
      cutoffs: [
        { exam: "JEE Advanced", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 250, obcCutoffRank: 600, scCutoffRank: 1000, stCutoffRank: 600 },
        { exam: "JEE Advanced", course: "B.Tech Electronics & Communication", year: 2024, generalCutoffRank: 800, obcCutoffRank: 1500, scCutoffRank: 2500, stCutoffRank: 1500 },
      ],
    },
    // NITs
    {
      name: "National Institute of Technology Tiruchirappalli",
      city: "Tiruchirappalli",
      state: "Tamil Nadu",
      type: CollegeType.PUBLIC,
      description: "NIT Trichy is considered the best NIT in India and has been consistently ranked among the top 10 engineering institutions. Established in 1964, it offers a wide range of undergraduate and postgraduate programs with excellent research facilities.",
      establishedYear: 1964,
      accreditation: "NAAC A+",
      rating: 4.3,
      totalStudents: 6500,
      acceptanceRate: 5,
      website: "https://www.nitt.edu",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 180000, seatsAvailable: 60, eligibility: "JEE Main qualified" },
        { name: "B.Tech Electronics & Communication", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 180000, seatsAvailable: 90, eligibility: "JEE Main qualified" },
        { name: "B.Tech Mechanical Engineering", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 180000, seatsAvailable: 120, eligibility: "JEE Main qualified" },
        { name: "M.Tech VLSI Design", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 80000, seatsAvailable: 20, eligibility: "GATE qualified" },
      ],
      placements: [
        { year: 2024, averagePackage: 1200000, medianPackage: 1000000, highestPackage: 15000000, lowestPackage: 600000, placementRate: 92, topRecruiters: ["Amazon", "Microsoft", "Samsung", "Infosys", "TCS"] },
      ],
      reviews: [
        { authorName: "Karthik Subramanian", rating: 4.2, title: "Best NIT in the country", content: "NIT Trichy offers great education at affordable fees. The faculty is knowledgeable and placements are consistent. Pragyan is one of the top technical festivals.", pros: "Affordable fees, strong placements, great technical fest", cons: "Campus could use better maintenance", graduationYear: 2024, courseName: "B.Tech Computer Science" },
      ],
      exams: ["JEE Main"],
      cutoffs: [
        { exam: "JEE Main", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 3000, obcCutoffRank: 8000, scCutoffRank: 15000, stCutoffRank: 8000 },
        { exam: "JEE Main", course: "B.Tech Electronics & Communication", year: 2024, generalCutoffRank: 8000, obcCutoffRank: 15000, scCutoffRank: 25000, stCutoffRank: 15000 },
        { exam: "JEE Main", course: "B.Tech Mechanical Engineering", year: 2024, generalCutoffRank: 15000, obcCutoffRank: 25000, scCutoffRank: 45000, stCutoffRank: 25000 },
      ],
    },
    {
      name: "National Institute of Technology Warangal",
      city: "Warangal",
      state: "Telangana",
      type: CollegeType.PUBLIC,
      description: "NIT Warangal is one of the top NITs in India, established in 1959 as a Regional Engineering College. It is known for its strong engineering programs and vibrant campus life. The institute has a 250-acre green campus with state-of-the-art facilities.",
      establishedYear: 1959,
      accreditation: "NAAC A+",
      rating: 4.2,
      totalStudents: 5500,
      acceptanceRate: 6,
      website: "https://www.nitw.ac.in",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 175000, seatsAvailable: 75, eligibility: "JEE Main qualified" },
        { name: "B.Tech Electronics & Communication", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 175000, seatsAvailable: 100, eligibility: "JEE Main qualified" },
        { name: "M.Tech Computer Science", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 75000, seatsAvailable: 25, eligibility: "GATE qualified" },
      ],
      placements: [
        { year: 2024, averagePackage: 1100000, medianPackage: 950000, highestPackage: 12000000, lowestPackage: 550000, placementRate: 89, topRecruiters: ["Amazon", "Google", "Infosys", "Wipro", "TCS"] },
      ],
      reviews: [
        { authorName: "Srinivas Reddy", rating: 4, title: "Solid NIT education", content: "NIT Warangal provides a great learning environment. The technical culture is strong and students actively participate in hackathons and competitions.", pros: "Good faculty, affordable, active coding culture", cons: "City infrastructure needs improvement", graduationYear: 2023, courseName: "B.Tech Computer Science" },
      ],
      exams: ["JEE Main"],
      cutoffs: [
        { exam: "JEE Main", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 5000, obcCutoffRank: 12000, scCutoffRank: 20000, stCutoffRank: 12000 },
        { exam: "JEE Main", course: "B.Tech Electronics & Communication", year: 2024, generalCutoffRank: 10000, obcCutoffRank: 20000, scCutoffRank: 35000, stCutoffRank: 20000 },
      ],
    },
    {
      name: "National Institute of Technology Surathkal",
      city: "Mangalore",
      state: "Karnataka",
      type: CollegeType.PUBLIC,
      description: "NITK Surathkal is a premier NIT located on the Arabian Sea coast. Known for its beautiful beachside campus and strong engineering programs, it attracts top talent from across India. The institute has excellent research output and industry connections.",
      establishedYear: 1960,
      accreditation: "NAAC A+",
      rating: 4.1,
      totalStudents: 5000,
      acceptanceRate: 7,
      website: "https://www.nitk.ac.in",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 170000, seatsAvailable: 70, eligibility: "JEE Main qualified" },
        { name: "B.Tech Information Technology", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 170000, seatsAvailable: 60, eligibility: "JEE Main qualified" },
        { name: "B.Tech Civil Engineering", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 170000, seatsAvailable: 100, eligibility: "JEE Main qualified" },
      ],
      placements: [
        { year: 2024, averagePackage: 1050000, medianPackage: 900000, highestPackage: 10000000, lowestPackage: 500000, placementRate: 88, topRecruiters: ["Google", "Amazon", "Infosys", "Oracle", "Cisco"] },
      ],
      reviews: [
        { authorName: "Ananya Rao", rating: 4.1, title: "Beautiful campus, great education", content: "NITK Surathkal has the best campus among all NITs. Located right next to the beach, it offers a unique learning environment. Academics are strong and placements are decent.", pros: "Beach campus, good infrastructure, peaceful environment", cons: "Remote location, limited public transport", graduationYear: 2024, courseName: "B.Tech Computer Science" },
      ],
      exams: ["JEE Main"],
      cutoffs: [
        { exam: "JEE Main", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 4500, obcCutoffRank: 10000, scCutoffRank: 18000, stCutoffRank: 10000 },
        { exam: "JEE Main", course: "B.Tech Information Technology", year: 2024, generalCutoffRank: 7000, obcCutoffRank: 14000, scCutoffRank: 25000, stCutoffRank: 14000 },
      ],
    },
    // IIMs
    {
      name: "Indian Institute of Management Ahmedabad",
      city: "Ahmedabad",
      state: "Gujarat",
      type: CollegeType.PUBLIC,
      description: "IIM Ahmedabad is India's premier business school, consistently ranked #1 for MBA programs in India. Founded in 1961, it pioneered the case study method of teaching in India. IIMA alumni lead major corporations worldwide and the institute is known for its rigorous academic standards.",
      establishedYear: 1961,
      accreditation: "AACSB, EQUIS, AMBA",
      rating: 4.9,
      totalStudents: 1200,
      acceptanceRate: 1,
      website: "https://www.iima.ac.in",
      courses: [
        { name: "MBA (PGP)", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 2800000, seatsAvailable: 400, eligibility: "CAT score, Bachelor's degree" },
        { name: "MBA (PGPX)", duration: "1 year", degreeType: DegreeType.MASTERS, fees: 3500000, seatsAvailable: 80, eligibility: "GMAT/GRE, 5+ years experience" },
        { name: "PhD Management", duration: "4 years", degreeType: DegreeType.PHD, fees: 100000, seatsAvailable: 25, eligibility: "CAT/GMAT, Master's degree preferred" },
      ],
      placements: [
        { year: 2024, averagePackage: 3500000, medianPackage: 3200000, highestPackage: 15000000, lowestPackage: 2200000, placementRate: 100, topRecruiters: ["McKinsey", "BCG", "Bain", "Goldman Sachs", "Amazon"] },
      ],
      reviews: [
        { authorName: "Neha Verma", rating: 5, title: "The Harvard of India", content: "IIM Ahmedabad lives up to its reputation. The case study methodology, peer learning, and placement outcomes are extraordinary. The network you build here is invaluable.", pros: "Best MBA brand in India, 100% placement, stellar alumni network", cons: "Extremely demanding workload, high pressure", graduationYear: 2024, courseName: "MBA (PGP)" },
      ],
      exams: ["CAT"],
      cutoffs: [
        { exam: "CAT", course: "MBA (PGP)", year: 2024, generalCutoffRank: 200, obcCutoffRank: 500, scCutoffRank: 1000, stCutoffRank: 600 },
      ],
    },
    {
      name: "Indian Institute of Management Bangalore",
      city: "Bangalore",
      state: "Karnataka",
      type: CollegeType.PUBLIC,
      description: "IIM Bangalore is among India's top 3 business schools, located in India's Silicon Valley. Established in 1973, IIMB is renowned for its strong emphasis on innovation, entrepreneurship, and technology management. The NSRCEL incubator has nurtured numerous successful startups.",
      establishedYear: 1973,
      accreditation: "AACSB, EQUIS",
      rating: 4.8,
      totalStudents: 1300,
      acceptanceRate: 1.5,
      website: "https://www.iimb.ac.in",
      courses: [
        { name: "MBA (PGP)", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 2650000, seatsAvailable: 450, eligibility: "CAT score, Bachelor's degree" },
        { name: "MBA (EPGP)", duration: "1 year", degreeType: DegreeType.MASTERS, fees: 3200000, seatsAvailable: 100, eligibility: "GMAT/GRE, 5+ years experience" },
      ],
      placements: [
        { year: 2024, averagePackage: 3400000, medianPackage: 3100000, highestPackage: 14500000, lowestPackage: 2100000, placementRate: 100, topRecruiters: ["McKinsey", "Amazon", "Google", "Accenture Strategy", "Deloitte"] },
      ],
      reviews: [
        { authorName: "Arjun Menon", rating: 4.8, title: "Tech meets management", content: "IIM Bangalore's location in the tech capital gives it a unique advantage. The entrepreneurship ecosystem is fantastic. Great exposure to tech companies and VCs.", pros: "Bangalore location, entrepreneurship focus, tech exposure", cons: "Heavy workload, competitive environment", graduationYear: 2024, courseName: "MBA (PGP)" },
      ],
      exams: ["CAT"],
      cutoffs: [
        { exam: "CAT", course: "MBA (PGP)", year: 2024, generalCutoffRank: 250, obcCutoffRank: 600, scCutoffRank: 1200, stCutoffRank: 700 },
      ],
    },
    // Private Universities
    {
      name: "BITS Pilani",
      city: "Pilani",
      state: "Rajasthan",
      type: CollegeType.PRIVATE,
      description: "BITS Pilani is India's leading private engineering institution, founded in 1964. Known for its Practice School program and flexible academic system, BITS produces entrepreneurial engineers. Notable alumni include the founders of major tech companies.",
      establishedYear: 1964,
      accreditation: "NAAC A",
      rating: 4.5,
      totalStudents: 4500,
      acceptanceRate: 5,
      website: "https://www.bits-pilani.ac.in",
      courses: [
        { name: "B.E. Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 500000, seatsAvailable: 150, eligibility: "BITSAT qualified, 12th with PCM" },
        { name: "B.E. Electronics & Instrumentation", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 500000, seatsAvailable: 100, eligibility: "BITSAT qualified" },
        { name: "M.E. Software Systems", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 350000, seatsAvailable: 40, eligibility: "BITS HD admission" },
        { name: "B.Pharm", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 450000, seatsAvailable: 60, eligibility: "BITSAT qualified" },
      ],
      placements: [
        { year: 2024, averagePackage: 1800000, medianPackage: 1500000, highestPackage: 20000000, lowestPackage: 800000, placementRate: 88, topRecruiters: ["Google", "Microsoft", "Sprinklr", "Samsung", "Goldman Sachs"] },
      ],
      reviews: [
        { authorName: "Rohan Joshi", rating: 4.5, title: "Best private engineering college", content: "BITS Pilani offers unmatched academic freedom. The Practice School program gives real industry experience. The dual degree option is excellent for interdisciplinary learning.", pros: "Academic flexibility, Practice School, strong peer group", cons: "Remote location, high fees", graduationYear: 2023, courseName: "B.E. Computer Science" },
      ],
      exams: ["BITSAT"],
      cutoffs: [
        { exam: "BITSAT", course: "B.E. Computer Science", year: 2024, generalCutoffRank: 500, obcCutoffRank: 1000, scCutoffRank: 2000, stCutoffRank: 1200 },
        { exam: "BITSAT", course: "B.E. Electronics & Instrumentation", year: 2024, generalCutoffRank: 1500, obcCutoffRank: 3000, scCutoffRank: 5000, stCutoffRank: 3000 },
      ],
    },
    {
      name: "Vellore Institute of Technology",
      city: "Vellore",
      state: "Tamil Nadu",
      type: CollegeType.PRIVATE,
      description: "VIT is one of India's top private engineering universities, established in 1984. Known for its excellent infrastructure, diverse student body, and consistent placements. VIT conducts its own entrance exam VITEEE and attracts students from across the world.",
      establishedYear: 1984,
      accreditation: "NAAC A++",
      rating: 4.0,
      totalStudents: 20000,
      acceptanceRate: 15,
      website: "https://vit.ac.in",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 350000, seatsAvailable: 500, eligibility: "VITEEE qualified or JEE Main" },
        { name: "B.Tech AI & ML", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 370000, seatsAvailable: 200, eligibility: "VITEEE qualified" },
        { name: "B.Tech Cyber Security", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 360000, seatsAvailable: 100, eligibility: "VITEEE qualified" },
        { name: "M.Tech Software Engineering", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 200000, seatsAvailable: 60, eligibility: "GATE or VIT entrance" },
      ],
      placements: [
        { year: 2024, averagePackage: 800000, medianPackage: 650000, highestPackage: 8000000, lowestPackage: 400000, placementRate: 85, topRecruiters: ["Amazon", "Microsoft", "TCS", "Infosys", "Wipro"] },
      ],
      reviews: [
        { authorName: "Meera Singh", rating: 3.8, title: "Good private university", content: "VIT provides decent education with great infrastructure. The campus facilities are excellent. However, the large student body means individual attention can be limited.", pros: "Modern campus, good infrastructure, diverse crowd", cons: "Large batch sizes, variable faculty quality", graduationYear: 2024, courseName: "B.Tech Computer Science" },
      ],
      exams: ["JEE Main"],
      cutoffs: [
        { exam: "JEE Main", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 50000, obcCutoffRank: 80000, scCutoffRank: 120000, stCutoffRank: 90000 },
        { exam: "JEE Main", course: "B.Tech AI & ML", year: 2024, generalCutoffRank: 45000, obcCutoffRank: 75000, scCutoffRank: 110000, stCutoffRank: 85000 },
      ],
    },
    {
      name: "SRM Institute of Science and Technology",
      city: "Chennai",
      state: "Tamil Nadu",
      type: CollegeType.PRIVATE,
      description: "SRM IST is a renowned private university in Chennai with a strong focus on engineering and technology education. Established in 1985, it has grown into a multi-campus institution with international collaborations and modern research facilities.",
      establishedYear: 1985,
      accreditation: "NAAC A++",
      rating: 3.9,
      totalStudents: 25000,
      acceptanceRate: 20,
      website: "https://www.srmist.edu.in",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 400000, seatsAvailable: 600, eligibility: "SRMJEEE or JEE Main" },
        { name: "B.Tech Electronics & Communication", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 380000, seatsAvailable: 300, eligibility: "SRMJEEE or JEE Main" },
        { name: "M.Tech Data Science", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 220000, seatsAvailable: 60, eligibility: "GATE or SRM entrance" },
      ],
      placements: [
        { year: 2024, averagePackage: 700000, medianPackage: 600000, highestPackage: 6000000, lowestPackage: 350000, placementRate: 80, topRecruiters: ["TCS", "Infosys", "Wipro", "Cognizant", "Amazon"] },
      ],
      reviews: [
        { authorName: "Rajan Krishnan", rating: 3.7, title: "Decent private university", content: "SRM provides good infrastructure and a wide range of courses. The placements are decent for the CS department. International collaborations give good exposure.", pros: "Modern infrastructure, international exchange programs", cons: "Large batch sizes, high fees", graduationYear: 2024, courseName: "B.Tech Computer Science" },
      ],
      exams: ["JEE Main"],
      cutoffs: [
        { exam: "JEE Main", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 70000, obcCutoffRank: 100000, scCutoffRank: 150000, stCutoffRank: 110000 },
      ],
    },
    // Medical
    {
      name: "All India Institute of Medical Sciences Delhi",
      city: "New Delhi",
      state: "Delhi",
      type: CollegeType.PUBLIC,
      description: "AIIMS Delhi is India's most prestigious medical institution, established in 1956. It serves as both a premier teaching hospital and research center. AIIMS is an autonomous institution of national importance and has consistently been ranked #1 for medical education in India.",
      establishedYear: 1956,
      accreditation: "NAAC A++",
      rating: 4.9,
      totalStudents: 3500,
      acceptanceRate: 0.5,
      website: "https://www.aiims.edu",
      courses: [
        { name: "MBBS", duration: "5.5 years", degreeType: DegreeType.BACHELORS, fees: 7000, seatsAvailable: 107, eligibility: "NEET UG qualified" },
        { name: "MD General Medicine", duration: "3 years", degreeType: DegreeType.MASTERS, fees: 15000, seatsAvailable: 20, eligibility: "NEET PG qualified, MBBS" },
        { name: "MS General Surgery", duration: "3 years", degreeType: DegreeType.MASTERS, fees: 15000, seatsAvailable: 15, eligibility: "NEET PG qualified, MBBS" },
      ],
      placements: [
        { year: 2024, averagePackage: 1500000, medianPackage: 1200000, highestPackage: 5000000, lowestPackage: 800000, placementRate: 100, topRecruiters: ["AIIMS Hospitals", "Apollo Hospitals", "Fortis Healthcare", "Max Healthcare", "Government Hospitals"] },
      ],
      reviews: [
        { authorName: "Dr. Anita Desai", rating: 5, title: "The pinnacle of medical education", content: "AIIMS Delhi is unmatched in medical education in India. The clinical exposure, research opportunities, and faculty expertise are extraordinary. Almost zero fees make it accessible to all.", pros: "Almost free education, unmatched clinical exposure, #1 medical college", cons: "Extremely competitive, demanding schedule", graduationYear: 2023, courseName: "MBBS" },
      ],
      exams: ["NEET"],
      cutoffs: [
        { exam: "NEET", course: "MBBS", year: 2024, generalCutoffRank: 50, obcCutoffRank: 200, scCutoffRank: 500, stCutoffRank: 300 },
      ],
    },
    // Law
    {
      name: "National Law School of India University",
      city: "Bangalore",
      state: "Karnataka",
      type: CollegeType.PUBLIC,
      description: "NLSIU Bangalore is India's top law school, established in 1987. It pioneered the 5-year integrated law program in India. NLSIU alumni are prominent in the Indian judiciary, legal profession, and corporate law. The institute is known for its rigorous academic standards and moot court culture.",
      establishedYear: 1987,
      accreditation: "NAAC A",
      rating: 4.7,
      totalStudents: 800,
      acceptanceRate: 1,
      website: "https://www.nls.ac.in",
      courses: [
        { name: "BA LLB (Hons)", duration: "5 years", degreeType: DegreeType.BACHELORS, fees: 250000, seatsAvailable: 120, eligibility: "CLAT qualified, 12th pass" },
        { name: "LLM", duration: "1 year", degreeType: DegreeType.MASTERS, fees: 200000, seatsAvailable: 30, eligibility: "LLB degree, CLAT PG" },
      ],
      placements: [
        { year: 2024, averagePackage: 2200000, medianPackage: 2000000, highestPackage: 7000000, lowestPackage: 1500000, placementRate: 98, topRecruiters: ["AZB & Partners", "Cyril Amarchand Mangaldas", "Khaitan & Co", "Trilegal", "JSA"] },
      ],
      reviews: [
        { authorName: "Adv. Kavya Nair", rating: 4.8, title: "Best law school in India", content: "NLSIU provides an unparalleled legal education. The moot court culture is intense and rewarding. The peer group is incredibly sharp and driven.", pros: "Top law school brand, excellent moot culture, Bangalore location", cons: "Small campus, competitive atmosphere", graduationYear: 2023, courseName: "BA LLB (Hons)" },
      ],
      exams: ["CLAT"],
      cutoffs: [
        { exam: "CLAT", course: "BA LLB (Hons)", year: 2024, generalCutoffRank: 50, obcCutoffRank: 150, scCutoffRank: 300, stCutoffRank: 200 },
      ],
    },
    // More diverse colleges
    {
      name: "Delhi Technological University",
      city: "New Delhi",
      state: "Delhi",
      type: CollegeType.PUBLIC,
      description: "DTU (formerly DCE) is one of the oldest and most reputed engineering colleges in India. Established in 1941, it offers a range of engineering and management programs. Known for producing successful tech entrepreneurs and engineers.",
      establishedYear: 1941,
      accreditation: "NAAC A+",
      rating: 4.1,
      totalStudents: 8000,
      acceptanceRate: 8,
      website: "https://www.dtu.ac.in",
      courses: [
        { name: "B.Tech Computer Engineering", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 160000, seatsAvailable: 130, eligibility: "JEE Main qualified" },
        { name: "B.Tech Software Engineering", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 160000, seatsAvailable: 100, eligibility: "JEE Main qualified" },
        { name: "B.Tech Information Technology", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 160000, seatsAvailable: 80, eligibility: "JEE Main qualified" },
        { name: "MBA", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 500000, seatsAvailable: 60, eligibility: "CAT score" },
      ],
      placements: [
        { year: 2024, averagePackage: 1400000, medianPackage: 1200000, highestPackage: 18000000, lowestPackage: 700000, placementRate: 90, topRecruiters: ["Google", "Microsoft", "Amazon", "Adobe", "Samsung"] },
      ],
      reviews: [
        { authorName: "Harsh Agarwal", rating: 4.0, title: "Great engineering college in Delhi", content: "DTU offers excellent value for money. Being in Delhi, opportunities for internships and networking are plenty. The alumni network is strong in the startup ecosystem.", pros: "Delhi location, strong alumni, affordable fees", cons: "Infrastructure needs upgrades, bureaucracy", graduationYear: 2024, courseName: "B.Tech Computer Engineering" },
      ],
      exams: ["JEE Main"],
      cutoffs: [
        { exam: "JEE Main", course: "B.Tech Computer Engineering", year: 2024, generalCutoffRank: 3500, obcCutoffRank: 8000, scCutoffRank: 18000, stCutoffRank: 9000 },
        { exam: "JEE Main", course: "B.Tech Software Engineering", year: 2024, generalCutoffRank: 5000, obcCutoffRank: 12000, scCutoffRank: 22000, stCutoffRank: 13000 },
        { exam: "JEE Main", course: "B.Tech Information Technology", year: 2024, generalCutoffRank: 6000, obcCutoffRank: 14000, scCutoffRank: 25000, stCutoffRank: 15000 },
      ],
    },
    {
      name: "Manipal Institute of Technology",
      city: "Manipal",
      state: "Karnataka",
      type: CollegeType.PRIVATE,
      description: "MIT Manipal is part of the Manipal Academy of Higher Education and is one of India's oldest and most respected private engineering colleges. Established in 1957, it has a diverse international student body and excellent campus facilities.",
      establishedYear: 1957,
      accreditation: "NAAC A++",
      rating: 4.0,
      totalStudents: 8000,
      acceptanceRate: 12,
      website: "https://manipal.edu/mit.html",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 450000, seatsAvailable: 180, eligibility: "MET qualified" },
        { name: "B.Tech Data Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 470000, seatsAvailable: 60, eligibility: "MET qualified" },
        { name: "B.Tech Robotics", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 460000, seatsAvailable: 40, eligibility: "MET qualified" },
      ],
      placements: [
        { year: 2024, averagePackage: 900000, medianPackage: 750000, highestPackage: 10000000, lowestPackage: 450000, placementRate: 86, topRecruiters: ["Amazon", "Microsoft", "Goldman Sachs", "Cisco", "Samsung"] },
      ],
      reviews: [
        { authorName: "Aditya Sharma", rating: 4.0, title: "Great campus life and good education", content: "Manipal offers an excellent campus experience. The town is built around the university. International exposure is great with students from 50+ countries.", pros: "Beautiful campus, diverse student body, good hostel facilities", cons: "Remote town, high fees", graduationYear: 2024, courseName: "B.Tech Computer Science" },
      ],
      exams: ["JEE Main"],
      cutoffs: [
        { exam: "JEE Main", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 40000, obcCutoffRank: 65000, scCutoffRank: 100000, stCutoffRank: 70000 },
      ],
    },
    {
      name: "International Institute of Information Technology Hyderabad",
      city: "Hyderabad",
      state: "Telangana",
      type: CollegeType.DEEMED,
      description: "IIIT Hyderabad is India's top research university for computer science and IT, established in 1998. Known for its cutting-edge research in AI, ML, NLP, and Robotics. Despite being a relatively young institution, IIITH has earned a stellar reputation in the tech industry.",
      establishedYear: 1998,
      accreditation: "NAAC A++",
      rating: 4.6,
      totalStudents: 2500,
      acceptanceRate: 3,
      website: "https://www.iiit.ac.in",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 380000, seatsAvailable: 200, eligibility: "JEE Main or IIIT-H entrance" },
        { name: "B.Tech Electronics & Communication", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 380000, seatsAvailable: 120, eligibility: "JEE Main or IIIT-H entrance" },
        { name: "M.Tech Computer Science", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 250000, seatsAvailable: 50, eligibility: "GATE or IIIT-H entrance" },
        { name: "MS by Research", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 200000, seatsAvailable: 100, eligibility: "Bachelor's degree in relevant field" },
      ],
      placements: [
        { year: 2024, averagePackage: 2000000, medianPackage: 1700000, highestPackage: 25000000, lowestPackage: 1000000, placementRate: 95, topRecruiters: ["Google", "Microsoft", "Amazon", "Uber", "Salesforce"] },
      ],
      reviews: [
        { authorName: "Shreya Kapoor", rating: 4.7, title: "Best for CS research in India", content: "IIIT Hyderabad is a paradise for computer science enthusiasts. The research culture is incredibly strong, and the faculty includes world-renowned researchers in AI and NLP. Placements are on par with top IITs for CS.", pros: "Strong CS research, excellent placements, small batch sizes", cons: "Limited non-CS programs, Hyderabad weather", graduationYear: 2024, courseName: "B.Tech Computer Science" },
      ],
      exams: ["JEE Main"],
      cutoffs: [
        { exam: "JEE Main", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 2000, obcCutoffRank: 5000, scCutoffRank: 10000, stCutoffRank: 6000 },
        { exam: "JEE Main", course: "B.Tech Electronics & Communication", year: 2024, generalCutoffRank: 5000, obcCutoffRank: 10000, scCutoffRank: 20000, stCutoffRank: 12000 },
      ],
    },
    {
      name: "Indian Statistical Institute Kolkata",
      city: "Kolkata",
      state: "West Bengal",
      type: CollegeType.PUBLIC,
      description: "ISI Kolkata is one of the world's premier institutions for statistics and data science, founded by P.C. Mahalanobis in 1931. It offers highly competitive B.Stat and B.Math programs that are among the toughest to get into. ISI alumni are leaders in quantitative finance, AI research, and academia.",
      establishedYear: 1931,
      accreditation: "Institute of National Importance",
      rating: 4.7,
      totalStudents: 700,
      acceptanceRate: 1,
      website: "https://www.isical.ac.in",
      courses: [
        { name: "B.Stat (Hons)", duration: "3 years", degreeType: DegreeType.BACHELORS, fees: 15000, seatsAvailable: 50, eligibility: "ISI Entrance Exam" },
        { name: "M.Tech Computer Science", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 20000, seatsAvailable: 25, eligibility: "ISI Entrance Exam, B.Tech/B.Stat" },
      ],
      placements: [
        { year: 2024, averagePackage: 2500000, medianPackage: 2200000, highestPackage: 20000000, lowestPackage: 1500000, placementRate: 100, topRecruiters: ["Google", "Goldman Sachs", "JP Morgan", "Tower Research", "DE Shaw"] },
      ],
      reviews: [
        { authorName: "Anirban Mukherjee", rating: 4.9, title: "Temple of Statistics", content: "ISI Kolkata is unmatched for statistical and quantitative education. The intellectual atmosphere is extraordinary. At near-zero fees, the ROI is infinite.", pros: "Legendary institution, incredible faculty, almost free education", cons: "Very small batch, old infrastructure", graduationYear: 2023, courseName: "B.Stat (Hons)" },
      ],
      exams: [],
      cutoffs: [],
    },
    {
      name: "Jadavpur University",
      city: "Kolkata",
      state: "West Bengal",
      type: CollegeType.PUBLIC,
      description: "Jadavpur University is one of India's oldest and most respected public universities, founded in 1955. Known for its strong engineering programs and vibrant campus culture. JU produces exceptionally skilled engineers at minimal cost.",
      establishedYear: 1955,
      accreditation: "NAAC A",
      rating: 4.0,
      totalStudents: 10000,
      acceptanceRate: 10,
      website: "https://www.jaduniv.edu.in",
      courses: [
        { name: "B.E. Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 25000, seatsAvailable: 70, eligibility: "WBJEE or JEE Main" },
        { name: "B.E. Electronics & Telecom", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 25000, seatsAvailable: 80, eligibility: "WBJEE or JEE Main" },
        { name: "B.E. Mechanical Engineering", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 25000, seatsAvailable: 90, eligibility: "WBJEE or JEE Main" },
      ],
      placements: [
        { year: 2024, averagePackage: 900000, medianPackage: 750000, highestPackage: 8000000, lowestPackage: 400000, placementRate: 80, topRecruiters: ["Google", "Amazon", "TCS", "Infosys", "Cognizant"] },
      ],
      reviews: [
        { authorName: "Debdip Sen", rating: 4.0, title: "Heritage college with great education", content: "Jadavpur University offers world-class education at incredibly affordable fees. The CS department is exceptional. The cultural scene on campus is vibrant.", pros: "Ultra-affordable fees, strong academics, rich culture", cons: "Old infrastructure, limited campus amenities", graduationYear: 2024, courseName: "B.E. Computer Science" },
      ],
      exams: ["JEE Main"],
      cutoffs: [
        { exam: "JEE Main", course: "B.E. Computer Science", year: 2024, generalCutoffRank: 12000, obcCutoffRank: 22000, scCutoffRank: 40000, stCutoffRank: 25000 },
        { exam: "JEE Main", course: "B.E. Electronics & Telecom", year: 2024, generalCutoffRank: 18000, obcCutoffRank: 30000, scCutoffRank: 50000, stCutoffRank: 32000 },
      ],
    },
    {
      name: "Indian Institute of Technology Roorkee",
      city: "Roorkee",
      state: "Uttarakhand",
      type: CollegeType.PUBLIC,
      description: "IIT Roorkee is one of the oldest technical institutions in Asia, established in 1847 as the Thomason College of Civil Engineering. Converted to an IIT in 2001, it retains its rich heritage while embracing modern engineering education. Strong alumni network spanning 175+ years.",
      establishedYear: 1847,
      accreditation: "NAAC A++",
      rating: 4.4,
      totalStudents: 9000,
      acceptanceRate: 4,
      website: "https://www.iitr.ac.in",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 235000, seatsAvailable: 90, eligibility: "JEE Advanced qualified" },
        { name: "B.Tech Civil Engineering", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 235000, seatsAvailable: 120, eligibility: "JEE Advanced qualified" },
        { name: "B.Arch", duration: "5 years", degreeType: DegreeType.BACHELORS, fees: 235000, seatsAvailable: 40, eligibility: "JEE Advanced + AAT" },
        { name: "MBA", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 850000, seatsAvailable: 50, eligibility: "CAT score" },
      ],
      placements: [
        { year: 2024, averagePackage: 1900000, medianPackage: 1600000, highestPackage: 22000000, lowestPackage: 900000, placementRate: 91, topRecruiters: ["Google", "Microsoft", "Goldman Sachs", "Samsung", "Qualcomm"] },
      ],
      reviews: [
        { authorName: "Rohit Rawat", rating: 4.3, title: "Heritage meets modernity", content: "IIT Roorkee has a unique charm with its 175+ year heritage. The campus is sprawling and beautiful. Civil Engineering department is legendary. CS placements have improved significantly.", pros: "Rich heritage, beautiful campus, strong civil and CS programs", cons: "Small town, limited entertainment options", graduationYear: 2024, courseName: "B.Tech Computer Science" },
      ],
      exams: ["JEE Advanced"],
      cutoffs: [
        { exam: "JEE Advanced", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 600, obcCutoffRank: 1200, scCutoffRank: 2000, stCutoffRank: 1200 },
        { exam: "JEE Advanced", course: "B.Tech Civil Engineering", year: 2024, generalCutoffRank: 3000, obcCutoffRank: 6000, scCutoffRank: 10000, stCutoffRank: 6000 },
      ],
    },
    {
      name: "Indian Institute of Technology Guwahati",
      city: "Guwahati",
      state: "Assam",
      type: CollegeType.PUBLIC,
      description: "IIT Guwahati is situated on the banks of the Brahmaputra river on a 700-acre campus. Established in 1994, it has rapidly grown to become one of the top IITs. Known for its strong research output in Design, Biotech, and CSE.",
      establishedYear: 1994,
      accreditation: "NAAC A++",
      rating: 4.3,
      totalStudents: 6500,
      acceptanceRate: 5,
      website: "https://www.iitg.ac.in",
      courses: [
        { name: "B.Tech Computer Science", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 230000, seatsAvailable: 80, eligibility: "JEE Advanced qualified" },
        { name: "B.Des", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 230000, seatsAvailable: 30, eligibility: "UCEED qualified" },
        { name: "B.Tech Biotechnology", duration: "4 years", degreeType: DegreeType.BACHELORS, fees: 230000, seatsAvailable: 40, eligibility: "JEE Advanced qualified" },
      ],
      placements: [
        { year: 2024, averagePackage: 1800000, medianPackage: 1500000, highestPackage: 20000000, lowestPackage: 850000, placementRate: 89, topRecruiters: ["Google", "Microsoft", "Amazon", "Samsung", "Flipkart"] },
      ],
      reviews: [
        { authorName: "Pranab Das", rating: 4.2, title: "Scenic campus, solid academics", content: "IIT Guwahati's campus by the Brahmaputra is breathtaking. The design department is one of the best in the country. CS placements are excellent.", pros: "Beautiful riverside campus, growing reputation, strong CS and Design", cons: "North-east location limits corporate visits", graduationYear: 2024, courseName: "B.Tech Computer Science" },
      ],
      exams: ["JEE Advanced"],
      cutoffs: [
        { exam: "JEE Advanced", course: "B.Tech Computer Science", year: 2024, generalCutoffRank: 800, obcCutoffRank: 1600, scCutoffRank: 2800, stCutoffRank: 1600 },
      ],
    },
    {
      name: "Indian Institute of Management Calcutta",
      city: "Kolkata",
      state: "West Bengal",
      type: CollegeType.PUBLIC,
      description: "IIM Calcutta was the first IIM to be established in India in 1961. Known for its rigorous academic programs, strong emphasis on quantitative finance, and the prestigious Joka campus. IIMC alumni hold leadership positions across Fortune 500 companies.",
      establishedYear: 1961,
      accreditation: "AACSB, EQUIS, AMBA",
      rating: 4.8,
      totalStudents: 1000,
      acceptanceRate: 1.2,
      website: "https://www.iimcal.ac.in",
      courses: [
        { name: "MBA (PGP)", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 2700000, seatsAvailable: 480, eligibility: "CAT score, Bachelor's degree" },
        { name: "PGDBA", duration: "2 years", degreeType: DegreeType.MASTERS, fees: 2500000, seatsAvailable: 60, eligibility: "Joint CAT/GMAT entrance" },
      ],
      placements: [
        { year: 2024, averagePackage: 3600000, medianPackage: 3300000, highestPackage: 16000000, lowestPackage: 2300000, placementRate: 100, topRecruiters: ["McKinsey", "BCG", "Goldman Sachs", "Morgan Stanley", "JP Morgan"] },
      ],
      reviews: [
        { authorName: "Surbhi Jain", rating: 4.7, title: "Top B-school with finance focus", content: "IIM Calcutta is particularly strong for finance roles. The quant-heavy curriculum prepares you well for investment banking and consulting. The Joka campus has its own charm.", pros: "Finance focus, strong consulting placements, triple-accredited", cons: "Intense workload, Kolkata summers", graduationYear: 2024, courseName: "MBA (PGP)" },
      ],
      exams: ["CAT"],
      cutoffs: [
        { exam: "CAT", course: "MBA (PGP)", year: 2024, generalCutoffRank: 300, obcCutoffRank: 700, scCutoffRank: 1400, stCutoffRank: 800 },
      ],
    },
  ];

  // ─── Create Colleges ───────────────────────────────────────────────
  let collegeCount = 0;
  let courseCount = 0;
  let placementCount = 0;
  let reviewCount = 0;
  let cutoffCount = 0;

  for (const data of collegesData) {
    const slug = slugify(data.name);

    const college = await prisma.college.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        establishedYear: data.establishedYear,
        type: data.type,
        accreditation: data.accreditation,
        rating: data.rating,
        totalStudents: data.totalStudents,
        acceptanceRate: data.acceptanceRate,
        website: data.website,
        city: data.city,
        state: data.state,
      },
    });

    collegeCount++;

    // Create courses
    const courseMap: Record<string, string> = {};
    for (const course of data.courses) {
      const created = await prisma.course.create({
        data: {
          collegeId: college.id,
          ...course,
        },
      });
      courseMap[course.name] = created.id;
      courseCount++;
    }

    // Create placements
    for (const placement of data.placements) {
      await prisma.placement.create({
        data: {
          collegeId: college.id,
          ...placement,
        },
      });
      placementCount++;
    }

    // Create reviews
    for (const review of data.reviews) {
      await prisma.review.create({
        data: {
          collegeId: college.id,
          ...review,
        },
      });
      reviewCount++;
    }

    // Create cutoffs
    for (const cutoff of data.cutoffs) {
      const examId = examMap[cutoff.exam];
      const courseId = courseMap[cutoff.course];
      if (examId && courseId) {
        await prisma.collegeExamCutoff.create({
          data: {
            collegeId: college.id,
            examId,
            courseId,
            year: cutoff.year,
            generalCutoffRank: cutoff.generalCutoffRank,
            obcCutoffRank: cutoff.obcCutoffRank,
            scCutoffRank: cutoff.scCutoffRank,
            stCutoffRank: cutoff.stCutoffRank,
          },
        });
        cutoffCount++;
      }
    }

    console.log(`  ✅ Created: ${data.name}`);
  }

  console.log(`\n📊 Seed Summary:`);
  console.log(`  🏫 Colleges: ${collegeCount}`);
  console.log(`  📚 Courses: ${courseCount}`);
  console.log(`  💼 Placements: ${placementCount}`);
  console.log(`  ⭐ Reviews: ${reviewCount}`);
  console.log(`  📈 Cutoffs: ${cutoffCount}`);
  console.log(`  📝 Exams: ${exams.length}`);
  console.log(`\n🎉 Database seeded successfully!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
