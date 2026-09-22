export type ExploreStop = {
  name: string;
  description: string;
  highlights: string[];
};

export type ExploreDestination = {
  slug: string;
  title: string;
  countryCode: string;
  countryCodes?: string[];
  duration: string;
  tags: string[];
  query: string;
  subtitle: string;
  trip: string;
  bestTime: string;
  goodFor: string[];
  note: string;
  routeIntro: string;
  route: ExploreStop[];
};

export const EXPLORE_DESTINATIONS: ExploreDestination[] = [
  {
    slug: "iceland",
    title: "iceland",
    countryCode: "IS",
    duration: "9–11 days",
    tags: ["road trip", "raw nature", "photography"],
    query: "Iceland dramatic road landscape travel",
    subtitle:
      "a long loop through volcanic landscapes, black beaches, waterfalls and the quieter corners beyond the golden circle.",
    trip:
      "this is the kind of trip where the road itself becomes the destination. days are built around long drives through constantly changing landscapes, small roadside stops and weather that can completely shift the mood within an hour. nine to eleven days gives enough room to go beyond the south coast and experience iceland at a slower, less checklist-driven pace.",
    bestTime: "may — september",
    goodFor: [
      "road trips",
      "photography",
      "waterfalls",
      "wild landscapes",
    ],
    note:
      "weather changes quickly here. keep the route flexible and avoid turning every day into a race between landmarks.",
    routeIntro:
      "start with the golden circle, then join route 1 for a clockwise or counter-clockwise ring road loop. the south coast and glacier lagoon deserve full daylight; the east and north are where the trip becomes quieter. snæfellsnes fits best as an optional final day when you have the full eleven days.",
    route: [
      {
        name: "reykjavík",
        description:
          "arrive, recover and keep the first day light before starting the loop.",
        highlights: [
          "hallgrímskirkja",
          "harpa",
          "old harbour",
        ],
      },
      {
        name: "golden circle",
        description:
          "make the classic first loop before committing to route 1; it puts three of iceland's headline sights into one efficient day.",
        highlights: [
          "þingvellir",
          "geysir",
          "gullfoss",
        ],
      },
      {
        name: "south coast",
        description:
          "follow route 1 past waterfalls and black beaches, ideally sleeping around vík so the day never becomes a rush.",
        highlights: [
          "seljalandsfoss",
          "skógafoss",
          "reynisfjara",
        ],
      },
      {
        name: "jökulsárlón + höfn",
        description:
          "continue through the glacier country and use höfn as the natural overnight before the quieter east begins.",
        highlights: [
          "skaftafell",
          "jökulsárlón",
          "diamond beach",
        ],
      },
      {
        name: "eastfjords",
        description:
          "slow down for the long coastal roads, small fishing towns and the least hurried stretch of the ring road.",
        highlights: [
          "djúpivogur",
          "seyðisfjörður",
          "fjord viewpoints",
        ],
      },
      {
        name: "mývatn + akureyri",
        description:
          "cross the volcanic north, then continue toward akureyri for a more comfortable final night before heading west.",
        highlights: [
          "hverir",
          "goðafoss",
          "lake mývatn",
        ],
      },
      {
        name: "west iceland",
        description:
          "close the ring road back toward reykjavík; with eleven days, use the extra time for snæfellsnes rather than squeezing it into a shorter trip.",
        highlights: [
          "kirkjufell",
          "arnarstapi",
          "snæfellsjökull",
        ],
      },
    ],
  },

  {
    slug: "dolomites",
    title: "dolomites",
    countryCode: "IT",
    duration: "4–6 days",
    tags: [
      "mountains",
      "hiking",
      "villages",
    ],
    query:
      "Dolomites Italy mountain landscape travel",
    subtitle:
      "sharp limestone peaks, quiet alpine roads and villages that make short distances feel cinematic.",
    trip:
      "the dolomites work best when the schedule stays simple. choose a couple of valleys, keep driving time low and spend the rest of the day outside. the contrast between polished mountain towns and huge exposed landscapes gives the trip a very particular rhythm.",
    bestTime: "june — october",
    goodFor: [
      "hiking",
      "mountain roads",
      "cabins",
      "photography",
    ],
    note:
      "avoid trying to cover the entire region. two strong bases usually feel better than moving every night.",
    routeIntro:
      "use two bases rather than changing hotels every night: val gardena for the western dolomites, then cortina for the eastern side. connect them over the high mountain passes and build each day around one major hike or viewpoint.",
    route: [
      {
        name: "ortisei",
        description:
          "a comfortable base for val gardena and nearby lifts.",
        highlights: [
          "val gardena",
          "resciesa",
          "passo gardena",
        ],
      },
      {
        name: "seceda",
        description:
          "one of the region's most recognizable ridgelines.",
        highlights: [
          "seceda ridgeline",
          "pieralongia",
          "odle views",
        ],
      },
      {
        name: "alpe di siusi",
        description:
          "open meadows, slower walks and wide mountain views.",
        highlights: [
          "compatsch",
          "meadow trails",
          "sassolungo views",
        ],
      },
      {
        name: "cortina d'ampezzo",
        description:
          "a useful eastern base with dramatic roads in every direction.",
        highlights: [
          "passo falzarego",
          "cinque torri",
          "lago di braies",
        ],
      },
      {
        name: "tre cime",
        description:
          "a classic final mountain day when conditions are clear.",
        highlights: [
          "tre cime loop",
          "forcella lavaredo",
          "cadini di misurina",
        ],
      },
    ],
  },

  {
    slug: "japan",
    title: "japan",
    countryCode: "JP",
    duration: "8–12 days",
    tags: [
      "culture",
      "food",
      "cities",
    ],
    query:
      "Japan Tokyo Kyoto travel streets",
    subtitle:
      "dense cities, precise trains, late-night food and quieter moments hidden between them.",
    trip:
      "japan rewards contrast. a good first trip moves between the intensity of tokyo, slower historic neighbourhoods and smaller stops where the pace changes completely. trains make the movement easy, so the real decision is how much time to leave for simply wandering.",
    bestTime:
      "march — may · october — november",
    goodFor: [
      "food",
      "design",
      "trains",
      "city wandering",
    ],
    note:
      "leave unscheduled time in every city. some of the best parts of japan appear between the places you originally planned to visit.",
    routeIntro:
      "use the tokaido rail corridor as the backbone: tokyo first, a slower mountain break around hakone, then several nights in kyoto before nara and osaka. keep luggage movement simple and leave at least half a day unplanned in each major city.",
    route: [
      {
        name: "tokyo",
        description:
          "neighbourhood wandering, tiny restaurants and endless visual contrast.",
        highlights: [
          "shibuya",
          "asakusa",
          "shinjuku",
        ],
      },
      {
        name: "hakone",
        description:
          "a slower break with mountains, hot springs and lake views.",
        highlights: [
          "lake ashi",
          "onsen",
          "fuji viewpoints",
        ],
      },
      {
        name: "kyoto",
        description:
          "older streets, temples and early mornings before the crowds.",
        highlights: [
          "fushimi inari",
          "gion",
          "kiyomizu-dera",
        ],
      },
      {
        name: "nara",
        description:
          "an easy slower day between larger cities.",
        highlights: [
          "tōdai-ji",
          "nara park",
          "kasuga taisha",
        ],
      },
      {
        name: "osaka",
        description:
          "a louder finish built around food and late nights.",
        highlights: [
          "dōtonbori",
          "kuromon market",
          "shinsekai",
        ],
      },
    ],
  },

  {
    slug: "madeira",
    title: "madeira",
    countryCode: "PT",
    duration: "5–7 days",
    tags: [
      "island",
      "hiking",
      "coast",
    ],
    query:
      "Madeira Portugal dramatic coast landscape travel",
    subtitle:
      "steep green valleys, cloud-level roads and an island compact enough to explore without rushing.",
    trip:
      "madeira feels much larger than it looks because every road climbs, drops or wraps around a mountain. base yourself somewhere comfortable, rent a car and treat each day as a different direction rather than trying to draw a perfect loop.",
    bestTime:
      "april — october",
    goodFor: [
      "hiking",
      "coastal drives",
      "viewpoints",
      "slow mornings",
    ],
    note:
      "weather can be completely different on opposite sides of the island. check conditions before choosing the day's hike.",
    routeIntro:
      "base most nights around funchal or the south coast and make day loops according to the weather. put the high peaks on the clearest morning, the north coast on a cloudier day, and keep one flexible slot for a levada walk.",
    route: [
      {
        name: "funchal",
        description:
          "a relaxed base with food, old streets and easy evenings.",
        highlights: [
          "mercado dos lavradores",
          "old town",
          "monte",
        ],
      },
      {
        name: "pico do arieiro",
        description:
          "high-altitude scenery above the cloud line.",
        highlights: [
          "pico ruivo route",
          "sunrise viewpoints",
          "high ridge walk",
        ],
      },
      {
        name: "santana",
        description:
          "a good gateway to the greener north side.",
        highlights: [
          "ribeiro frio",
          "balcões viewpoint",
          "north coast",
        ],
      },
      {
        name: "porto moniz",
        description:
          "ocean pools and dramatic coastal roads.",
        highlights: [
          "natural pools",
          "seixal beach",
          "fanal forest",
        ],
      },
      {
        name: "ponta do sol",
        description:
          "a softer southwest finish with slower sunsets.",
        highlights: [
          "cabo girão",
          "paul da serra",
          "southwest sunsets",
        ],
      },
    ],
  },

  {
    slug: "scottish-highlands",
    title: "scottish highlands",
    countryCode: "GB",
    duration: "5–7 days",
    tags: [
      "road trip",
      "nature",
      "villages",
    ],
    query:
      "Scottish Highlands road landscape travel",
    subtitle:
      "single-track roads, moody valleys and small towns separated by long stretches of almost nothing.",
    trip:
      "this is a road trip built around atmosphere more than individual sights. weather, empty roads and unexpected stops shape the day. distances can look short on the map but the slower roads are part of the appeal.",
    bestTime:
      "may — september",
    goodFor: [
      "road trips",
      "pubs",
      "landscapes",
      "slow travel",
    ],
    note:
      "build fewer stops into each day than you think you need. the highlands make detours very easy.",
    routeIntro:
      "go north through glencoe, use fort william as the hinge, cross to skye, then continue via applecross toward inverness. the route is short on paper but single-track roads, weather and photo stops make every day slower.",
    route: [
      {
        name: "glencoe",
        description:
          "a dramatic entrance into the highlands.",
        highlights: [
          "three sisters",
          "glen etive",
          "loch achtriochtan",
        ],
      },
      {
        name: "fort william",
        description:
          "a useful base beneath the surrounding mountains.",
        highlights: [
          "ben nevis area",
          "glenfinnan viaduct",
          "neptune’s staircase",
        ],
      },
      {
        name: "isle of skye",
        description:
          "rough coastline, small roads and some of the trip's strongest scenery.",
        highlights: [
          "old man of storr",
          "quiraing",
          "fairy pools",
        ],
      },
      {
        name: "applecross",
        description:
          "a remote road stop reached through one of the country's great drives.",
        highlights: [
          "bealach na bà",
          "applecross bay",
          "torridon roads",
        ],
      },
      {
        name: "inverness",
        description:
          "an easy final stop before heading south again.",
        highlights: [
          "loch ness",
          "urquhart castle",
          "culloden",
        ],
      },
    ],
  },

  {
    slug: "faroe-islands",
    title: "faroe islands",
    countryCode: "FO",
    duration: "4–6 days",
    tags: [
      "remote",
      "coast",
      "hiking",
    ],
    query:
      "Faroe Islands dramatic cliffs village travel",
    subtitle:
      "tiny villages underneath impossible cliffs, linked by tunnels, ferries and weather that changes by the minute.",
    trip:
      "the faroes are small enough that a rigid route is unnecessary. one clear morning can completely change the plan, so keep several walks and villages in mind and follow the best conditions.",
    bestTime:
      "may — september",
    goodFor: [
      "coastlines",
      "hiking",
      "quiet roads",
      "photography",
    ],
    note:
      "wind and cloud matter more than distance. treat the itinerary as a menu rather than a schedule.",
    routeIntro:
      "stay flexible and group islands by tunnels and ferries rather than trying to follow a strict loop. vágar and streymoy are easy early days; eysturoy and kalsoy work better once you understand the weather rhythm.",
    route: [
      {
        name: "tórshavn",
        description:
          "a tiny capital with old lanes, cafés and a calm harbour.",
        highlights: [
          "tinganes",
          "reyn",
          "harbour",
        ],
      },
      {
        name: "saksun",
        description:
          "a compact valley village surrounded by steep mountains.",
        highlights: [
          "lagoon",
          "dúvugarðar",
          "valley walk",
        ],
      },
      {
        name: "gjógv",
        description:
          "a quiet northern village beside a natural sea gorge.",
        highlights: [
          "sea gorge",
          "eysturoy coast",
          "village walk",
        ],
      },
      {
        name: "vágar",
        description:
          "lakes, cliffs and easy access to several classic views.",
        highlights: [
          "sørvágsvatn",
          "bøur",
          "gásadalur",
        ],
      },
      {
        name: "kalsoy",
        description:
          "a ferry day with tunnels, narrow roads and dramatic northern scenery.",
        highlights: [
          "kallur lighthouse",
          "mikladalur",
          "ferry crossing",
        ],
      },
    ],
  },

  {
    slug: "oman",
    title: "oman",
    countryCode: "OM",
    duration: "6–8 days",
    tags: [
      "desert",
      "road trip",
      "wadi",
    ],
    query:
      "Oman desert mountains road trip travel",
    subtitle:
      "mountain roads, empty desert, clear wadis and an unusually easy rhythm for a self-drive trip.",
    trip:
      "oman works beautifully as a loop because each landscape feels completely different from the previous day. the trip can move from muscat's coast into high mountains, desert camps and freshwater wadis without needing domestic flights.",
    bestTime:
      "october — april",
    goodFor: [
      "road trips",
      "desert",
      "swimming",
      "mountains",
    ],
    note:
      "distances are manageable, but heat changes what feels comfortable. start outdoor days early.",
    routeIntro:
      "make a loop from muscat into the interior, climb into the mountains, sleep in the desert, then return to the coast through sur and the wadis. the variety is the point, so avoid stacking two long driving days together.",
    route: [
      {
        name: "muscat",
        description:
          "a low-rise coastal start with markets, mosques and an easy pace.",
        highlights: [
          "sultan qaboos grand mosque",
          "mutrah corniche",
          "mutrah souq",
        ],
      },
      {
        name: "nizwa",
        description:
          "forts, markets and a useful gateway into the mountains.",
        highlights: [
          "nizwa fort",
          "souq",
          "birkat al mouz",
        ],
      },
      {
        name: "jebel akhdar",
        description:
          "high mountain roads and cooler air above the interior.",
        highlights: [
          "diana’s viewpoint",
          "terrace villages",
          "mountain walks",
        ],
      },
      {
        name: "wahiba sands",
        description:
          "a night among huge dunes away from city light.",
        highlights: [
          "dune drive",
          "desert camp",
          "sunset",
        ],
      },
      {
        name: "wadi shab",
        description:
          "a final contrast of clear water and steep canyon walls.",
        highlights: [
          "canyon hike",
          "freshwater pools",
          "bimmah sinkhole",
        ],
      },
    ],
  },

  {
    slug: "taiwan",
    title: "taiwan",
    countryCode: "TW",
    duration: "6–8 days",
    tags: [
      "night markets",
      "design",
      "mountains",
    ],
    query:
      "Taiwan Taipei mountains travel",
    subtitle:
      "dense city energy, night markets and an unexpectedly easy escape into mountains, hot springs and smaller towns.",
    trip:
      "taiwan is compact enough to mix city life and slower regional stops without losing days to travel. trains do most of the heavy lifting, while short side trips create a completely different mood from taipei.",
    bestTime:
      "october — april",
    goodFor: [
      "food",
      "city wandering",
      "trains",
      "mountain escapes",
    ],
    note:
      "this is a travel idea, not a fixed itinerary. leave room for slower days and check current local conditions before travelling.",
    routeIntro:
      "begin in taipei, use one or two northern day trips, then ride the high-speed rail south. tainan deserves time for food and older streets, while kaohsiung gives the route a relaxed coastal finish.",
    route: [
      {
        name: "taipei",
        description:
          "night markets, cafés, temples and neighbourhood wandering.",
        highlights: [
          "longshan temple",
          "daan",
          "elephant mountain",
        ],
      },
      {
        name: "jiufen",
        description:
          "a compact hillside stop with dramatic coastal surroundings.",
        highlights: [
          "old street",
          "shifen",
          "northeast coast",
        ],
      },
      {
        name: "taroko region",
        description:
          "mountain scenery and a slower contrast to taipei.",
        highlights: [
          "marble gorge scenery",
          "coastal cliffs",
          "check current access",
        ],
      },
      {
        name: "tainan",
        description:
          "older streets, temples and one of the strongest food stops.",
        highlights: [
          "confucius temple",
          "shennong street",
          "night food",
        ],
      },
      {
        name: "kaohsiung",
        description:
          "a relaxed southern finish with art and waterfront spaces.",
        highlights: [
          "pier-2",
          "lotus pond",
          "cijin island",
        ],
      },
    ],
  },

  {
    slug: "istanbul",
    title: "istanbul",
    countryCode: "TR",
    duration: "3–5 days",
    tags: [
      "food",
      "history",
      "neighbourhoods",
    ],
    query:
      "Istanbul Bosphorus city travel Turkey",
    subtitle:
      "a city best understood by ferries, long walks, late breakfasts and moving between neighbourhoods rather than monuments.",
    trip:
      "istanbul is dense enough that trying to cover everything makes the city feel smaller, not larger. pick different neighbourhoods each day, cross the bosphorus often and leave enough time for meals to become part of the itinerary.",
    bestTime:
      "april — june · september — november",
    goodFor: [
      "food",
      "ferries",
      "architecture",
      "street life",
    ],
    note:
      "group stops by neighbourhood. crossing the city repeatedly in one day can eat more time than expected.",
    routeIntro:
      "plan by neighbourhood, not by monument. spend one day around the historic peninsula, one around galata and karaköy, then cross to the asian side. use ferries as part of the route and save the bosphorus neighbourhoods for a slower day.",
    route: [
      {
        name: "karaköy",
        description:
          "cafés, waterfront walks and an easy central starting point.",
        highlights: [
          "galata tower",
          "galataport waterfront",
          "kılıç ali paşa",
        ],
      },
      {
        name: "sultanahmet",
        description:
          "the historic core, best experienced early in the day.",
        highlights: [
          "hagia sophia",
          "blue mosque",
          "topkapı palace",
        ],
      },
      {
        name: "balat",
        description:
          "steep streets, old buildings and a very different urban texture.",
        highlights: [
          "fener streets",
          "bulgarian st stephen",
          "golden horn",
        ],
      },
      {
        name: "kadıköy",
        description:
          "markets, restaurants and a strong reason to cross to the asian side.",
        highlights: [
          "kadıköy market",
          "moda",
          "barış manço area",
        ],
      },
      {
        name: "kuzguncuk",
        description:
          "a quieter bosphorus neighbourhood for a slower final afternoon.",
        highlights: [
          "bosphorus streets",
          "üsküdar waterfront",
          "çengelköy",
        ],
      },
    ],
  },

  {
    slug: "indonesia-wild",
    title: "indonesia wild",
    countryCode: "ID",
    duration: "8–12 days",
    tags: [
      "volcanoes",
      "jungle",
      "islands",
    ],
    query:
      "Indonesia volcano jungle nature travel",
    subtitle:
      "volcano mornings, dense green interiors and islands that feel completely different once you move away from the usual resort rhythm.",
    trip:
      "this version of indonesia is built around landscapes rather than beaches alone. early volcano starts, long transfers and slower rural stops make the trip more demanding, but the variety is enormous.",
    bestTime:
      "may — september",
    goodFor: [
      "volcanoes",
      "jungle",
      "photography",
      "adventure",
    ],
    note:
      "indonesia is huge. choose one region or a very small number of islands rather than trying to connect everything.",
    routeIntro:
      "keep this focused on java plus a quieter part of bali. move east from yogyakarta to bromo and ijen, then cross by ferry and slow down in the highlands. the transfers are long, so two volcano mornings back to back can feel brutal.",
    route: [
      {
        name: "yogyakarta",
        description:
          "culture, food and a useful first base on java.",
        highlights: [
          "borobudur",
          "prambanan",
          "malioboro",
        ],
      },
      {
        name: "mount bromo",
        description:
          "a dramatic volcanic landscape best seen around sunrise.",
        highlights: [
          "sunrise viewpoint",
          "sea of sand",
          "bromo crater",
        ],
      },
      {
        name: "ijen",
        description:
          "a rugged eastern java stop with a completely different atmosphere.",
        highlights: [
          "ijen crater",
          "volcanic plateau",
          "early-morning hike",
        ],
      },
      {
        name: "munduk",
        description:
          "a greener and cooler side of bali built around hills and waterfalls.",
        highlights: [
          "waterfalls",
          "twin lakes",
          "coffee country",
        ],
      },
      {
        name: "sidemen",
        description:
          "rice terraces and slower village life away from the busiest coast.",
        highlights: [
          "rice terraces",
          "mount agung views",
          "village roads",
        ],
      },
    ],
  },

  {
    slug: "tasmania",
    title: "tasmania",
    countryCode: "AU",
    duration: "7–10 days",
    tags: [
      "wild coast",
      "road trip",
      "hiking",
    ],
    query:
      "Tasmania Australia coast mountains travel",
    subtitle:
      "a compact island road trip where empty beaches, mountain trails and small towns sit only a few hours apart.",
    trip:
      "tasmania works best as a loose circuit. the distances are reasonable, but weather and hiking plans make flexibility useful. mix a few longer walks with slow coastal drives rather than filling every day.",
    bestTime:
      "november — april",
    goodFor: [
      "road trips",
      "hiking",
      "wildlife",
      "coast",
    ],
    note:
      "road distances can be deceptive once scenic stops are added. avoid planning multiple major hikes back to back.",
    routeIntro:
      "run a loose clockwise loop from hobart up the east coast, cut inland toward cradle mountain, then return south through the central highlands. keep one weather-flex day because the best hikes are condition dependent.",
    route: [
      {
        name: "hobart",
        description:
          "food, waterfront streets and an easy start to the island.",
        highlights: [
          "salamanca",
          "kunanyi / mount wellington",
          "mona",
        ],
      },
      {
        name: "freycinet",
        description:
          "granite peaks, clear water and some of the east coast's best walks.",
        highlights: [
          "wineglass bay",
          "hazards lookout",
          "coles bay",
        ],
      },
      {
        name: "bay of fires",
        description:
          "quiet beaches and a slower northern coastal stretch.",
        highlights: [
          "binalong bay",
          "orange granite coast",
          "larapuna beaches",
        ],
      },
      {
        name: "cradle mountain",
        description:
          "alpine scenery and the strongest hiking section of the trip.",
        highlights: [
          "dove lake",
          "marion’s lookout",
          "wombat spotting",
        ],
      },
      {
        name: "mount field",
        description:
          "forest and waterfalls on the route back toward hobart.",
        highlights: [
          "russell falls",
          "tall trees",
          "central highlands",
        ],
      },
    ],
  },

  {
    slug: "patagonia",
    title: "patagonia",
    countryCode: "AR",
    countryCodes: [
      "AR",
      "CL",
    ],
    duration: "8–12 days",
    tags: [
      "mountains",
      "hiking",
      "remote",
    ],
    query:
      "Patagonia Argentina Chile mountains dramatic travel",
    subtitle:
      "big weather, huge empty spaces and hiking towns where the mountains dominate almost every decision.",
    trip:
      "patagonia rewards depth more than distance. choose a limited section, stay several nights in each base and let weather decide which hikes happen on which days.",
    bestTime:
      "november — march",
    goodFor: [
      "hiking",
      "mountains",
      "glaciers",
      "remote landscapes",
    ],
    note:
      "build weather days into the route. a packed itinerary is especially fragile here.",
    routeIntro:
      "treat this as a two-country route through argentina and chile: el calafate and el chaltén first, then cross the border to puerto natales and torres del paine. the distances are large, so build around a few strong bases rather than constant movement.",
    route: [
      {
        name: "el calafate",
        description:
          "use the town as the practical argentine base for glacier day trips before heading deeper into the mountains.",
        highlights: [
          "lago argentino",
          "glaciarium",
          "perito moreno access",
        ],
      },
      {
        name: "perito moreno",
        description:
          "give the glacier a full day rather than treating it as a quick stop; the boardwalks and boat views show very different scales.",
        highlights: [
          "glacier balconies",
          "boat viewpoint",
          "los glaciares national park",
        ],
      },
      {
        name: "el chaltén",
        description:
          "stay several nights so the major hikes can move around the weather instead of being locked to one day.",
        highlights: [
          "laguna de los tres",
          "laguna torre",
          "fitz roy viewpoints",
        ],
      },
      {
        name: "puerto natales",
        description:
          "cross into chile and use puerto natales as the comfortable staging point for torres del paine.",
        highlights: [
          "waterfront",
          "milodón cave",
          "torres del paine gateway",
        ],
      },
      {
        name: "torres del paine",
        description:
          "finish with chile's headline patagonian landscapes, choosing one or two major day hikes instead of trying to see the whole park at once.",
        highlights: [
          "base torres",
          "cuernos viewpoint",
          "grey glacier",
        ],
      },
    ],
  },

  {
    slug: "georgia",
    title: "georgia",
    countryCode: "GE",
    duration: "7–9 days",
    tags: [
      "food",
      "mountains",
      "wine",
    ],
    query:
      "Georgia Tbilisi Kazbegi mountains travel",
    subtitle:
      "a trip that moves quickly from old balconies and wine bars into huge caucasus mountain landscapes.",
    trip:
      "georgia mixes city life, food and mountain travel unusually well. spend enough time in tbilisi to settle into the city before moving north or east; the contrast is what makes the trip work.",
    bestTime:
      "may — october",
    goodFor: [
      "food",
      "mountains",
      "wine",
      "road trips",
    ],
    note:
      "mountain roads can be slow even when distances look short. avoid stacking too many regions into one week.",
    routeIntro:
      "start in tbilisi, make a short historic day around mtskheta, then drive the military highway north to kazbegi. finish with a slower swing through kakheti for wine villages and open landscapes.",
    route: [
      {
        name: "tbilisi",
        description:
          "old balconies, sulphur baths, wine bars and long evening walks.",
        highlights: [
          "old town",
          "narikala",
          "dry bridge market",
        ],
      },
      {
        name: "mtskheta",
        description:
          "a compact historic stop outside the capital.",
        highlights: [
          "jvari monastery",
          "svetitskhoveli cathedral",
          "old centre",
        ],
      },
      {
        name: "kazbegi",
        description:
          "huge caucasus scenery and mountain roads.",
        highlights: [
          "gergeti trinity church",
          "truso valley",
          "georgian military highway",
        ],
      },
      {
        name: "sighnaghi",
        description:
          "a small hill town overlooking the kakheti wine region.",
        highlights: [
          "old walls",
          "alazani valley",
          "wine cellars",
        ],
      },
      {
        name: "telavi",
        description:
          "a relaxed base for food and wineries before returning west.",
        highlights: [
          "telavi market",
          "tsinandali",
          "kakheti wineries",
        ],
      },
    ],
  },

  {
    slug: "azores",
    title: "azores",
    countryCode: "PT",
    duration: "5–7 days",
    tags: [
      "volcanic",
      "island",
      "slow",
    ],
    query:
      "Azores Portugal volcanic island landscape",
    subtitle:
      "crater lakes, hydrangea roads, thermal water and atlantic weather on a quiet volcanic island chain.",
    trip:
      "the azores are less about collecting islands and more about staying flexible on one or two. clouds can hide a viewpoint completely and reveal it an hour later, so a loose daily plan works best.",
    bestTime:
      "may — october",
    goodFor: [
      "driving",
      "hot springs",
      "hiking",
      "slow travel",
    ],
    note:
      "for a first trip, são miguel alone can comfortably fill several days.",
    routeIntro:
      "for a first visit, keep the entire route on são miguel. work west around sete cidades, then cross the island through lagoa do fogo and furnas before finishing on the quieter eastern roads.",
    route: [
      {
        name: "ponta delgada",
        description:
          "a simple base with restaurants and easy access to the island roads.",
        highlights: [
          "portas da cidade",
          "mercado da graça",
          "pineapple plantations",
        ],
      },
      {
        name: "sete cidades",
        description:
          "crater lakes and some of the island's strongest viewpoints.",
        highlights: [
          "vista do rei",
          "boca do inferno",
          "crater lakes",
        ],
      },
      {
        name: "mosteiros",
        description:
          "a black-rock coast with slower sunset energy.",
        highlights: [
          "lava pools",
          "sea stacks",
          "sunset",
        ],
      },
      {
        name: "furnas",
        description:
          "thermal pools, volcanic food and deep green surroundings.",
        highlights: [
          "terra nostra",
          "poça da dona beija",
          "caldeiras",
        ],
      },
      {
        name: "nordeste",
        description:
          "a quieter eastern road with cliffs, gardens and small towns.",
        highlights: [
          "miradouro da ponta do sossego",
          "waterfalls",
          "east-coast roads",
        ],
      },
    ],
  },

  {
    slug: "seoul-busan",
    title: "seoul + busan",
    countryCode: "KR",
    duration: "6–8 days",
    tags: [
      "food",
      "design",
      "coast",
    ],
    query:
      "South Korea Seoul Busan travel city",
    subtitle:
      "high-energy neighbourhoods, late-night food and a fast train south to a completely different coastal city.",
    trip:
      "this route keeps the logistics simple: one major city in the north, one in the south, and enough time to experience both beyond their headline sights. the train between them is easy, so there is little reason to rush.",
    bestTime:
      "april — june · september — november",
    goodFor: [
      "food",
      "nightlife",
      "design",
      "city wandering",
    ],
    note:
      "choose neighbourhoods rather than attractions when planning seoul. the city makes more sense that way.",
    routeIntro:
      "spend the first half in seoul, take the ktx south with a one-night or full-day stop in gyeongju, then finish in busan. the route is easy enough that the detail should come from neighbourhood time, not extra transfers.",
    route: [
      {
        name: "seoul",
        description:
          "markets, design districts, cafés and late-night neighbourhoods.",
        highlights: [
          "gyeongbokgung",
          "euljiro",
          "gwangjang market",
        ],
      },
      {
        name: "seongsu",
        description:
          "industrial spaces turned into cafés, shops and studios.",
        highlights: [
          "seoul forest",
          "warehouse cafés",
          "design shops",
        ],
      },
      {
        name: "gyeongju",
        description:
          "a slower historic stop between the two big cities.",
        highlights: [
          "daereungwon",
          "donggung and wolji",
          "bulguksa",
        ],
      },
      {
        name: "busan",
        description:
          "coastal neighbourhoods, seafood and a looser southern energy.",
        highlights: [
          "jagalchi market",
          "haeundae",
          "gwanganli",
        ],
      },
      {
        name: "yeongdo",
        description:
          "hillside streets, sea views and a strong final wandering day.",
        highlights: [
          "huinnyeoul village",
          "taejongdae",
          "coastal cafés",
        ],
      },
    ],
  },

  {
    slug: "mexico-oaxaca",
    title: "mexico city + oaxaca",
    countryCode: "MX",
    duration: "6–8 days",
    tags: [
      "food",
      "art",
      "streets",
    ],
    query:
      "Mexico City Oaxaca travel architecture street",
    subtitle:
      "two cities linked by an obsession with food, strong design and neighbourhoods worth walking without a plan.",
    trip:
      "this is less a country-wide trip than a focused cultural pairing. spend several full days in mexico city, then slow the pace in oaxaca where markets, food and nearby villages shape the rhythm.",
    bestTime:
      "october — april",
    goodFor: [
      "food",
      "art",
      "architecture",
      "markets",
    ],
    note:
      "both cities reward repetition. returning to the same neighbourhood at a different hour can feel like a new place.",
    routeIntro:
      "give mexico city at least three full days, including one major archaeological or museum day, then fly or bus to oaxaca for markets, mezcal and nearby villages. do not try to add another state to a one-week trip.",
    route: [
      {
        name: "roma norte",
        description:
          "cafés, design, shaded streets and an easy first base.",
        highlights: [
          "roma-condesa walk",
          "parque méxico",
          "design shops",
        ],
      },
      {
        name: "centro histórico",
        description:
          "dense architecture and a completely different city texture.",
        highlights: [
          "zócalo",
          "palacio de bellas artes",
          "templo mayor",
        ],
      },
      {
        name: "coyoacán",
        description:
          "a slower neighbourhood day away from the centre.",
        highlights: [
          "frida kahlo museum",
          "mercado de coyoacán",
          "plazas",
        ],
      },
      {
        name: "oaxaca",
        description:
          "markets, mezcal, food and compact streets built for wandering.",
        highlights: [
          "santo domingo",
          "mercado 20 de noviembre",
          "monte albán",
        ],
      },
      {
        name: "teotitlán del valle",
        description:
          "a nearby village stop focused on craft and a quieter landscape.",
        highlights: [
          "textile workshops",
          "tule tree",
          "hierve el agua",
        ],
      },
    ],
  },

  {
    slug: "namibia",
    title: "namibia",
    countryCode: "NA",
    duration: "9–12 days",
    tags: [
      "desert",
      "road trip",
      "silence",
    ],
    query:
      "Namibia desert road landscape travel",
    subtitle:
      "huge roads through almost empty landscapes, desert light and distances that make the journey feel genuinely remote.",
    trip:
      "namibia is a road trip first. the spaces between destinations are enormous and often more memorable than the stops themselves. a slower itinerary keeps the driving enjoyable instead of exhausting.",
    bestTime:
      "may — october",
    goodFor: [
      "road trips",
      "desert",
      "wildlife",
      "photography",
    ],
    note:
      "fuel, water and daylight matter here. plan practical stops as carefully as scenic ones.",
    routeIntro:
      "drive south-west from windhoek to sossusvlei, turn north along the atlantic to swakopmund, then continue through damaraland to etosha. the route is a large arc, so fuel stops and early starts matter as much as sightseeing.",
    route: [
      {
        name: "windhoek",
        description:
          "a practical arrival point before the landscape opens up.",
        highlights: [
          "supply stop",
          "vehicle pickup",
          "early departure",
        ],
      },
      {
        name: "sossusvlei",
        description:
          "towering dunes and stark desert geometry.",
        highlights: [
          "deadvlei",
          "big daddy dune",
          "sesriem canyon",
        ],
      },
      {
        name: "swakopmund",
        description:
          "a strange coastal pause between long desert drives.",
        highlights: [
          "atlantic coast",
          "sandwich harbour",
          "walvis bay",
        ],
      },
      {
        name: "damaraland",
        description:
          "rocky landscapes, remote lodges and huge open roads.",
        highlights: [
          "twyfelfontein",
          "spitzkoppe detour",
          "desert elephants region",
        ],
      },
      {
        name: "etosha",
        description:
          "a wildlife-focused final section around the salt pan.",
        highlights: [
          "okaukuejo waterhole",
          "salt pan",
          "self-drive safari",
        ],
      },
    ],
  },

  {
    slug: "peru",
    title: "peru",
    countryCode: "PE",
    duration: "8–11 days",
    tags: [
      "history",
      "mountains",
      "food",
    ],
    query:
      "Peru Andes Cusco landscape travel",
    subtitle:
      "high-altitude cities, andean landscapes and a route where history and geography are inseparable.",
    trip:
      "peru needs breathing room because altitude changes the pace. rather than landing and immediately racing through the sacred valley, build in slower days and let the route gradually move higher.",
    bestTime:
      "may — september",
    goodFor: [
      "history",
      "mountains",
      "food",
      "trains",
    ],
    note:
      "altitude is the main reason not to over-plan the first few days.",
    routeIntro:
      "use lima as a short food-focused start, then fly to cusco and slow down for altitude. move through the sacred valley toward ollantaytambo before taking the train to machu picchu rather than bouncing back and forth.",
    route: [
      {
        name: "lima",
        description:
          "a food-focused start before heading into the andes.",
        highlights: [
          "barranco",
          "miraflores",
          "peruvian food",
        ],
      },
      {
        name: "cusco",
        description:
          "historic streets and a necessary slower altitude-adjustment stop.",
        highlights: [
          "plaza de armas",
          "san blas",
          "sacsayhuamán",
        ],
      },
      {
        name: "sacred valley",
        description:
          "villages, markets and a gentler landscape between major sites.",
        highlights: [
          "pisac",
          "maras salt mines",
          "moray",
        ],
      },
      {
        name: "ollantaytambo",
        description:
          "a compact stone town and useful base before the train.",
        highlights: [
          "inca terraces",
          "old town",
          "train connection",
        ],
      },
      {
        name: "machu picchu",
        description:
          "the famous finish, better when the route toward it has not been rushed.",
        highlights: [
          "machu picchu citadel",
          "aguas calientes",
          "timed entry",
        ],
      },
    ],
  },

  {
    slug: "new-zealand-south-island",
    title:
      "new zealand south island",
    countryCode: "NZ",
    duration: "10–14 days",
    tags: [
      "road trip",
      "alpine",
      "coast",
    ],
    query:
      "New Zealand South Island mountains road travel",
    subtitle:
      "a long-form road trip through alpine passes, glacial lakes, empty coast and small towns built around the outdoors.",
    trip:
      "the south island is a place where adding more stops usually makes the trip worse. distances are significant and almost every road invites detours, so a two-week loop still benefits from restraint.",
    bestTime:
      "november — april",
    goodFor: [
      "road trips",
      "hiking",
      "lakes",
      "mountains",
    ],
    note:
      "keep at least one flexible day. weather can completely change mountain plans.",
    routeIntro:
      "build a broad loop from christchurch through the southern alps, wanaka and fiordland, then return north via the west coast and an alpine pass. two weeks is ideal because weather can easily reshuffle mountain days.",
    route: [
      {
        name: "christchurch",
        description:
          "a practical beginning before heading into the interior.",
        highlights: [
          "riverside market",
          "botanic gardens",
          "vehicle pickup",
        ],
      },
      {
        name: "lake tekapo",
        description:
          "open landscapes, dark skies and a slower first road day.",
        highlights: [
          "church of the good shepherd",
          "stargazing",
          "aoraki detour",
        ],
      },
      {
        name: "wanaka",
        description:
          "a relaxed mountain base with strong day hikes.",
        highlights: [
          "roys peak area",
          "lakefront",
          "haast pass approach",
        ],
      },
      {
        name: "fiordland",
        description:
          "deep valleys, wet weather and the trip's most dramatic landscapes.",
        highlights: [
          "milford sound",
          "key summit",
          "te anau",
        ],
      },
      {
        name: "west coast",
        description:
          "a long final drive through forests, glaciers and empty coastline.",
        highlights: [
          "franz josef region",
          "hokitika gorge",
          "punakaiki",
        ],
      },
    ],
  },

  {
    slug: "singapore",
    title: "singapore",
    countryCode: "SG",
    duration: "3–4 days",
    tags: [
      "food",
      "architecture",
      "tropical city",
    ],
    query:
      "Singapore architecture street travel",
    subtitle:
      "a dense tropical city where hawker centres, modern architecture and green public space sit unusually close together.",
    trip:
      "singapore works best as a compact city break. the transport is effortless, so days can move between very different neighbourhoods without much friction. food is less a stop on the itinerary than the structure around which everything else fits.",
    bestTime:
      "february — april",
    goodFor: [
      "food",
      "architecture",
      "design",
      "short trips",
    ],
    note:
      "heat and humidity make slower midday plans worthwhile. evenings are often the best time to walk.",
    routeIntro:
      "treat the city as a set of compact neighbourhood walks connected by mrt. mix one heritage district, one food-heavy stop and one large modern landscape each day rather than crossing the island repeatedly.",
    route: [
      {
        name: "tanjong pagar",
        description:
          "old shophouses, food and a useful central starting point.",
        highlights: [
          "maxwell food centre",
          "duxton hill",
          "chinatown edge",
        ],
      },
      {
        name: "tiong bahru",
        description:
          "low-rise modernist architecture, cafés and local streets.",
        highlights: [
          "market",
          "streamline moderne blocks",
          "cafés",
        ],
      },
      {
        name: "kampong glam",
        description:
          "colour, food and a very different neighbourhood texture.",
        highlights: [
          "sultan mosque",
          "haji lane",
          "arab street",
        ],
      },
      {
        name: "marina bay",
        description:
          "the city's large-scale contemporary side after dark.",
        highlights: [
          "gardens by the bay",
          "marina bay promenade",
          "national gallery area",
        ],
      },
      {
        name: "joo chiat",
        description:
          "peranakan architecture and a slower eastern finish.",
        highlights: [
          "peranakan shophouses",
          "east coast park",
          "katong food",
        ],
      },
    ],
  },
];

export function getExploreDestination(
  slug: string,
) {
  return (
    EXPLORE_DESTINATIONS.find(
      (destination) =>
        destination.slug ===
        slug,
    ) ?? null
  );
}