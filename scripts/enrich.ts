import mongoose from "mongoose";
import Location from "../src/models/Location";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/travelflow";

// Category-based default packing
const PACKING: Record<string, any[]> = {
  Beaches: [
    { season: "Winter", months: "Nov-Feb", items: [
      { item: "Sunscreen SPF 50+", icon: "wb_sunny" }, { item: "Swimwear", icon: "pool" },
      { item: "Beach sandals", icon: "steps" }, { item: "Light cotton clothes", icon: "checkroom" },
      { item: "Sunglasses & hat", icon: "visibility" }, { item: "Waterproof phone pouch", icon: "smartphone" }
    ]},
    { season: "Summer", months: "Mar-Jun", items: [
      { item: "UV-protection rash guard", icon: "shield" }, { item: "Reusable water bottle", icon: "water_drop" },
      { item: "Aloe vera gel", icon: "spa" }, { item: "Quick-dry towel", icon: "dry_cleaning" },
      { item: "Insect repellent", icon: "bug_report" }, { item: "Light breathable fabrics", icon: "checkroom" }
    ]}
  ],
  Mountains: [
    { season: "Summer", months: "Apr-Jun", items: [
      { item: "Trekking shoes", icon: "hiking" }, { item: "Layered clothing", icon: "checkroom" },
      { item: "Rain jacket", icon: "umbrella" }, { item: "Trekking poles", icon: "straighten" },
      { item: "First-aid kit", icon: "medical_services" }, { item: "Power bank", icon: "battery_charging_full" }
    ]},
    { season: "Winter", months: "Nov-Mar", items: [
      { item: "Heavy down jacket", icon: "ac_unit" }, { item: "Thermal innerwear", icon: "thermostat" },
      { item: "Snow boots", icon: "footprint" }, { item: "Woolen gloves & cap", icon: "back_hand" },
      { item: "Hand warmers", icon: "local_fire_department" }, { item: "Lip balm & moisturizer", icon: "spa" }
    ]}
  ],
  Monuments: [
    { season: "All Year", months: "Oct-Mar (Best)", items: [
      { item: "Comfortable walking shoes", icon: "steps" }, { item: "Light cotton clothes", icon: "checkroom" },
      { item: "Camera with zoom lens", icon: "photo_camera" }, { item: "Sunscreen & hat", icon: "wb_sunny" },
      { item: "Reusable water bottle", icon: "water_drop" }, { item: "Guidebook or audio guide", icon: "menu_book" }
    ]}
  ],
  Cities: [
    { season: "All Year", months: "Oct-Mar (Best)", items: [
      { item: "Comfortable walking shoes", icon: "steps" }, { item: "Light day backpack", icon: "backpack" },
      { item: "Power bank", icon: "battery_charging_full" }, { item: "Street food antacids", icon: "medication" },
      { item: "Modest clothing for temples", icon: "checkroom" }, { item: "Local SIM card", icon: "sim_card" }
    ]}
  ],
  Forests: [
    { season: "Winter", months: "Nov-Mar", items: [
      { item: "Binoculars", icon: "visibility" }, { item: "Camouflage clothing", icon: "checkroom" },
      { item: "Insect repellent (DEET)", icon: "bug_report" }, { item: "Sturdy hiking boots", icon: "hiking" },
      { item: "Torch/headlamp", icon: "flashlight_on" }, { item: "First-aid kit", icon: "medical_services" }
    ]}
  ],
  Lakes: [
    { season: "Summer", months: "Apr-Sep", items: [
      { item: "Layered clothing", icon: "checkroom" }, { item: "Waterproof jacket", icon: "umbrella" },
      { item: "Sunscreen", icon: "wb_sunny" }, { item: "Camera", icon: "photo_camera" },
      { item: "Comfortable walking shoes", icon: "steps" }, { item: "Binoculars for birdwatching", icon: "visibility" }
    ]}
  ],
  Deserts: [
    { season: "Winter", months: "Oct-Mar", items: [
      { item: "Scarf/turban for sand", icon: "face_retouching_natural" }, { item: "Sunscreen SPF 50+", icon: "wb_sunny" },
      { item: "Warm jacket (nights are cold)", icon: "ac_unit" }, { item: "Sturdy boots", icon: "footprint" },
      { item: "Reusable water bottle", icon: "water_drop" }, { item: "Sunglasses", icon: "visibility" }
    ]}
  ],
  Valleys: [
    { season: "Summer", months: "Mar-Jun", items: [
      { item: "Trekking shoes", icon: "hiking" }, { item: "Rain jacket", icon: "umbrella" },
      { item: "Layered clothing", icon: "checkroom" }, { item: "Trekking poles", icon: "straighten" },
      { item: "Sunscreen", icon: "wb_sunny" }, { item: "Energy bars & trail mix", icon: "restaurant" }
    ]}
  ],
  "Hill Stations": [
    { season: "Summer", months: "Mar-Jun", items: [
      { item: "Light woolen sweater", icon: "checkroom" }, { item: "Comfortable walking shoes", icon: "steps" },
      { item: "Rain jacket", icon: "umbrella" }, { item: "Sunscreen", icon: "wb_sunny" },
      { item: "Camera", icon: "photo_camera" }, { item: "Light backpack", icon: "backpack" }
    ]},
    { season: "Winter", months: "Nov-Feb", items: [
      { item: "Heavy jacket", icon: "ac_unit" }, { item: "Thermals", icon: "thermostat" },
      { item: "Woolen cap & gloves", icon: "back_hand" }, { item: "Warm boots", icon: "footprint" },
      { item: "Moisturizer", icon: "spa" }, { item: "Hand warmers", icon: "local_fire_department" }
    ]}
  ],
  Waterfalls: [
    { season: "Monsoon", months: "Jul-Oct", items: [
      { item: "Waterproof jacket", icon: "umbrella" }, { item: "Non-slip trekking shoes", icon: "hiking" },
      { item: "Quick-dry clothes", icon: "dry_cleaning" }, { item: "Waterproof bag for electronics", icon: "smartphone" },
      { item: "Change of clothes", icon: "checkroom" }, { item: "Poncho/raincoat", icon: "water_drop" }
    ]}
  ],
  Islands: [
    { season: "Winter", months: "Oct-May", items: [
      { item: "Snorkeling gear", icon: "scuba_diving" }, { item: "Reef-safe sunscreen", icon: "wb_sunny" },
      { item: "Waterproof camera", icon: "photo_camera" }, { item: "Light cotton clothes", icon: "checkroom" },
      { item: "Seasickness medication", icon: "medication" }, { item: "Beach sandals", icon: "steps" }
    ]}
  ],
};

// Enrichment data keyed by title
const ENRICHMENT: Record<string, { longDescription: string; highlights: string[]; funFacts: string[]; festivals: any[] }> = {
  "Pangong Tso": {
    longDescription: "Pangong Tso is an endorheic lake spanning the border between India and China. At an altitude of 4,350m, it stretches for over 134 kilometers. The lake is remarkable for its ability to change colors — from azure to light blue to green to grey — depending on sunlight. Made famous by the Bollywood film '3 Idiots', its surreal beauty feels otherworldly. The lake freezes completely in winter despite being saltwater.",
    highlights: ["Drive the Changla Pass (5,360m)", "Camp under the Milky Way", "Visit Spangmik Village", "Watch the magical color changes"],
    funFacts: ["The lake changes color 5+ times a day", "It's the world's highest saltwater lake", "The '3 Idiots' climax was filmed here", "It freezes solid in winter despite being saline"],
    festivals: [{ name: "Ladakh Festival", month: "September", description: "A vibrant celebration showcasing Ladakhi culture with masked dances, archery, and polo." }]
  },
  "Mechuka": {
    longDescription: "Mechuka is a hidden gem at 6,000 feet in Arunachal Pradesh's West Siang district. Surrounded by snow-capped mountains and the Siyom River, this valley was once a major trade route between India and Tibet. The Memba and Ramo tribes call this valley home, preserving ancient Buddhist traditions and a unique way of life untouched by modernity.",
    highlights: ["Visit the 400-year-old Samten Yongcha Monastery", "Trek to the Indo-China border", "Explore Siyom River rapids", "Witness tribal festivals"],
    funFacts: ["It was off-limits to outsiders until 2005", "The valley has its own unique dialect", "Japanese soldiers reached here during WWII", "It shares cultural ties with Tibet"],
    festivals: [{ name: "Mechuka Adventure Festival", month: "November", description: "An annual festival featuring paragliding, river rafting, mountain biking, and cultural performances." }]
  },
  "Taj Mahal": {
    longDescription: "The Taj Mahal is a masterpiece of Mughal architecture, built between 1632-1653 by Emperor Shah Jahan as a mausoleum for his beloved wife Mumtaz Mahal. This UNESCO World Heritage Site uses white Makrana marble inlaid with 28 types of precious and semi-precious stones. Over 20,000 artisans from across Asia worked on it. The monument appears to change color throughout the day — pinkish in the morning, white during the day, and golden under moonlight.",
    highlights: ["Sunrise view from Mehtab Bagh", "Moonlight viewing on full moon nights", "Explore Agra Fort nearby", "Fatehpur Sikri day trip"],
    funFacts: ["It took 22 years and 20,000 workers to build", "The minarets are slightly tilted outward for earthquake safety", "Shah Jahan planned a black Taj across the river", "The calligraphy gets larger as it goes higher to appear uniform"],
    festivals: [{ name: "Taj Mahotsav", month: "February", description: "A 10-day cultural extravaganza near the Taj with crafts, music, dance, and cuisine from across India." }]
  },
  "Palolem Beach": {
    longDescription: "Palolem Beach is a crescent-shaped stretch of white sand in South Goa, flanked by thick coconut palms and lush headlands. Unlike North Goa's party scene, Palolem offers a laid-back bohemian vibe with co-working cafés, silent discos (with wireless headphones), and bioluminescent plankton that lights up the shore during new moon nights. Canacona Island is just a short kayak away.",
    highlights: ["Silent disco on the beach", "Kayak to Canacona Island", "Dolphin watching boat trips", "Bioluminescent plankton on new moon nights"],
    funFacts: ["Palolem hosts India's only 'silent noise' parties", "Bioluminescent plankton glow blue at night here", "All beach shacks are dismantled every monsoon", "It was a hippie hideout in the 1960s"],
    festivals: [{ name: "Goa Carnival", month: "February", description: "A 3-day pre-Lenten festival with colorful parades, floats, music, and dance through the streets." }]
  },
  "Munnar": {
    longDescription: "Munnar, situated at 1,600m in Kerala's Western Ghats, was once the summer resort of the British colonial government. Today it is India's largest tea-growing region, with vast estates producing some of the world's finest teas. The town is surrounded by the Anamudi peak (South India's highest) and is home to the endangered Nilgiri Tahr mountain goat. The Neelakurinji flower, which blooms once every 12 years, paints the hillsides blue.",
    highlights: ["Tea estate tour and tasting", "Eravikulam National Park", "Visit Top Station viewpoint", "Mattupetty Dam boating"],
    funFacts: ["Neelakurinji flowers bloom here once every 12 years (next in 2030)", "It was originally three rivers: Moonu + aaru", "Home to the endangered Nilgiri Tahr", "India's highest tea plantation is here at 7,200 ft"],
    festivals: [{ name: "Onam", month: "August-September", description: "Kerala's harvest festival with boat races, floral carpets (pookalam), and elaborate feasts (Onasadya)." }]
  },
  "Valley of Flowers": {
    longDescription: "Valley of Flowers National Park is a UNESCO World Heritage Site nestled in the Chamoli district of Uttarakhand at an altitude of 3,658m. This breathtaking alpine meadow bursts into a riot of color during the brief summer, with over 600 species of flowering plants including rare orchids, poppies, primulas, and marigolds. The valley was 'discovered' by British mountaineer Frank Smythe in 1931 and the mythological Sanjeevani herb is believed to originate here.",
    highlights: ["Trek through alpine meadows", "Spot Himalayan monal and snow leopard", "Visit nearby Hemkund Sahib", "Photography of rare Brahmakamal flower"],
    funFacts: ["It has over 600 species of flowers", "The mythological Sanjeevani herb is said to be from here", "It was unknown to the world until 1931", "Snow covers it for 6 months each year"],
    festivals: [{ name: "Nanda Devi Raj Jat Yatra", month: "August (every 12 years)", description: "An epic pilgrimage across 280 km of Himalayan terrain, one of the largest ritual treks on Earth." }]
  },
  "Radhanagar Beach": {
    longDescription: "Radhanagar Beach on Havelock Island (Swaraj Dweep) has been repeatedly voted Asia's best beach by TIME Magazine. Its wide expanse of powdery white sand stretches for 2 km, backed by lush tropical forest. The shallow turquoise waters are ideal for swimming, and the sunsets here are legendary. The beach is part of the Mahatma Gandhi Marine National Park ecosystem, home to rich coral reefs.",
    highlights: ["Witness spectacular sunsets", "Scuba diving at nearby reefs", "Trek through elephant beach trail", "Kayaking in mangrove creeks"],
    funFacts: ["TIME Magazine named it 'Best Beach in Asia'", "Elephants used to swim from beach to beach here", "The sand is made of coral, not quartz", "It's home to nesting Olive Ridley sea turtles"],
    festivals: [{ name: "Island Tourism Festival", month: "January", description: "A 10-day festival celebrating Andaman culture with tribal dances, water sports, and exhibitions." }]
  },
  "Gulmarg": {
    longDescription: "Gulmarg, meaning 'Meadow of Flowers', sits at 2,650m in the Pir Panjal range of Kashmir. In winter, it transforms into India's premier ski destination with the world's second-highest operating gondola (Gulmarg Gondola) soaring to 3,980m. Emperor Jahangir once collected 21 varieties of wildflowers here. In summer, the meadows are carpeted with bluebells, daisies, and forget-me-nots.",
    highlights: ["Ski on Asia's best powder snow", "Ride the Gulmarg Gondola", "Golf at the world's highest green golf course", "Trek to Alpather Lake"],
    funFacts: ["It has the world's second-highest cable car", "The golf course at 2,650m is the highest in India", "Emperor Jahangir found 21 varieties of wildflowers here", "It receives up to 14 feet of snowfall annually"],
    festivals: [{ name: "Gulmarg Winter Festival", month: "January", description: "A celebration of winter sports featuring skiing, snowboarding competitions, and snowman-making events." }]
  },
  "Varkala Beach": {
    longDescription: "Varkala is unlike any other beach in Kerala — dramatic laterite cliffs rise sharply from the Arabian Sea, with natural springs trickling down the rock face. The 2,000-year-old Janardana Swami Temple sits atop the cliff, making this one of India's few beaches with both spiritual and natural significance. The cliff-top promenade is lined with cafés offering panoramic ocean views.",
    highlights: ["Cliff-top sunset walk", "Visit Janardana Swami Temple", "Ayurvedic massage sessions", "Papanasam Beach holy dip"],
    funFacts: ["The cliffs are believed to be 2 million years old", "Papanasam means 'wash away sins'", "Natural mineral springs flow down the cliffs", "It's called the 'Varanasi of the South'"],
    festivals: [{ name: "Varkala Temple Festival", month: "March", description: "A 10-day festival at the ancient Janardana Swami Temple with processions, music, and fireworks." }]
  },
  "Marina Beach": {
    longDescription: "Stretching 6 km along the Bay of Bengal, Marina Beach is the second-longest urban beach in the world. It flanks Chennai's historic Fort St. George area and is steeped in Tamil culture. At dawn, fishermen haul in fresh catches while joggers line the promenade. The beach comes alive at dusk with food stalls, horse rides, and families enjoying the sea breeze.",
    highlights: ["Sunrise jog along the promenade", "Fresh seafood at stalls", "Visit Lighthouse and Fort St. George", "Evening horse carriage rides"],
    funFacts: ["It's the second-longest urban beach in the world", "Over 30,000 people visit daily", "Ice cream was first sold here in India", "The lighthouse is one of the oldest in India"],
    festivals: [{ name: "Pongal", month: "January", description: "Tamil Nadu's harvest festival with decorated kolams, bull-taming Jallikattu, and traditional feasts." }]
  },
};

// Generic enrichment for locations not in the map
function getGenericEnrichment(loc: any) {
  return {
    longDescription: `${loc.description} This stunning destination in ${loc.state} offers travelers an unforgettable experience amidst India's diverse landscapes. Whether you're seeking adventure, tranquility, or cultural immersion, ${loc.title} delivers a perfect blend of natural beauty and local charm. The best time to visit is ${loc.bestTimeToVisit} when the weather is ideal for exploration.`,
    highlights: [
      `Explore the scenic beauty of ${loc.subtitle}`,
      `Experience local ${loc.state} culture and cuisine`,
      `Photography opportunities at golden hour`,
      `Guided nature walks and excursions`,
    ],
    funFacts: [
      `${loc.title} is one of the most photogenic spots in ${loc.state}`,
      `The region has a unique microclimate distinct from surrounding areas`,
      `Local legends tie this place to ancient mythological events`,
    ],
    festivals: [{
      name: `${loc.state} Cultural Festival`,
      month: "Varies",
      description: `Local festivals celebrate the rich cultural heritage of the ${loc.state} region with traditional music, dance, and cuisine.`
    }],
  };
}

async function enrich() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  const locations = await Location.find({});
  console.log(`📍 Found ${locations.length} locations to enrich...\n`);

  let updated = 0;
  for (const loc of locations) {
    const data = ENRICHMENT[loc.title] || getGenericEnrichment(loc);
    const packing = PACKING[loc.category] || PACKING["Mountains"];

    await Location.updateOne(
      { _id: loc._id },
      {
        $set: {
          longDescription: data.longDescription,
          highlights: data.highlights,
          funFacts: data.funFacts,
          festivals: data.festivals,
          packingEssentials: packing,
        },
      }
    );
    updated++;
    console.log(`  ✅ ${loc.title} (${loc.category})`);
  }

  console.log(`\n🎉 Enriched ${updated} locations!`);
  await mongoose.disconnect();
  console.log("🔌 Disconnected.");
}

enrich().catch((err) => {
  console.error("❌ Enrichment failed:", err);
  process.exit(1);
});
