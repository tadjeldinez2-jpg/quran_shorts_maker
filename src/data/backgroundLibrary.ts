export interface LibraryBackground {
  id: string;
  name: string;
  category: "Mountains" | "Forests" | "Waterfalls" | "Oceans" | "Rivers" | "Clouds" | "Sunrise" | "Sunset" | "Night Sky" | "Rain" | "Desert" | "Islamic Architecture" | "Islamic Patterns" | "Minimal Dark" | "Abstract" | "Light Rays";
  url: string;
  thumbnailUrl: string;
  type: "image" | "video";
}

export const LIBRARY_CATEGORIES = [
  "Mountains",
  "Forests",
  "Waterfalls",
  "Oceans",
  "Rivers",
  "Clouds",
  "Sunrise",
  "Sunset",
  "Night Sky",
  "Rain",
  "Desert",
  "Islamic Architecture",
  "Islamic Patterns",
  "Minimal Dark",
  "Abstract",
  "Light Rays"
] as const;

export const BUILTIN_BACKGROUNDS: LibraryBackground[] = [
  // Mountains
  {
    id: "lib-mountain-1",
    name: "Majestic Snow Peaks",
    category: "Mountains",
    url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-mountain-2",
    name: "Green Valley Slopes",
    category: "Mountains",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Forests
  {
    id: "lib-forest-1",
    name: "Misty Pine Forest",
    category: "Forests",
    url: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-forest-2",
    name: "Sun-drenched Woods",
    category: "Forests",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Waterfalls
  {
    id: "lib-waterfall-1",
    name: "Lush Valley Falls",
    category: "Waterfalls",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-waterfall-2",
    name: "Deep Gorge Cascade",
    category: "Waterfalls",
    url: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Oceans
  {
    id: "lib-ocean-1",
    name: "Ethereal Aerial Waves",
    category: "Oceans",
    url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-ocean-2",
    name: "Quiet Teal Coast",
    category: "Oceans",
    url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Rivers
  {
    id: "lib-river-1",
    name: "Golden Hour Riverbed",
    category: "Rivers",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-river-2",
    name: "Sunlit Forest Run",
    category: "Rivers",
    url: "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Clouds
  {
    id: "lib-cloud-1",
    name: "Soft Dreamy Clouds",
    category: "Clouds",
    url: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-cloud-2",
    name: "Twilight Cloud Horizon",
    category: "Clouds",
    url: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Sunrise
  {
    id: "lib-sunrise-1",
    name: "Morning Mist Valley",
    category: "Sunrise",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-sunrise-2",
    name: "Golden Dawn Fields",
    category: "Sunrise",
    url: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Sunset
  {
    id: "lib-sunset-1",
    name: "Crimson Peace Sky",
    category: "Sunset",
    url: "https://images.unsplash.com/photo-1472214222541-d510753a4907?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1472214222541-d510753a4907?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-sunset-2",
    name: "Dusk Shore Glow",
    category: "Sunset",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Night Sky
  {
    id: "lib-night-1",
    name: "Cosmic Milk Way",
    category: "Night Sky",
    url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-night-2",
    name: "Serene Star Canopy",
    category: "Night Sky",
    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Rain
  {
    id: "lib-rain-1",
    name: "Raindrop Window Lights",
    category: "Rain",
    url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-rain-2",
    name: "Moody Rainfall Window",
    category: "Rain",
    url: "https://images.unsplash.com/photo-1437419764061-2473afe69fc2?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1437419764061-2473afe69fc2?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Desert
  {
    id: "lib-desert-1",
    name: "Soaring Sand Dunes",
    category: "Desert",
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-desert-2",
    name: "Deep Desert Stillness",
    category: "Desert",
    url: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Islamic Architecture
  {
    id: "lib-architecture-1",
    name: "Andalusian Sacred Arch",
    category: "Islamic Architecture",
    url: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-architecture-2",
    name: "Beautiful Gilded Dome",
    category: "Islamic Architecture",
    url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Islamic Patterns
  {
    id: "lib-pattern-1",
    name: "Geometric Marble Carvings",
    category: "Islamic Patterns",
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-pattern-2",
    name: "Intricate Arabesque Details",
    category: "Islamic Patterns",
    url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Minimal Dark
  {
    id: "lib-dark-1",
    name: "Dark Shadows Leafage",
    category: "Minimal Dark",
    url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-dark-2",
    name: "Deep Obsidian Waves",
    category: "Minimal Dark",
    url: "https://images.unsplash.com/photo-1502481851512-e9e2529bbbf9?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1502481851512-e9e2529bbbf9?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Abstract
  {
    id: "lib-abstract-1",
    name: "Ethereal Dusk Aura",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-abstract-2",
    name: "Fluid Golden Satin",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  // Light Rays
  {
    id: "lib-light-1",
    name: "Forest Floor Beams",
    category: "Light Rays",
    url: "https://images.unsplash.com/photo-1511216113906-8f57bb83e776?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1511216113906-8f57bb83e776?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  },
  {
    id: "lib-light-2",
    name: "Misty Sunrise Shafts",
    category: "Light Rays",
    url: "https://images.unsplash.com/photo-1520121401995-928cd50d4e27?auto=format&fit=crop&w=1080&h=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1520121401995-928cd50d4e27?auto=format&fit=crop&w=150&h=150&q=80",
    type: "image"
  }
];
