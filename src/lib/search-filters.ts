/**
 * Pokemon GO In-Game Search Filter Reference
 * Complete list of all search strings and operators for the Pokemon storage search bar.
 *
 * Sources:
 * - Niantic Official Help Center
 * - Pokemon GO Wiki (Fandom)
 * - Euphonic.dev complete search terms list
 * - Serebii.net Pokemon GO search reference
 * - PogoSearchGenerator.com
 *
 * Last updated: 2026-03
 */

export interface SearchFilterItem {
  value: string;
  label: string;
  description?: string;
}

export interface SearchFilterCategory {
  id: string;
  name: string;
  nameKo: string;
  description?: string;
  items: SearchFilterItem[];
}

export const searchFilters: SearchFilterCategory[] = [
  // ============================================================
  // OPERATORS
  // ============================================================
  {
    id: "operators",
    name: "Operators",
    nameKo: "연산자",
    description: "Logical operators to combine search terms",
    items: [
      { value: "&", label: "AND (그리고)", description: "Both conditions must match. e.g. fire&shiny" },
      { value: ",", label: "OR (또는) - 쉼표", description: "Either condition matches. e.g. fire,water" },
      { value: ";", label: "OR (또는) - 세미콜론", description: "Same as comma, either condition matches" },
      { value: ":", label: "OR (또는) - 콜론", description: "Same as comma, either condition matches" },
      { value: "|", label: "OR (또는) - 파이프", description: "Same as comma, either condition matches" },
      { value: "!", label: "NOT (제외)", description: "Exclude matching Pokemon. e.g. !shiny" },
      { value: "+", label: "진화 계보 (Evolution family)", description: "Include entire evolution line. e.g. +charmander / +파이리" },
      { value: "-", label: "범위 (Range)", description: "Used for numeric ranges. e.g. cp100-500, cp-300, cp300-" },
    ],
  },

  // ============================================================
  // TYPES (18 types)
  // ============================================================
  {
    id: "types",
    name: "Types",
    nameKo: "타입",
    description: "Search by Pokemon type. Both English and Korean work in Korean client.",
    items: [
      { value: "normal", label: "노말" },
      { value: "fire", label: "불꽃" },
      { value: "water", label: "물" },
      { value: "electric", label: "전기" },
      { value: "grass", label: "풀" },
      { value: "ice", label: "얼음" },
      { value: "fighting", label: "격투" },
      { value: "poison", label: "독" },
      { value: "ground", label: "땅" },
      { value: "flying", label: "비행" },
      { value: "psychic", label: "에스퍼" },
      { value: "bug", label: "벌레" },
      { value: "rock", label: "바위" },
      { value: "ghost", label: "고스트" },
      { value: "dragon", label: "드래곤" },
      { value: "dark", label: "악" },
      { value: "steel", label: "강철" },
      { value: "fairy", label: "페어리" },
    ],
  },

  // ============================================================
  // CP (Combat Power)
  // ============================================================
  {
    id: "cp",
    name: "Combat Power (CP)",
    nameKo: "전투력 (CP)",
    description: "Filter by Combat Power. Supports exact values and ranges.",
    items: [
      { value: "cp{n}", label: "정확한 CP", description: "Exact CP value. e.g. cp1500" },
      { value: "cp{n}-{m}", label: "CP 범위", description: "CP range. e.g. cp100-500" },
      { value: "cp-{n}", label: "CP 이하", description: "CP at or below. e.g. cp-1500" },
      { value: "cp{n}-", label: "CP 이상", description: "CP at or above. e.g. cp2500-" },
    ],
  },

  // ============================================================
  // HP (Hit Points)
  // ============================================================
  {
    id: "hp",
    name: "Hit Points (HP)",
    nameKo: "체력 (HP)",
    description: "Filter by HP. Supports exact values and ranges.",
    items: [
      { value: "hp{n}", label: "정확한 HP", description: "Exact HP value. e.g. hp100" },
      { value: "hp{n}-{m}", label: "HP 범위", description: "HP range. e.g. hp50-100" },
      { value: "hp-{n}", label: "HP 이하", description: "HP at or below. e.g. hp-50" },
      { value: "hp{n}-", label: "HP 이상", description: "HP at or above. e.g. hp100-" },
    ],
  },

  // ============================================================
  // APPRAISAL / IV STARS
  // ============================================================
  {
    id: "appraisal",
    name: "Appraisal / IV Stars",
    nameKo: "평가 / IV 등급",
    description: "Filter by overall IV appraisal rating.",
    items: [
      { value: "4*", label: "4성 (100% IV / 완벽)", description: "Perfect IV (15/15/15)" },
      { value: "3*", label: "3성 (82.2~97.8% IV)", description: "Strong appraisal" },
      { value: "2*", label: "2성 (66.7~80.0% IV)", description: "Decent appraisal" },
      { value: "1*", label: "1성 (51.1~64.4% IV)", description: "Not great appraisal" },
      { value: "0*", label: "0성 (0~48.9% IV)", description: "Low appraisal" },
      { value: "hundo", label: "4성 별칭 (100% IV)", description: "Alias for 4*" },
      { value: "nundo", label: "0/0/0 IV", description: "0% IV (0/0/0)" },
    ],
  },

  // ============================================================
  // INDIVIDUAL IV STATS
  // ============================================================
  {
    id: "individual_iv",
    name: "Individual IV Stats",
    nameKo: "개별 IV 능력치",
    description: "Filter by individual Attack, Defense, HP IVs (0-4 scale where 4=15).",
    items: [
      { value: "0attack", label: "공격 IV 0 (0)", description: "Attack IV = 0" },
      { value: "1attack", label: "공격 IV 1 (1~5)", description: "Attack IV = 1-5" },
      { value: "2attack", label: "공격 IV 2 (6~10)", description: "Attack IV = 6-10" },
      { value: "3attack", label: "공격 IV 3 (11~14)", description: "Attack IV = 11-14" },
      { value: "4attack", label: "공격 IV 4 (15)", description: "Attack IV = 15 (max)" },
      { value: "0defense", label: "방어 IV 0 (0)", description: "Defense IV = 0" },
      { value: "1defense", label: "방어 IV 1 (1~5)", description: "Defense IV = 1-5" },
      { value: "2defense", label: "방어 IV 2 (6~10)", description: "Defense IV = 6-10" },
      { value: "3defense", label: "방어 IV 3 (11~14)", description: "Defense IV = 11-14" },
      { value: "4defense", label: "방어 IV 4 (15)", description: "Defense IV = 15 (max)" },
      { value: "0hp", label: "HP IV 0 (0)", description: "HP IV = 0" },
      { value: "1hp", label: "HP IV 1 (1~5)", description: "HP IV = 1-5" },
      { value: "2hp", label: "HP IV 2 (6~10)", description: "HP IV = 6-10" },
      { value: "3hp", label: "HP IV 3 (11~14)", description: "HP IV = 11-14" },
      { value: "4hp", label: "HP IV 4 (15)", description: "HP IV = 15 (max)" },
    ],
  },

  // ============================================================
  // MOVES / ATTACKS
  // ============================================================
  {
    id: "moves",
    name: "Moves / Attacks",
    nameKo: "기술 / 공격",
    description: "Filter by moves. Use @ prefix. Korean move names work in Korean client.",
    items: [
      { value: "@{move name}", label: "특정 기술 보유", description: "Pokemon with specific move. e.g. @solar beam / @솔라빔" },
      { value: "@{type}", label: "특정 타입 기술 보유", description: "Pokemon with move of type. e.g. @fire / @불꽃" },
      { value: "@1{type}", label: "노말어택 타입", description: "Quick/Fast attack of type. e.g. @1fire" },
      { value: "@2{type}", label: "스페셜어택 타입", description: "Charged attack of type. e.g. @2water" },
      { value: "@3{type}", label: "세컨드 스페셜어택 타입", description: "Second charged attack of type. e.g. @3dragon" },
      { value: "@special", label: "특별한 기술 보유 (레거시)", description: "Has legacy/event-exclusive move (cannot be learned via TM)" },
      { value: "@1special", label: "노말어택이 특별한 기술", description: "Quick attack is legacy/special" },
      { value: "@2special", label: "스페셜어택이 특별한 기술", description: "Charged attack is legacy/special" },
      { value: "@3special", label: "세컨드 스페셜어택이 특별한 기술", description: "Second charged attack is legacy/special" },
      { value: "@weather", label: "날씨 부스트 기술 보유", description: "Has weather-boosted move (any slot)" },
      { value: "@1weather", label: "노말어택 날씨 부스트", description: "Quick attack is weather-boosted" },
      { value: "@2weather", label: "스페셜어택 날씨 부스트", description: "Charged attack is weather-boosted" },
      { value: "@3weather", label: "세컨드 스페셜어택 날씨 부스트", description: "Second charged attack is weather-boosted" },
    ],
  },

  // ============================================================
  // TYPE EFFECTIVENESS (Battle)
  // ============================================================
  {
    id: "type_effectiveness",
    name: "Type Effectiveness",
    nameKo: "타입 상성",
    description: "Filter by type effectiveness in battle.",
    items: [
      { value: ">{type}", label: "해당 타입에 강한 포켓몬", description: "Super effective against type. e.g. >water" },
      { value: "<{type}", label: "해당 타입에 약한 포켓몬", description: "Weak against type. e.g. <fire" },
    ],
  },

  // ============================================================
  // EVOLUTION
  // ============================================================
  {
    id: "evolution",
    name: "Evolution",
    nameKo: "진화",
    description: "Filter by evolution eligibility.",
    items: [
      { value: "evolve", label: "진화 가능", description: "Can evolve right now (has enough candy)" },
      { value: "evolvenew", label: "미등록 진화 가능", description: "Can evolve into a new Pokedex entry" },
      { value: "item", label: "도구 진화", description: "Requires evolution item (e.g. Sun Stone, King's Rock)" },
      { value: "tradeevolve", label: "교환 진화", description: "Trade evolution (0 candy cost if traded)" },
      { value: "megaevolve", label: "메가 진화 가능", description: "Can Mega Evolve" },
      { value: "mega0", label: "메가 레벨 0 (미진화)", description: "Never Mega Evolved" },
      { value: "mega1", label: "메가 레벨 1 (기본)", description: "Mega Level 1 (Base)" },
      { value: "mega2", label: "메가 레벨 2 (높음)", description: "Mega Level 2 (High)" },
      { value: "mega3", label: "메가 레벨 3 (최대)", description: "Mega Level 3 (Max)" },
      { value: "+{name}", label: "진화 계보", description: "Entire evolution family. e.g. +eevee / +이브이" },
    ],
  },

  // ============================================================
  // SPECIAL CATEGORIES
  // ============================================================
  {
    id: "special_categories",
    name: "Special Categories",
    nameKo: "특수 분류",
    description: "Filter by special Pokemon categories.",
    items: [
      { value: "legendary", label: "전설의 포켓몬", description: "Legendary Pokemon" },
      { value: "mythical", label: "환상의 포켓몬", description: "Mythical Pokemon" },
      { value: "ultrabeast", label: "울트라비스트", description: "Ultra Beast Pokemon" },
      { value: "shadow", label: "그림자 포켓몬", description: "Shadow Pokemon (from Team Rocket)" },
      { value: "purified", label: "정화된 포켓몬", description: "Purified Pokemon" },
      { value: "shiny", label: "색이 다른 포켓몬", description: "Shiny Pokemon" },
      { value: "lucky", label: "반짝반짝 포켓몬", description: "Lucky Pokemon (from lucky trade)" },
      { value: "costume", label: "특별 포켓몬", description: "Wearing event costume" },
      { value: "nocostume", label: "특별 없는 포켓몬 (!특별)", description: "Not wearing any costume" },
    ],
  },

  // ============================================================
  // DYNAMAX / GIGANTAMAX
  // ============================================================
  {
    id: "dynamax",
    name: "Dynamax / Gigantamax",
    nameKo: "다이맥스 / 거다이 맥스",
    description: "Filter by Dynamax and Gigantamax status.",
    items: [
      { value: "dynamax", label: "다이맥스 가능", description: "Can Dynamax" },
      { value: "gigantamax", label: "거다이 맥스", description: "Can Gigantamax" },
      { value: "maxmove", label: "다이맥스 기술 보유", description: "Has a Max Move" },
      { value: "maxguard", label: "맥스가드 보유", description: "Has Max Guard" },
      { value: "maxspirit", label: "맥스 스피릿 보유", description: "Has Max Spirit" },
    ],
  },

  // ============================================================
  // FUSION
  // ============================================================
  {
    id: "fusion",
    name: "Fusion",
    nameKo: "합체",
    description: "Filter by fusion-capable Pokemon.",
    items: [
      { value: "fusion", label: "합체 가능/진행 중", description: "Can fuse or is currently fused (e.g. Kyurem + Reshiram/Zekrom)" },
    ],
  },

  // ============================================================
  // STATUS / TAGS
  // ============================================================
  {
    id: "status",
    name: "Status / Tags",
    nameKo: "상태 / 태그",
    description: "Filter by Pokemon status or activity.",
    items: [
      { value: "favorite", label: "즐겨찾기", description: "Favorited Pokemon" },
      { value: "traded", label: "교환으로 받은 포켓몬", description: "Received via trade" },
      { value: "defender", label: "체육관 방어 중", description: "Currently defending a gym" },
      { value: "hatched", label: "알에서 부화한 포켓몬", description: "Hatched from an egg" },
      { value: "eggsonly", label: "알 전용 포켓몬", description: "Egg-exclusive species" },
      { value: "hypertraining", label: "대단한 특훈 중", description: "Currently undergoing Hyper Training" },
      { value: "adventureeffect", label: "어드벤처 이펙트 보유", description: "Has Adventure Effect capability" },
      { value: "#", label: "태그 검색", description: "Custom user tag. e.g. #pvp, #교환" },
    ],
  },

  // ============================================================
  // CAPTURE SOURCE
  // ============================================================
  {
    id: "source",
    name: "Capture Source",
    nameKo: "포획 방법",
    description: "Filter by how the Pokemon was obtained.",
    items: [
      { value: "raid", label: "레이드에서 포획", description: "Caught from any raid" },
      { value: "remoteraid", label: "원격 레이드에서 포획", description: "Caught from remote raid" },
      { value: "megaraid", label: "메가 레이드에서 포획", description: "Caught from mega raid" },
      { value: "exraid", label: "EX 레이드에서 포획", description: "Caught from EX raid" },
      { value: "primalraid", label: "원시 레이드에서 포획", description: "Caught from primal raid" },
      { value: "research", label: "리서치 보상", description: "Obtained from research task reward" },
      { value: "gbl", label: "GO 배틀리그 보상", description: "Obtained from GBL reward encounter" },
      { value: "rocket", label: "로켓단 조우", description: "Caught from Team Rocket encounter" },
      { value: "snapshot", label: "스냅샷 포토밤", description: "Caught from GO Snapshot photobomb" },
      { value: "party", label: "파티 플레이", description: "Caught during Party Play" },
    ],
  },

  // ============================================================
  // BUDDY SYSTEM
  // ============================================================
  {
    id: "buddy",
    name: "Buddy System",
    nameKo: "파트너 포켓몬",
    description: "Filter by buddy friendship level.",
    items: [
      { value: "buddy0", label: "파트너 아님", description: "Not currently buddy" },
      { value: "buddy1", label: "파트너 (하트 0)", description: "Buddy, 0 hearts earned" },
      { value: "buddy2", label: "좋은 친구 (하트 1~69)", description: "Good Buddy" },
      { value: "buddy3", label: "대단한 친구 (하트 70~149)", description: "Great Buddy" },
      { value: "buddy4", label: "최고의 친구 (하트 150~299)", description: "Ultra Buddy" },
      { value: "buddy5", label: "최고의 파트너 (하트 300+)", description: "Best Buddy" },
    ],
  },

  // ============================================================
  // SIZE
  // ============================================================
  {
    id: "size",
    name: "Size",
    nameKo: "크기",
    description: "Filter by Pokemon size category.",
    items: [
      { value: "xxs", label: "아주 작은 (XXS)", description: "Extra Extra Small" },
      { value: "xs", label: "작은 (XS)", description: "Extra Small" },
      { value: "xl", label: "큰 (XL)", description: "Extra Large" },
      { value: "xxl", label: "아주 큰 (XXL)", description: "Extra Extra Large" },
    ],
  },

  // ============================================================
  // GENDER
  // ============================================================
  {
    id: "gender",
    name: "Gender",
    nameKo: "성별",
    description: "Filter by Pokemon gender.",
    items: [
      { value: "male", label: "수컷", description: "Male Pokemon" },
      { value: "female", label: "암컷", description: "Female Pokemon" },
      { value: "genderunknown", label: "성별 불명", description: "Genderless Pokemon" },
    ],
  },

  // ============================================================
  // REGION / GENERATION
  // ============================================================
  {
    id: "region",
    name: "Region / Generation",
    nameKo: "지방 / 세대",
    description: "Filter by Pokemon region of origin.",
    items: [
      { value: "kanto", label: "관동 (1세대)", description: "Gen 1: #001-151" },
      { value: "johto", label: "성도 (2세대)", description: "Gen 2: #152-251" },
      { value: "hoenn", label: "호연 (3세대)", description: "Gen 3: #252-386" },
      { value: "sinnoh", label: "신오 (4세대)", description: "Gen 4: #387-493" },
      { value: "unova", label: "하나 (5세대)", description: "Gen 5: #494-649" },
      { value: "kalos", label: "칼로스 (6세대)", description: "Gen 6: #650-721" },
      { value: "alola", label: "알로라 (7세대)", description: "Gen 7: #722-809" },
      { value: "galar", label: "가라르 (8세대)", description: "Gen 8: #810-898" },
      { value: "hisui", label: "히스이", description: "Hisui regional forms" },
      { value: "paldea", label: "팔데아 (9세대)", description: "Gen 9: #906-1025" },
    ],
  },

  // ============================================================
  // DISTANCE
  // ============================================================
  {
    id: "distance",
    name: "Distance",
    nameKo: "거리",
    description: "Filter by catch location distance from current position (km).",
    items: [
      { value: "distance{n}", label: "정확한 거리 (km)", description: "Exact distance. e.g. distance100" },
      { value: "distance{n}-{m}", label: "거리 범위 (km)", description: "Distance range. e.g. distance100-500" },
      { value: "distance-{n}", label: "거리 이하 (km)", description: "Within distance. e.g. distance-10" },
      { value: "distance{n}-", label: "거리 이상 (km)", description: "Beyond distance. e.g. distance1000-" },
    ],
  },

  // ============================================================
  // AGE (Days since catch)
  // ============================================================
  {
    id: "age",
    name: "Age (Days)",
    nameKo: "나이 (일수)",
    description: "Filter by days since Pokemon was caught.",
    items: [
      { value: "age{n}", label: "정확한 일수 전 포획", description: "Caught exactly N days ago. e.g. age0 (today)" },
      { value: "age{n}-{m}", label: "일수 범위", description: "Caught between N and M days ago. e.g. age0-7" },
      { value: "age-{n}", label: "일수 이하 전", description: "Caught within N days. e.g. age-30" },
      { value: "age{n}-", label: "일수 이상 전", description: "Caught more than N days ago. e.g. age365-" },
    ],
  },

  // ============================================================
  // YEAR (Catch year)
  // ============================================================
  {
    id: "year",
    name: "Year",
    nameKo: "연도",
    description: "Filter by the year Pokemon was caught.",
    items: [
      { value: "year{n}", label: "특정 연도 포획", description: "Caught in specific year. e.g. year2024" },
      { value: "year{n}-{m}", label: "연도 범위", description: "Caught between years. e.g. year2016-2020" },
      { value: "year-{n}", label: "연도 이하", description: "Caught in or before year. e.g. year-2020" },
      { value: "year{n}-", label: "연도 이상", description: "Caught in or after year. e.g. year2023-" },
    ],
  },

  // ============================================================
  // POKEDEX NUMBER
  // ============================================================
  {
    id: "pokedex",
    name: "Pokedex Number",
    nameKo: "도감 번호",
    description: "Filter by National Pokedex number.",
    items: [
      { value: "{n}", label: "정확한 도감 번호", description: "Exact dex number. e.g. 25 (Pikachu)" },
      { value: "{n}-{m}", label: "도감 번호 범위", description: "Dex number range. e.g. 1-151 (Kanto)" },
      { value: "-{n}", label: "도감 번호 이하", description: "Dex number at or below. e.g. -151" },
      { value: "{n}-", label: "도감 번호 이상", description: "Dex number at or above. e.g. 152-" },
    ],
  },

  // ============================================================
  // NAME / NICKNAME
  // ============================================================
  {
    id: "name",
    name: "Name / Nickname",
    nameKo: "이름 / 별명",
    description: "Search by Pokemon species name or user-given nickname.",
    items: [
      { value: "{pokemon name}", label: "포켓몬 이름", description: "Species name. e.g. pikachu / 피카츄 (matches from beginning)" },
      { value: "{nickname}", label: "별명", description: "User-assigned nickname" },
      { value: "+{name}", label: "진화 계보 포함", description: "Include full evolution line. e.g. +charmander / +파이리" },
    ],
  },

  // ============================================================
  // CANDY / COUNT
  // ============================================================
  {
    id: "candy",
    name: "Candy & Count",
    nameKo: "사탕 & 수량",
    description: "Filter by candy count, XL candy, walking distance, and Pokemon count.",
    items: [
      { value: "candyxl", label: "XL 사탕 가능 (레벨 40+)", description: "Can earn XL candy (level 40+ trainer)" },
      { value: "candykm{n}", label: "파트너 사탕 거리", description: "Buddy candy distance tier. e.g. candykm1, candykm3, candykm5, candykm20" },
      { value: "countcandy{n}", label: "사탕 보유 수량", description: "Species candy count. e.g. countcandy100- (100 or more candy)" },
      { value: "countcandy{n}-{m}", label: "사탕 수량 범위", description: "Candy count range. e.g. countcandy25-100" },
      { value: "countcandyxl{n}", label: "XL 사탕 보유 수량", description: "XL candy count. e.g. countcandyxl100-" },
      { value: "countcandyxl{n}-{m}", label: "XL 사탕 수량 범위", description: "XL candy count range" },
      { value: "count{n}", label: "포켓몬 보유 수량", description: "Number of that species owned. e.g. count5- (5 or more)" },
      { value: "count{n}-{m}", label: "포켓몬 수량 범위", description: "Species count range" },
    ],
  },

  // ============================================================
  // BACKGROUND / APPEARANCE
  // ============================================================
  {
    id: "background",
    name: "Background / Appearance",
    nameKo: "배경 / 외형",
    description: "Filter by Pokemon card background.",
    items: [
      { value: "background", label: "배경 있는 포켓몬", description: "Has any background on profile card" },
      { value: "locationbackground", label: "위치 배경", description: "Has location-based background (로케이션배경)" },
      { value: "specialbackground", label: "특별 배경", description: "Has special event background" },
    ],
  },

  // ============================================================
  // MISCELLANEOUS
  // ============================================================
  {
    id: "misc",
    name: "Miscellaneous",
    nameKo: "기타",
    description: "Other useful search terms.",
    items: [
      { value: "event", label: "이벤트 포켓몬", description: "Pokemon caught during special events" },
    ],
  },
];

/**
 * Quick-reference: Korean search terms mapping
 *
 * 한국어 클라이언트에서는 아래 한국어 검색어가 영어와 동일하게 작동합니다.
 *
 * --- 타입 ---
 * normal=노말, fire=불꽃, water=물, electric=전기, grass=풀, ice=얼음,
 * fighting=격투, poison=독, ground=땅, flying=비행, psychic=에스퍼,
 * bug=벌레, rock=바위, ghost=고스트, dragon=드래곤, dark=악,
 * steel=강철, fairy=페어리
 *
 * --- 지방 ---
 * kanto=관동, johto=성도, hoenn=호연, sinnoh=신오, unova=하나,
 * kalos=칼로스, alola=알로라, galar=가라르, hisui=히스이, paldea=팔데아
 *
 * --- 특수 ---
 * evolve=진화, evolvenew=미등록, item=도구, tradeevolve=교환진화,
 * megaevolve=메가진화, favorite=즐겨찾기, defender=방어 포켓몬,
 * shiny=색이 다른, shadow=그림자, purified=정화,
 * legendary=전설의 포켓몬, mythical=환상, lucky=반짝반짝,
 * traded=교환, hatched=부화, eggsonly=알, costume=특별, nocostume=!특별,
 * hypertraining=대단한특훈, dynamax=다이맥스, gigantamax=거다이 맥스,
 * fusion=합체, ultrabeast=울트라비스트, background=배경,
 * adventureeffect=어드벤처이펙트
 *
 * --- 성별 ---
 * male=수컷, female=암컷, genderunknown=성별불명
 *
 * --- 연산자 ---
 * &, |, ,, ;, :, !, +, - (동일)
 */

/**
 * Korean in-game search terms mapping.
 * Used when the user selects Korean output mode.
 */
export const KOREAN_SEARCH_TERMS: Record<string, string> = {
  // 타입
  normal: '노말', fire: '불꽃', water: '물', electric: '전기', grass: '풀', ice: '얼음',
  fighting: '격투', poison: '독', ground: '땅', flying: '비행', psychic: '에스퍼',
  bug: '벌레', rock: '바위', ghost: '고스트', dragon: '드래곤', dark: '악',
  steel: '강철', fairy: '페어리',
  // 지방
  kanto: '관동', johto: '성도', hoenn: '호연', sinnoh: '신오', unova: '하나',
  kalos: '칼로스', alola: '알로라', galar: '가라르', hisui: '히스이', paldea: '팔데아',
  // 특수 분류
  legendary: '전설의 포켓몬', mythical: '환상', ultrabeast: '울트라비스트',
  shadow: '그림자', purified: '정화', shiny: '색이 다른',
  lucky: '반짝반짝', costume: '특별', nocostume: '!특별',
  // 진화
  evolve: '진화', evolvenew: '미등록', item: '도구', tradeevolve: '교환진화',
  megaevolve: '메가진화',
  // 상태
  favorite: '즐겨찾기', traded: '교환', defender: '방어 포켓몬',
  hatched: '부화', eggsonly: '알', hypertraining: '대단한특훈',
  adventureeffect: '어드벤처이펙트',
  // 다이맥스
  dynamax: '다이맥스', gigantamax: '거다이 맥스',
  maxmove: '다이맥스기술', maxguard: '맥스가드', maxspirit: '맥스스피릿',
  fusion: '합체',
  // 성별
  male: '수컷', female: '암컷', genderunknown: '성별불명',
  // 배경
  background: '배경', locationbackground: '위치배경', specialbackground: '특별배경',
  // 기타
  event: '이벤트',
  // 포획 방법
  raid: '레이드', remoteraid: '원격레이드', megaraid: '메가레이드',
  exraid: 'EX레이드', primalraid: '원시레이드',
  research: '리서치', gbl: 'GO배틀리그', rocket: '로켓단',
  snapshot: '스냅샷', party: '파티플레이',
  // 크기
  xxs: 'xxs', xs: 'xs', xl: 'xl', xxl: 'xxl',
};

export default searchFilters;
