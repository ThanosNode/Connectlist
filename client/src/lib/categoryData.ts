type Category = {
  id: string;
  name: string;
  icon: string;
  description: string;
  subcategories?: string[];
};

export const categories: Category[] = [
  {
    id: "personal",
    name: "Personals",
    icon: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    description: "Personal connections and relationships",
    subcategories: [
      "M4W", "W4M", "M4M", "W4W", 
      "M4T", "W4T", "T4M", "T4W", "T4T",
      "Couple4M", "Couple4W", "Couple4Couple"
    ]
  },
  {
    id: "blockchain",
    name: "Community",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M6.5 6.5m0 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    description: "Community groups, meetups, and study groups",
    subcategories: [
      "Crypto Enthusiasts", "Web3 Meetups", "Blockchain Study",
      "NFT Artists", "DAO Members", "DeFi Groups",
      "Tech Education", "Developer Community"
    ]
  },
  {
    id: "casual",
    name: "Casual Encounters",
    icon: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z",
    description: "Casual encounters and missed connections",
    subcategories: [
      "M4W", "W4M", "M4M", "W4W", 
      "M4T", "W4T", "T4M", "T4W", "T4T",
      "Couple4M", "Couple4W", "Couple4Couple"
    ]
  },
  {
    id: "jobs",
    name: "Jobs",
    icon: "M2 7h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7zm14 14V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
    description: "Job openings, freelance gigs and employment opportunities"
  },
  {
    id: "business",
    name: "Business",
    icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
    description: "Business services, partnerships and opportunities",
    subcategories: [
      "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
      "Retail", "Construction", "Engineering", "Sales", "Marketing",
      "Human Resources", "Legal", "Transportation", "Logistics", "Food Service",
      "Hospitality", "Arts and Entertainment", "Science", "Agriculture",
      "Skilled Trades (Plumbing, Electrical, etc.)", "Consulting", "Real Estate",
      "Energy", "Environmental", "Media", "Telecommunications", "Pharmaceutical", 
      "Blockchain", "Web3", "Cryptocurrency", "Software Development"
    ]
  },
  {
    id: "housing",
    name: "Housing",
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    description: "Housing, rentals, roommates and real estate"
  },
  {
    id: "tech",
    name: "Tech",
    icon: "M2 3h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3z M8 21h8 M12 17v4",
    description: "Technology products, services and hardware"
  },
  {
    id: "services",
    name: "Services",
    icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
    description: "Professional services, consulting and contractors"
  },
  {
    id: "for-sale",
    name: "For Sale",
    icon: "M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M20 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6",
    description: "Items for sale, marketplace and digital goods"
  },
  {
    id: "events",
    name: "Community Events",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    description: "Community events, groups, meetups and activities"
  }
];