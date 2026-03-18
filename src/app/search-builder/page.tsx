'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { searchFilters, KOREAN_SEARCH_TERMS } from '@/lib/search-filters';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const CATEGORY_ICONS: Record<string, string> = {
  operators: '🔗', types: '🔥', cp: '⚔️', hp: '❤️', appraisal: '⭐',
  individual_iv: '📊', moves: '🎯', type_effectiveness: '⚡', evolution: '🔄',
  special_categories: '✨', dynamax: '💥', fusion: '🔮', status: '🏷️',
  source: '📍', buddy: '🤝', size: '📏', gender: '♂️', region: '🌍',
  distance: '📐', age: '📅', year: '🗓️', pokedex: '#️⃣', name: '🔤',
  candy: '🍬', background: '🎨', misc: '📦',
};

interface Pokemon {
  no: number;
  name: string;
  en: string;
}

// 배틀/레이드에서 쓸모없는 잡몬 목록 (메가진화 가능 포켓몬 제외)
const TRASH_POKEMON: { category: string; pokemon: { no: number; name: string; en: string }[] }[] = [
  {
    category: '노말 잡몬',
    pokemon: [
      { no: 19, name: '꼬렛', en: 'Rattata' }, { no: 20, name: '레트라', en: 'Raticate' },
      { no: 21, name: '깨비참', en: 'Spearow' }, { no: 22, name: '깨비드릴조', en: 'Fearow' },
      { no: 39, name: '푸린', en: 'Jigglypuff' }, { no: 40, name: '푸크린', en: 'Wigglytuff' },
      { no: 52, name: '나옹', en: 'Meowth' }, { no: 53, name: '페르시온', en: 'Persian' },
      { no: 83, name: '파오리', en: "Farfetch'd" },
      { no: 108, name: '내루미', en: 'Lickitung' },
      { no: 132, name: '메타몽', en: 'Ditto' },
      { no: 161, name: '꼬리선', en: 'Sentret' }, { no: 162, name: '다꼬리', en: 'Furret' },
      { no: 163, name: '부우부', en: 'Hoothoot' }, { no: 164, name: '야부엉', en: 'Noctowl' },
      { no: 190, name: '에이팜', en: 'Aipom' },
      { no: 203, name: '키링키', en: 'Girafarig' },
      { no: 234, name: '노라키', en: 'Stantler' },
      { no: 263, name: '지그제구리', en: 'Zigzagoon' }, { no: 264, name: '직구리', en: 'Linoone' },
      { no: 276, name: '테일로', en: 'Taillow' }, { no: 277, name: '스왈로', en: 'Swellow' },
      { no: 300, name: '에나비', en: 'Skitty' }, { no: 301, name: '델케티', en: 'Delcatty' },
      { no: 327, name: '얼루기', en: 'Spinda' },
      { no: 399, name: '비버니', en: 'Bidoof' }, { no: 400, name: '비다릴', en: 'Bibarel' },
      { no: 424, name: '겟핸보숭', en: 'Ambipom' },
      { no: 431, name: '나비', en: 'Glameow' }, { no: 432, name: '몬냥이', en: 'Purugly' },
      { no: 504, name: '보르쥐', en: 'Patrat' }, { no: 505, name: '보르그', en: 'Watchog' },
      { no: 506, name: '요테리', en: 'Lillipup' }, { no: 507, name: '하데리어', en: 'Herdier' },
      { no: 519, name: '콩둘기', en: 'Pidove' }, { no: 520, name: '유토브', en: 'Tranquill' },
      { no: 572, name: '치라미', en: 'Minccino' }, { no: 573, name: '치라치노', en: 'Cinccino' },
      { no: 659, name: '파르빗', en: 'Bunnelby' }, { no: 660, name: '파르토', en: 'Diggersby' },
      { no: 676, name: '트리미앙', en: 'Furfrou' },
      { no: 731, name: '콕코구리', en: 'Pikipek' }, { no: 732, name: '크라파', en: 'Trumbeak' },
      { no: 819, name: '탐스럽미', en: 'Skwovet' }, { no: 820, name: '욕심보보', en: 'Greedent' },
    ],
  },
  {
    category: '벌레 잡몬',
    pokemon: [
      { no: 10, name: '캐터피', en: 'Caterpie' }, { no: 11, name: '단데기', en: 'Metapod' }, { no: 12, name: '버터플', en: 'Butterfree' },
      // 뿔충이/딱충이 제외 (메가 독침붕)
      { no: 46, name: '파라스', en: 'Paras' }, { no: 47, name: '파라섹트', en: 'Parasect' },
      { no: 48, name: '콘팡', en: 'Venonat' }, { no: 49, name: '도나리', en: 'Venomoth' },
      { no: 165, name: '레디바', en: 'Ledyba' }, { no: 166, name: '레디안', en: 'Ledian' },
      { no: 167, name: '페이검', en: 'Spinarak' }, { no: 168, name: '아리아도스', en: 'Ariados' },
      { no: 265, name: '개무소', en: 'Wurmple' }, { no: 266, name: '실쿤', en: 'Silcoon' },
      { no: 267, name: '뷰티플라이', en: 'Beautifly' }, { no: 268, name: '카스쿤', en: 'Cascoon' },
      { no: 269, name: '독케일', en: 'Dustox' },
      { no: 290, name: '토중몬', en: 'Nincada' }, { no: 291, name: '아이스크', en: 'Ninjask' },
      { no: 313, name: '볼비트', en: 'Volbeat' }, { no: 314, name: '네오비트', en: 'Illumise' },
      { no: 401, name: '귀뚤뚜기', en: 'Kricketot' }, { no: 402, name: '귀뚤톡크', en: 'Kricketune' },
      { no: 415, name: '세꿀버리', en: 'Combee' },
      { no: 540, name: '두르보', en: 'Sewaddle' }, { no: 541, name: '두르쿤', en: 'Swadloon' },
      { no: 542, name: '모아머', en: 'Leavanny' },
      { no: 664, name: '분이벌레', en: 'Scatterbug' }, { no: 665, name: '분떠도리', en: 'Spewpa' },
    ],
  },
  {
    category: '풀 잡몬',
    pokemon: [
      { no: 43, name: '뚜벅쵸', en: 'Oddish' }, { no: 44, name: '냄새꼬', en: 'Gloom' },
      // 모다피/우츠동 제외 (메가 우츠보트 ZA)
      { no: 114, name: '덩쿠리', en: 'Tangela' },
      { no: 187, name: '통통코', en: 'Hoppip' }, { no: 188, name: '두코', en: 'Skiploom' }, { no: 189, name: '솜솜코', en: 'Jumpluff' },
      { no: 191, name: '해너츠', en: 'Sunkern' }, { no: 192, name: '해루미', en: 'Sunflora' },
      { no: 285, name: '버섯꼬', en: 'Shroomish' },
      { no: 315, name: '로젤리아', en: 'Roselia' },
      { no: 420, name: '체리버', en: 'Cherubi' }, { no: 421, name: '체리꼬', en: 'Cherrim' },
      { no: 546, name: '목화몽', en: 'Cottonee' }, { no: 547, name: '엘풍', en: 'Whimsicott' },
      { no: 548, name: '치릴리', en: 'Petilil' },
    ],
  },
  {
    category: '물 잡몬',
    pokemon: [
      { no: 54, name: '고라파덕', en: 'Psyduck' }, { no: 55, name: '골덕', en: 'Golduck' },
      { no: 60, name: '발챙이', en: 'Poliwag' },
      { no: 72, name: '왕눈해', en: 'Tentacool' }, { no: 73, name: '독파리', en: 'Tentacruel' },
      { no: 86, name: '쥬쥬', en: 'Seel' }, { no: 87, name: '쥬레곤', en: 'Dewgong' },
      { no: 90, name: '셀러', en: 'Shellder' },
      { no: 98, name: '크랩', en: 'Krabby' }, { no: 99, name: '킹크랩', en: 'Kingler' },
      { no: 116, name: '쏘드라', en: 'Horsea' },
      { no: 118, name: '콘치', en: 'Goldeen' }, { no: 119, name: '왕콘치', en: 'Seaking' },
      // 별가사리 제외 (메가 아쿠스타 ZA), 잉어킹 제외 (메가 갸라도스)
      { no: 170, name: '초라기', en: 'Chinchou' }, { no: 171, name: '랜턴', en: 'Lanturn' },
      { no: 183, name: '마릴', en: 'Marill' },
      { no: 211, name: '침바루', en: 'Qwilfish' },
      { no: 223, name: '총어', en: 'Remoraid' }, { no: 224, name: '대포무노', en: 'Octillery' },
      { no: 320, name: '고래왕자', en: 'Wailmer' },
      { no: 339, name: '미꾸리', en: 'Barboach' }, { no: 340, name: '메깅', en: 'Whiscash' },
      { no: 341, name: '가재군', en: 'Corphish' },
      { no: 370, name: '사랑동이', en: 'Luvdisc' },
      { no: 535, name: '동챙이', en: 'Tympole' },
    ],
  },
  {
    category: '기타 잡몬',
    pokemon: [
      // 구구/피죤 제외 (메가 피죤투)
      { no: 23, name: '아보', en: 'Ekans' }, { no: 24, name: '아보크', en: 'Arbok' },
      { no: 27, name: '모래두지', en: 'Sandshrew' },
      { no: 41, name: '주뱃', en: 'Zubat' }, { no: 42, name: '골뱃', en: 'Golbat' },
      { no: 56, name: '망키', en: 'Mankey' },
      { no: 74, name: '꼬마돌', en: 'Geodude' },
      { no: 84, name: '두두', en: 'Doduo' }, { no: 85, name: '두트리오', en: 'Dodrio' },
      { no: 88, name: '질퍽이', en: 'Grimer' },
      { no: 96, name: '슬리프', en: 'Drowzee' }, { no: 97, name: '슬리퍼', en: 'Hypno' },
      { no: 100, name: '찌리리공', en: 'Voltorb' },
      { no: 109, name: '또가스', en: 'Koffing' },
      { no: 177, name: '네이티', en: 'Natu' }, { no: 178, name: '네이티오', en: 'Xatu' },
      { no: 193, name: '왕자리', en: 'Yanma' },
      { no: 194, name: '우파', en: 'Wooper' },
      { no: 198, name: '니로우', en: 'Murkrow' },
      { no: 200, name: '무우마', en: 'Misdreavus' },
      { no: 209, name: '블루', en: 'Snubbull' }, { no: 210, name: '그랑블루', en: 'Granbull' },
      { no: 216, name: '깜지곰', en: 'Teddiursa' },
      { no: 218, name: '마그마그', en: 'Slugma' }, { no: 219, name: '마그카르고', en: 'Magcargo' },
      // 델빌 제외 (메가 헬가)
      { no: 261, name: '포챠나', en: 'Poochyena' }, { no: 262, name: '그라에나', en: 'Mightyena' },
      { no: 278, name: '갈모매', en: 'Wingull' }, { no: 279, name: '패리퍼', en: 'Pelipper' },
      { no: 283, name: '비구술', en: 'Surskit' }, { no: 284, name: '비나방', en: 'Masquerain' },
      { no: 293, name: '소곤룡', en: 'Whismur' }, { no: 294, name: '노공룡', en: 'Loudred' }, { no: 295, name: '폭음룡', en: 'Exploud' },
      { no: 299, name: '코코파스', en: 'Nosepass' },
      // 요가랑 제외 (메가 요가램), 둔타 제외 (메가 폭타), 파비코 제외 (메가 파비코리), 어둠대신 제외 (메가 다크펫)
      { no: 316, name: '꿀꺽몬', en: 'Gulpin' }, { no: 317, name: '꿀떡몬', en: 'Swalot' },
      { no: 325, name: '피그점프', en: 'Spoink' }, { no: 326, name: '피그킹', en: 'Grumpig' },
      { no: 331, name: '선인왕', en: 'Cacnea' },
      { no: 355, name: '해골몽', en: 'Duskull' },
      { no: 363, name: '대굴레오', en: 'Spheal' },
      { no: 551, name: '깜눈크', en: 'Sandile' },
      { no: 677, name: '냐스퍼', en: 'Espurr' },
    ],
  },
];

// 메가진화 교환용 포켓몬 목록 (교환 시 메가에너지 할인)
const MEGA_TRADE_POKEMON: { category: string; pokemon: { no: number; name: string; en: string; mega: string }[] }[] = [
  {
    category: '1세대',
    pokemon: [
      { no: 1, name: '이상해씨', en: 'Bulbasaur', mega: '이상해꽃' }, { no: 2, name: '이상해풀', en: 'Ivysaur', mega: '이상해꽃' }, { no: 3, name: '이상해꽃', en: 'Venusaur', mega: '이상해꽃' },
      { no: 4, name: '파이리', en: 'Charmander', mega: '리자몽X/Y' }, { no: 5, name: '리자드', en: 'Charmeleon', mega: '리자몽X/Y' }, { no: 6, name: '리자몽', en: 'Charizard', mega: '리자몽X/Y' },
      { no: 7, name: '꼬부기', en: 'Squirtle', mega: '거북왕' }, { no: 8, name: '어니부기', en: 'Wartortle', mega: '거북왕' }, { no: 9, name: '거북왕', en: 'Blastoise', mega: '거북왕' },
      { no: 13, name: '뿔충이', en: 'Weedle', mega: '독침붕' }, { no: 14, name: '딱충이', en: 'Kakuna', mega: '독침붕' }, { no: 15, name: '독침붕', en: 'Beedrill', mega: '독침붕' },
      { no: 16, name: '구구', en: 'Pidgey', mega: '피죤투' }, { no: 17, name: '피죤', en: 'Pidgeotto', mega: '피죤투' }, { no: 18, name: '피죤투', en: 'Pidgeot', mega: '피죤투' },
      { no: 63, name: '캐이시', en: 'Abra', mega: '후딘' }, { no: 64, name: '윤겔라', en: 'Kadabra', mega: '후딘' }, { no: 65, name: '후딘', en: 'Alakazam', mega: '후딘' },
      { no: 79, name: '야돈', en: 'Slowpoke', mega: '야도란' }, { no: 80, name: '야도란', en: 'Slowbro', mega: '야도란' },
      { no: 92, name: '고오스', en: 'Gastly', mega: '팬텀' }, { no: 93, name: '고우스트', en: 'Haunter', mega: '팬텀' }, { no: 94, name: '팬텀', en: 'Gengar', mega: '팬텀' },
      { no: 115, name: '캥카', en: 'Kangaskhan', mega: '캥카' },
      { no: 120, name: '별가사리', en: 'Staryu', mega: '아쿠스타(ZA)' }, { no: 121, name: '아쿠스타', en: 'Starmie', mega: '아쿠스타(ZA)' },
      { no: 127, name: '쁘사이저', en: 'Pinsir', mega: '쁘사이저' },
      { no: 129, name: '잉어킹', en: 'Magikarp', mega: '갸라도스' }, { no: 130, name: '갸라도스', en: 'Gyarados', mega: '갸라도스' },
      { no: 142, name: '프테라', en: 'Aerodactyl', mega: '프테라' },
      { no: 147, name: '미뇽', en: 'Dratini', mega: '망나뇽(ZA)' }, { no: 148, name: '신뇽', en: 'Dragonair', mega: '망나뇽(ZA)' }, { no: 149, name: '망나뇽', en: 'Dragonite', mega: '망나뇽(ZA)' },
    ],
  },
  {
    category: '2세대',
    pokemon: [
      { no: 69, name: '모다피', en: 'Bellsprout', mega: '우츠보트(ZA)' }, { no: 70, name: '우츠동', en: 'Weepinbell', mega: '우츠보트(ZA)' }, { no: 71, name: '우츠보트', en: 'Victreebel', mega: '우츠보트(ZA)' },
      { no: 179, name: '메리프', en: 'Mareep', mega: '전룡' }, { no: 180, name: '보우양', en: 'Flaaffy', mega: '전룡' }, { no: 181, name: '전룡', en: 'Ampharos', mega: '전룡' },
      { no: 208, name: '강철톤', en: 'Steelix', mega: '강철톤' },
      { no: 212, name: '핫삼', en: 'Scizor', mega: '핫삼' },
      { no: 214, name: '헤라크로스', en: 'Heracross', mega: '헤라크로스' },
      { no: 228, name: '델빌', en: 'Houndour', mega: '헬가' }, { no: 229, name: '헬가', en: 'Houndoom', mega: '헬가' },
      { no: 246, name: '애버라스', en: 'Larvitar', mega: '마기라스' }, { no: 247, name: '데기라스', en: 'Pupitar', mega: '마기라스' }, { no: 248, name: '마기라스', en: 'Tyranitar', mega: '마기라스' },
    ],
  },
  {
    category: '3세대',
    pokemon: [
      { no: 252, name: '나무지기', en: 'Treecko', mega: '나무킹' }, { no: 253, name: '나무돌이', en: 'Grovyle', mega: '나무킹' }, { no: 254, name: '나무킹', en: 'Sceptile', mega: '나무킹' },
      { no: 255, name: '아차모', en: 'Torchic', mega: '번치코' }, { no: 256, name: '영치코', en: 'Combusken', mega: '번치코' }, { no: 257, name: '번치코', en: 'Blaziken', mega: '번치코' },
      { no: 258, name: '물짱이', en: 'Mudkip', mega: '대짱이' }, { no: 259, name: '늪짱이', en: 'Marshtomp', mega: '대짱이' }, { no: 260, name: '대짱이', en: 'Swampert', mega: '대짱이' },
      { no: 280, name: '랄토스', en: 'Ralts', mega: '가디안/엘레이드' }, { no: 281, name: '킬리아', en: 'Kirlia', mega: '가디안/엘레이드' }, { no: 282, name: '가디안', en: 'Gardevoir', mega: '가디안' },
      { no: 302, name: '깜까미', en: 'Sableye', mega: '깜까미' }, { no: 303, name: '입치트', en: 'Mawile', mega: '입치트' },
      { no: 304, name: '가보리', en: 'Aron', mega: '보스로라' }, { no: 305, name: '갱도라', en: 'Lairon', mega: '보스로라' }, { no: 306, name: '보스로라', en: 'Aggron', mega: '보스로라' },
      { no: 307, name: '요가랑', en: 'Meditite', mega: '요가램' }, { no: 308, name: '요가램', en: 'Medicham', mega: '요가램' },
      { no: 309, name: '썬더라이', en: 'Electrike', mega: '썬더볼트' }, { no: 310, name: '썬더볼트', en: 'Manectric', mega: '썬더볼트' },
      { no: 318, name: '샤프니아', en: 'Carvanha', mega: '샤크니아' }, { no: 319, name: '샤크니아', en: 'Sharpedo', mega: '샤크니아' },
      { no: 322, name: '둔타', en: 'Numel', mega: '폭타' }, { no: 323, name: '폭타', en: 'Camerupt', mega: '폭타' },
      { no: 333, name: '파비코', en: 'Swablu', mega: '파비코리' }, { no: 334, name: '파비코리', en: 'Altaria', mega: '파비코리' },
      { no: 353, name: '어둠대신', en: 'Shuppet', mega: '다크펫' }, { no: 354, name: '다크펫', en: 'Banette', mega: '다크펫' },
      { no: 359, name: '앱솔', en: 'Absol', mega: '앱솔' },
      { no: 361, name: '눈꼬마', en: 'Snorunt', mega: '얼음귀신' }, { no: 362, name: '얼음귀신', en: 'Glalie', mega: '얼음귀신' },
      { no: 371, name: '아공이', en: 'Bagon', mega: '보만다' }, { no: 372, name: '쉘곤', en: 'Shelgon', mega: '보만다' }, { no: 373, name: '보만다', en: 'Salamence', mega: '보만다' },
      { no: 374, name: '메탕', en: 'Beldum', mega: '메타그로스' }, { no: 375, name: '메탕구', en: 'Metang', mega: '메타그로스' }, { no: 376, name: '메타그로스', en: 'Metagross', mega: '메타그로스' },
    ],
  },
  {
    category: '4세대+',
    pokemon: [
      { no: 427, name: '이어롤', en: 'Buneary', mega: '이어롭' }, { no: 428, name: '이어롭', en: 'Lopunny', mega: '이어롭' },
      { no: 443, name: '딥상어동', en: 'Gible', mega: '한카리아스' }, { no: 444, name: '한바이트', en: 'Gabite', mega: '한카리아스' }, { no: 445, name: '한카리아스', en: 'Garchomp', mega: '한카리아스' },
      { no: 447, name: '리오르', en: 'Riolu', mega: '루카리오' }, { no: 448, name: '루카리오', en: 'Lucario', mega: '루카리오' },
      { no: 459, name: '눈쓰개', en: 'Snover', mega: '눈설왕' }, { no: 460, name: '눈설왕', en: 'Abomasnow', mega: '눈설왕' },
      { no: 475, name: '엘레이드', en: 'Gallade', mega: '엘레이드' },
      { no: 531, name: '다부니', en: 'Audino', mega: '다부니' },
      { no: 719, name: '디안시', en: 'Diancie', mega: '디안시' },
    ],
  },
];

// PVP 배틀 리그별 상위 포켓몬 (pvpoke.com 2026-03 기준)
interface PvpPokemon { id: string; name: string; note?: string }
const PVP_RANKINGS: { league: string; cp: string; ivTip: string; pokemon: PvpPokemon[] }[] = [
  {
    league: '그레이트리그',
    cp: 'CP 1500',
    ivTip: '공격 0~2 / 방어 13~15 / HP 13~15 가 이상적',
    pokemon: [
      { id: 'Jellicent', name: '탱탱겔' }, { id: 'Altaria', name: '파비코리' },
      { id: 'Azumarill', name: '마릴리' }, { id: 'Empoleon', name: '엠페르트' },
      { id: 'Corviknight', name: '아머까오' }, { id: 'Wigglytuff', name: '푸크린' },
      { id: 'Lickilicky', name: '내룸벨트' }, { id: 'Feraligatr', name: '장크로다일' },
      { id: 'Forretress', name: '쏘콘' }, { id: 'Florges', name: '플라엣테' },
      { id: 'Lapras', name: '라프라스' }, { id: 'Sealeo', name: '씨레오' },
      { id: 'Talonflame', name: '파이어로' }, { id: 'Togekiss', name: '토게키스' },
      { id: 'Annihilape', name: '우라오스' }, { id: 'Clefable', name: '픽시' },
      { id: 'Malamar', name: '칼라마네로' }, { id: 'Dusclops', name: '미라몽' },
      { id: 'Sableye', name: '깜까미' }, { id: 'Stunfisk', name: '메더' },
      { id: 'Blastoise', name: '거북왕' }, { id: 'Medicham', name: '요가램' },
      { id: 'Guzzlord', name: '악식킹' }, { id: 'Cradily', name: '무스틸' },
      { id: 'Oranguru', name: '하랑우탄' }, { id: 'Quagsire', name: '누오' },
      { id: 'Charjabug', name: '전지충이' }, { id: 'Drapion', name: '드래피온' },
      { id: 'Dusknoir', name: '야느와르몽' }, { id: 'Ninetales', name: '나인테일' },
    ],
  },
  {
    league: '울트라리그',
    cp: 'CP 2500',
    ivTip: '공격 0~2 / 방어 13~15 / HP 13~15 가 이상적 (CP 2500 이하 포켓몬)',
    pokemon: [
      { id: 'Corviknight', name: '아머까오' }, { id: 'Lapras', name: '라프라스' },
      { id: 'Florges', name: '플라엣테' }, { id: 'Jellicent', name: '탱탱겔' },
      { id: 'Empoleon', name: '엠페르트' }, { id: 'Feraligatr', name: '장크로다일' },
      { id: 'Clefable', name: '픽시' }, { id: 'Dondozo', name: '지우지주' },
      { id: 'Virizion', name: '비리디온' }, { id: 'Lickilicky', name: '내룸벨트' },
      { id: 'Oranguru', name: '하랑우탄' }, { id: 'Ludicolo', name: '로파파' },
      { id: 'Drapion', name: '드래피온' }, { id: 'Togekiss', name: '토게키스' },
      { id: 'Annihilape', name: '우라오스' }, { id: 'Malamar', name: '칼라마네로' },
      { id: 'Kingdra', name: '킹드라' }, { id: 'Dusknoir', name: '야느와르몽' },
      { id: 'Turtonator', name: '폭거북스' }, { id: 'Giratina', name: '기라티나', note: '어나더폼' },
      { id: 'Walrein', name: '씨카이저' }, { id: 'Blastoise', name: '거북왕' },
      { id: 'Bellibolt', name: '배부르전' }, { id: 'Cresselia', name: '크레세리아' },
      { id: 'Forretress', name: '쏘콘' }, { id: 'Guzzlord', name: '악식킹' },
      { id: 'Mandibuzz', name: '버랜지나' }, { id: 'Steelix', name: '강철톤' },
      { id: 'Tinkaton', name: '뚜드래곤' }, { id: 'Cradily', name: '무스틸' },
    ],
  },
  {
    league: '마스터리그',
    cp: 'CP 무제한',
    ivTip: '공격 15 / 방어 15 / HP 15 (100% 개체값이 최적)',
    pokemon: [
      { id: 'Zacian', name: '자시안', note: '검왕' }, { id: 'Palkia', name: '펄기아', note: '오리진' },
      { id: 'Metagross', name: '메타그로스' }, { id: 'Xerneas', name: '제르네아스' },
      { id: 'Zamazenta', name: '자마젠타', note: '방패왕' }, { id: 'Dialga', name: '디아루가', note: '오리진' },
      { id: 'Lunala', name: '루나아라' }, { id: 'Reshiram', name: '레시라무' },
      { id: 'Kyurem', name: '큐레무', note: '화이트' }, { id: 'Zekrom', name: '제크로무' },
      { id: 'Marshadow', name: '마샤도' }, { id: 'Kyogre', name: '가이오가' },
      { id: 'Lugia', name: '루기아' }, { id: 'Eternatus', name: '무한다이노' },
      { id: 'Yveltal', name: '이벨타르' }, { id: 'Ho-Oh', name: '칠색조' },
      { id: 'Groudon', name: '그란돈' }, { id: 'Garchomp', name: '한카리아스' },
      { id: 'Meloetta', name: '메로엣타', note: '보이스' }, { id: 'Solgaleo', name: '솔가레오' },
      { id: 'Latios', name: '라티오스' }, { id: 'Dialga', name: '디아루가' },
      { id: 'Florges', name: '플라엣테' }, { id: 'Gyarados', name: '갸라도스' },
      { id: 'Mewtwo', name: '뮤츠' }, { id: 'Jirachi', name: '지라치' },
      { id: 'Togekiss', name: '토게키스' }, { id: 'Primarina', name: '누리레느' },
      { id: 'Hydreigon', name: '삼삼드래' }, { id: 'Tyranitar', name: '마기라스' },
    ],
  },
];

export default function SearchBuilderPage() {
  const [query, setQuery] = useState('');
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [excludeMode, setExcludeMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('_trash');
  const [copied, setCopied] = useState(false);
  const [pokedex, setPokedex] = useState<Pokemon[]>([]);
  const [dexSearch, setDexSearch] = useState('');
  const [lang, setLang] = useLocalStorage<'en' | 'ko'>('pgm-search-lang', 'ko');

  // 언어에 따라 검색어 토큰 변환
  const toLocal = useCallback((value: string) => {
    if (lang !== 'ko') return value;
    return KOREAN_SEARCH_TERMS[value] || value;
  }, [lang]);

  // 전체 검색어 문자열을 한글로 변환
  const localizeQuery = useCallback((q: string) => {
    if (lang !== 'ko') return q;
    // 연산자로 분리 → 각 토큰 변환 → 재결합
    return q.split(/([&,;:|])/).map(part => {
      const excl = part.startsWith('!');
      const plus = part.startsWith('+');
      const prefix = excl ? '!' : plus ? '+' : '';
      const term = prefix ? part.slice(1) : part;
      const ko = KOREAN_SEARCH_TERMS[term];
      if (ko) {
        // ko가 이미 !로 시작하면 (예: nocostume→!특별) prefix 무시
        if (ko.startsWith('!')) return ko;
        return prefix + ko;
      }
      return part;
    }).join('');
  }, [lang]);

  // 포켓몬 이름 (영어/한글)
  const pokeName = useCallback((p: { name: string; en: string }) => {
    return lang === 'ko' ? p.name : p.en;
  }, [lang]);

  const pvpName = useCallback((p: { id: string; name: string }) => {
    return lang === 'ko' ? p.name : p.id;
  }, [lang]);

  useEffect(() => {
    fetch('/data/pokedex.json').then(r => r.json()).then(setPokedex).catch(() => {});
  }, []);

  const filteredDex = useMemo(() => {
    if (!dexSearch.trim()) return [];
    const q = dexSearch.trim().toLowerCase();
    return pokedex.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.en.toLowerCase().includes(q) ||
      String(p.no) === q
    ).slice(0, 50);
  }, [pokedex, dexSearch]);

  const addToken = useCallback((value: string) => {
    if (['&', ',', ';', ':', '|'].includes(value)) {
      setPendingOp(value);
      return;
    }
    if (value === '!') {
      setExcludeMode(prev => !prev);
      return;
    }
    const localized = toLocal(value);
    // 이미 !로 시작하면 (예: nocostume→!특별) excludeMode 무시
    const token = localized.startsWith('!') ? localized : (excludeMode ? `!${localized}` : localized);
    setQuery(prev => {
      if (!prev) return token;
      const op = pendingOp || '&';
      setPendingOp(null);
      return prev + op + token;
    });
  }, [pendingOp, excludeMode, toLocal]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };


  const activeFilters = searchFilters.find(c => c.id === activeCategory);
  const [templateInput, setTemplateInput] = useState<{ index: number; value: string; template: string } | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">검색어 만들기</h1>
      <p className="text-xs text-muted-foreground mb-4">포켓몬고 인게임 검색 필터를 클릭으로 조합하세요</p>

      {/* Query display - sticky on mobile */}
      <div className="bg-card border border-border rounded-xl p-3 mb-4 sticky top-0 z-30">
        <label className="text-xs text-muted-foreground mb-1 flex justify-between">
          <span>생성된 검색어</span>
          {query && <span className={query.length > 500 ? 'text-red-500' : ''}>{query.length}자</span>}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="항목을 클릭하거나 직접 입력..."
            className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm font-mono min-w-0"
          />
          <button onClick={copyToClipboard} disabled={!query}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs whitespace-nowrap disabled:opacity-50">
            {copied ? '✓' : '복사'}
          </button>
          <button onClick={() => { setQuery(''); setPendingOp(null); }}
            className="px-2 py-2 bg-muted rounded-lg text-xs">초기화</button>
          <button onClick={() => setLang(prev => prev === 'en' ? 'ko' : 'en')}
            className={`px-2.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
              lang === 'ko' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            }`}>
            {lang === 'ko' ? '한글' : 'EN'}
          </button>
        </div>
        {/* Operators inline */}
        <div className="flex gap-1 mt-2 flex-wrap items-center">
          {[{ value: '&', label: 'AND' }, { value: ',', label: 'OR' }].map(op => (
            <button key={op.value} onClick={() => addToken(op.value)}
              className={`px-2 py-1 rounded text-[10px] font-mono ${pendingOp === op.value ? 'bg-accent text-white' : 'bg-muted'}`}>
              {op.label}
            </button>
          ))}
          <label className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] cursor-pointer ${excludeMode ? 'bg-red-500 text-white' : 'bg-muted'}`}>
            <input type="checkbox" checked={excludeMode} onChange={() => setExcludeMode(p => !p)} className="w-2.5 h-2.5" />
            제외(!)
          </label>
          <button onClick={() => {
            setQuery(prev => {
              const lastOp = Math.max(prev.lastIndexOf('&'), prev.lastIndexOf(','));
              return lastOp > 0 ? prev.slice(0, lastOp) : '';
            });
            setPendingOp(null);
          }} className="px-2 py-1 rounded text-[10px] bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300">
            ↩ 되돌리기
          </button>
          {pendingOp && <span className="text-[10px] text-accent">「{pendingOp}」대기중</span>}
          {excludeMode && <span className="text-[10px] text-red-500">! 제외모드</span>}
        </div>
      </div>

      {/* Filter items panel - RIGHT BELOW the query bar on mobile */}
      {activeCategory === '_pvp' ? (
        <div className="bg-card border border-border rounded-xl p-3">
          <h3 className="text-sm font-bold mb-1">PVP 배틀 상위 랭크</h3>
          <p className="text-xs text-muted-foreground mb-3">pvpoke.com 기준 리그별 Top 30. 검색어 생성 + PVP 개체값 검색</p>

          {/* PVP IV search helper */}
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <h4 className="text-xs font-bold mb-2">PVP 개체값 검색어</h4>
            <div className="flex gap-2 flex-wrap mb-2">
              <button onClick={() => { setQuery(localizeQuery('0-1attack&13-15defense&13-15hp&cp-1500')); setPendingOp(null); }}
                className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg">그레이트 PVP IV</button>
              <button onClick={() => { setQuery(localizeQuery('0-1attack&13-15defense&13-15hp&cp-2500')); setPendingOp(null); }}
                className="px-3 py-1.5 text-xs bg-yellow-500 text-white rounded-lg">울트라 PVP IV</button>
              <button onClick={() => { setQuery(localizeQuery('4*')); setPendingOp(null); }}
                className="px-3 py-1.5 text-xs bg-purple-500 text-white rounded-lg">마스터 PVP IV (4성)</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { setQuery(localizeQuery('0attack&15defense&15hp')); setPendingOp(null); }}
                className="px-2 py-1 text-[10px] bg-muted rounded border border-border">0/15/15</button>
              <button onClick={() => { setQuery(localizeQuery('1attack&15defense&15hp')); setPendingOp(null); }}
                className="px-2 py-1 text-[10px] bg-muted rounded border border-border">1/15/15</button>
              <button onClick={() => { setQuery(localizeQuery('0attack&15defense&14hp')); setPendingOp(null); }}
                className="px-2 py-1 text-[10px] bg-muted rounded border border-border">0/15/14</button>
              <button onClick={() => { setQuery(localizeQuery('0-2attack&14-15defense&14-15hp')); setPendingOp(null); }}
                className="px-2 py-1 text-[10px] bg-muted rounded border border-border">상위 PVP IV 범위</button>
              <button onClick={() => { setQuery(localizeQuery('0-4attack&15defense&15hp')); setPendingOp(null); }}
                className="px-2 py-1 text-[10px] bg-muted rounded border border-border">공0~4/방15/체15</button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">그레이트/울트라: 낮은 공격 + 높은 방어·HP가 유리 | 마스터: 100%가 최적</p>
          </div>

          {/* League tabs */}
          <details className="mt-3">
            <summary className="text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground">리그별 포켓몬 목록 보기 ({PVP_RANKINGS.reduce((a, c) => a + c.pokemon.length, 0)}종)</summary>
            <div className="space-y-3 mt-3">
              {PVP_RANKINGS.map(league => (
                <details key={league.league}>
                  <summary className="text-xs font-bold cursor-pointer">
                    {league.league} <span className="text-muted-foreground font-normal">({league.cp} / {league.pokemon.length}종)</span>
                  </summary>
                  <p className="text-[10px] text-muted-foreground mt-1 ml-2">{league.ivTip}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-2">
                    <button
                      onClick={() => {
                        const names = [...new Set(league.pokemon.map(p => pvpName(p)))];
                        setQuery(names.join(','));
                        setPendingOp(null);
                      }}
                      className="px-2 py-1 text-[10px] bg-accent/10 text-accent rounded border border-accent/30"
                    >
                      전체 검색어
                    </button>
                    {league.pokemon.map((p, i) => (
                      <button
                        key={`${league.league}-${i}`}
                        onClick={() => addToken(pvpName(p))}
                        className="px-2 py-1.5 rounded-lg text-xs border border-border hover:border-accent hover:bg-accent/10"
                      >
                        <span className="text-[10px] text-muted-foreground">#{i + 1}</span>
                        <span className="ml-1 font-medium">{p.name}</span>
                        {p.note && <span className="ml-0.5 text-[9px] text-purple-500">({p.note})</span>}
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </details>

          <div className="mt-4 pt-3 border-t border-border">
            <h4 className="text-xs font-bold mb-2">배틀 관련 검색어 프리셋</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { label: 'PVP 그레이트 후보', query: 'cp-1500&3*,cp-1500&4*' },
                { label: 'PVP 울트라 후보', query: 'cp-2500&3*,cp-2500&4*' },
                { label: '마스터 4성', query: '4*&cp2500-' },
                { label: '그림자 3성+', query: 'shadow&3*,shadow&4*' },
                { label: '레거시 기술', query: '@special' },
                { label: '교환 진화', query: 'tradeevolve&!traded' },
                { label: '랭크배틀 보상', query: '@return,@frustration' },
                { label: 'XL 캔디 필요', query: 'cp-1500&xl,cp-2500&xl' },
              ].map(p => (
                <button key={p.label} onClick={() => { setQuery(localizeQuery(p.query)); setPendingOp(null); }}
                  className="px-2 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs border border-border text-left">
                  <span className="font-medium block">{p.label}</span>
                  <span className="font-mono text-accent text-[10px]">{p.query}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground mt-3">출처: pvpoke.com (2026-03 기준) | 메타는 시즌마다 변동됩니다</p>
        </div>
      ) : activeCategory === '_mega_trade' ? (
        <div className="bg-card border border-border rounded-xl p-3">
          <h3 className="text-sm font-bold mb-1">메가진화 교환용 리스트</h3>
          <p className="text-xs text-muted-foreground mb-3">교환하면 메가진화 에너지 비용이 할인됩니다. 교환할 포켓몬을 찾는 검색어를 생성하세요.</p>

          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => {
                const allNames = MEGA_TRADE_POKEMON.flatMap(c => c.pokemon.map(p => pokeName(p)));
                const unique = [...new Set(allNames)];
                setQuery(unique.join(',') + localizeQuery('&!traded&!lucky'));
                setPendingOp(null);
              }}
              className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg font-medium"
            >
              전체 메가 교환용 검색어
            </button>
            <button
              onClick={() => {
                const allNames = MEGA_TRADE_POKEMON.flatMap(c => c.pokemon.map(p => pokeName(p)));
                const unique = [...new Set(allNames)];
                setQuery(unique.join(',') + localizeQuery('&!traded&!lucky&!4*'));
                setPendingOp(null);
              }}
              className="px-3 py-1.5 text-xs bg-purple-500 text-white rounded-lg font-medium"
            >
              교환용 (4성 제외)
            </button>
          </div>

          <details className="mt-3">
            <summary className="text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground">포켓몬 목록 보기 ({MEGA_TRADE_POKEMON.reduce((a, c) => a + c.pokemon.length, 0)}종)</summary>
            <div className="space-y-3 mt-3">
              {MEGA_TRADE_POKEMON.map(cat => (
                <details key={cat.category}>
                  <summary className="text-xs font-bold cursor-pointer">
                    {cat.category} ({cat.pokemon.length}종)
                  </summary>
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-2">
                    <button
                      onClick={() => {
                        const names = [...new Set(cat.pokemon.map(p => pokeName(p)))];
                        setQuery(names.join(',') + localizeQuery('&!traded&!lucky'));
                        setPendingOp(null);
                      }}
                      className="px-2 py-1 text-[10px] bg-accent/10 text-accent rounded border border-accent/30"
                    >
                      이 세대 검색어
                    </button>
                    {cat.pokemon.map(p => (
                      <button
                        key={`${p.no}-${p.en}`}
                        onClick={() => addToken(pokeName(p))}
                        className="px-2 py-1.5 rounded-lg text-xs border border-border hover:border-accent hover:bg-accent/10"
                      >
                        <span className="text-[10px] text-muted-foreground font-mono">#{p.no}</span>
                        <span className="ml-1 font-medium">{p.name}</span>
                        <span className="ml-1 text-[9px] text-purple-500">→{p.mega}</span>
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </details>

          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              * 교환 시 메가에너지 비용: 100→20 (일반교환), 100→10 (반짝반짝교환)<br/>
              * 검색어에 !traded(미교환)&!lucky(반짝반짝 제외)가 자동 포함됩니다.<br/>
              * 친구와 서로 같은 포켓몬을 교환하면 양쪽 다 할인 혜택!
            </p>
          </div>
        </div>
      ) : activeCategory === '_trash' ? (
        <div className="bg-card border border-border rounded-xl p-3">
          <h3 className="text-sm font-bold mb-1">잡몬 정리 (박스 정리용)</h3>
          <p className="text-xs text-muted-foreground mb-3">배틀·레이드에서 쓸모없는 포켓몬 목록. 검색어를 생성해서 한번에 정리하세요.</p>

          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => {
                const allNames = TRASH_POKEMON.flatMap(c => c.pokemon.map(p => pokeName(p)));
                const q = allNames.join(',') + localizeQuery('&!shiny&!4*&!shadow&!costume&!lucky&!favorite&!dynamax&!gigantamax&!#');
                setQuery(q);
                setPendingOp(null);
              }}
              className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg font-medium"
            >
              전체 잡몬 검색어 생성
            </button>
            <button
              onClick={() => {
                const allNames = TRASH_POKEMON.flatMap(c => c.pokemon.map(p => pokeName(p)));
                const q = allNames.join(',') + localizeQuery('&!shiny&!4*&!3*&!shadow&!costume&!lucky&!favorite&!dynamax&!gigantamax&!#');
                setQuery(q);
                setPendingOp(null);
              }}
              className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded-lg font-medium"
            >
              잡몬 (3성 이하만)
            </button>
            <button
              onClick={() => {
                const allNames = TRASH_POKEMON.flatMap(c => c.pokemon.map(p => pokeName(p)));
                const q = allNames.join(',') + localizeQuery('&!shiny&!4*&!3*&!shadow&!costume&!lucky&!favorite&!dynamax&!gigantamax&!#&!traded');
                setQuery(q);
                setPendingOp(null);
              }}
              className="px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg font-medium"
            >
              잡몬 (교환 제외)
            </button>
          </div>

          <details className="mt-3">
            <summary className="text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground">포켓몬 목록 보기 ({TRASH_POKEMON.reduce((a, c) => a + c.pokemon.length, 0)}종)</summary>
            <div className="space-y-3 mt-3">
              {TRASH_POKEMON.map(cat => (
                <details key={cat.category}>
                  <summary className="text-xs font-bold cursor-pointer flex items-center justify-between">
                    <span>{cat.category} ({cat.pokemon.length}종)</span>
                  </summary>
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-2">
                    <button
                      onClick={() => {
                        const q = cat.pokemon.map(p => pokeName(p)).join(',') + localizeQuery('&!shiny&!4*&!shadow&!costume&!lucky&!favorite&!dynamax&!gigantamax&!#');
                        setQuery(q);
                        setPendingOp(null);
                      }}
                      className="px-2 py-1 text-[10px] bg-accent/10 text-accent rounded border border-accent/30"
                    >
                      이 카테고리 검색어 생성
                    </button>
                    {cat.pokemon.map(p => (
                      <button
                        key={p.no}
                        onClick={() => addToken(pokeName(p))}
                        className="px-2 py-1.5 rounded-lg text-xs border border-border hover:border-accent hover:bg-accent/10"
                      >
                        <span className="text-[10px] text-muted-foreground font-mono">#{p.no}</span>
                        <span className="ml-1 font-medium">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </details>

          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              * 자동 제외: 색이 다른, 4성, 그림자, 특별, 반짝반짝, 즐겨찾기, 다이맥스, 거다이 맥스, 태그<br/>
              * 개별 포켓몬 클릭 시 검색어에 추가됩니다.
            </p>
          </div>
        </div>
      ) : activeCategory === '_dex' ? (
        <div className="bg-card border border-border rounded-xl p-3">
          <h3 className="text-sm font-bold mb-1">포켓몬 도감</h3>
          <p className="text-xs text-muted-foreground mb-3">포켓몬을 검색해서 클릭하면 검색어에 추가됩니다</p>
          <input
            type="text"
            value={dexSearch}
            onChange={e => setDexSearch(e.target.value)}
            placeholder="이름 또는 번호 검색... (예: 피카츄, 25, pikachu)"
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm mb-3"
          />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-[50vh] overflow-y-auto">
            {filteredDex.map(p => (
              <button
                key={p.no}
                onClick={() => addToken(lang === 'ko' ? p.name : (p.en || p.name))}
                className="px-2 py-2 rounded-lg text-xs border border-border hover:border-accent hover:bg-accent/10 text-left"
              >
                <span className="text-[10px] text-muted-foreground font-mono">#{p.no}</span>
                <span className="block font-medium truncate">{p.name}</span>
                <span className="text-[10px] text-accent truncate block">{p.en}</span>
              </button>
            ))}
          </div>
          {dexSearch && filteredDex.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">검색 결과 없음</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">총 {pokedex.length}종 {dexSearch ? `(${filteredDex.length}건 일치)` : ''}</p>
        </div>
      ) : activeFilters ? (
        <div className="bg-card border border-border rounded-xl p-3">
          <h3 className="text-sm font-bold mb-1">{activeFilters.nameKo}</h3>
          {activeFilters.description && (
            <p className="text-xs text-muted-foreground mb-3">{activeFilters.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.items.map((item, i) => {
              const hasTemplate = item.value.includes('{');
              const isActive = templateInput?.index === i;

              if (isActive && hasTemplate) {
                // Inline input mode for this template item
                return (
                  <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs border-2 border-accent bg-accent/10">
                    <span className="text-[11px] text-muted-foreground">{item.label}:</span>
                    <input
                      autoFocus
                      value={templateInput.value}
                      onChange={e => setTemplateInput(prev => prev ? { ...prev, value: e.target.value } : null)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && templateInput.value) {
                          const result = templateInput.template.replace(/\{[^}]+\}/g, templateInput.value);
                          addToken(result);
                          setTemplateInput(null);
                        }
                        if (e.key === 'Escape') setTemplateInput(null);
                      }}
                      placeholder="값 입력 후 Enter"
                      className="w-20 px-1.5 py-0.5 text-xs bg-background border border-border rounded font-mono"
                    />
                    <button
                      onClick={() => {
                        if (templateInput.value) {
                          const result = templateInput.template.replace(/\{[^}]+\}/g, templateInput.value);
                          addToken(result);
                        }
                        setTemplateInput(null);
                      }}
                      className="text-[11px] text-accent font-medium"
                    >
                      +
                    </button>
                    <button onClick={() => setTemplateInput(null)} className="text-[11px] text-muted-foreground">✕</button>
                  </div>
                );
              }

              // Check if it has range pattern like {n}-{m}
              const hasRange = item.value.includes('{n}-{m}') || item.value.includes('{n}-');
              const isRangeActive = templateInput?.index === i + 1000;

              if (isRangeActive && hasRange) {
                const parts = templateInput!.value.split('~');
                return (
                  <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs border-2 border-accent bg-accent/10">
                    <span className="text-[11px] text-muted-foreground">{item.label}:</span>
                    <input
                      autoFocus
                      value={parts[0] || ''}
                      onChange={e => setTemplateInput(prev => prev ? { ...prev, value: e.target.value + '~' + (parts[1] || '') } : null)}
                      placeholder="최소"
                      className="w-14 px-1 py-0.5 text-xs bg-background border border-border rounded font-mono"
                    />
                    <span className="text-[10px]">~</span>
                    <input
                      value={parts[1] || ''}
                      onChange={e => setTemplateInput(prev => prev ? { ...prev, value: (parts[0] || '') + '~' + e.target.value } : null)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const [min, max] = templateInput!.value.split('~');
                          if (min && max) {
                            const prefix = templateInput!.template.split('{')[0];
                            addToken(`${prefix}${min}-${max}`);
                          }
                          setTemplateInput(null);
                        }
                        if (e.key === 'Escape') setTemplateInput(null);
                      }}
                      placeholder="최대"
                      className="w-14 px-1 py-0.5 text-xs bg-background border border-border rounded font-mono"
                    />
                    <button
                      onClick={() => {
                        const [min, max] = templateInput!.value.split('~');
                        if (min && max) {
                          const prefix = templateInput!.template.split('{')[0];
                          addToken(`${prefix}${min}-${max}`);
                        }
                        setTemplateInput(null);
                      }}
                      className="text-[11px] text-accent font-medium"
                    >+</button>
                    <button onClick={() => setTemplateInput(null)} className="text-[11px] text-muted-foreground">✕</button>
                  </div>
                );
              }

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (hasTemplate) {
                      if (hasRange && item.value.includes('{n}-{m}')) {
                        setTemplateInput({ index: i + 1000, value: '~', template: item.value });
                      } else {
                        setTemplateInput({ index: i, value: '', template: item.value });
                      }
                    } else {
                      addToken(item.value);
                    }
                  }}
                  className={`group relative px-2.5 py-1.5 rounded-lg text-xs border transition-colors border-border hover:border-accent hover:bg-accent/10 cursor-pointer ${
                    hasTemplate ? 'border-dashed' : ''
                  }`}
                  title={item.description}
                >
                  <span className="font-mono text-[11px] text-accent">{item.value}</span>
                  <span className="ml-1.5">{item.label}</span>
                  {hasTemplate && <span className="ml-1 text-[9px] text-muted-foreground">(클릭)</span>}
                  {item.description && (
                    <span className="hidden group-hover:block absolute left-0 top-full mt-1 z-20 bg-foreground text-background text-[10px] px-2 py-1 rounded shadow-lg max-w-[220px] whitespace-normal">
                      {item.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Category grid - BELOW filter panel */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-1.5 mt-4 mb-4">
        {[
          { id: '_dex', icon: '📖', label: '포켓몬도감' },
          { id: '_trash', icon: '⚠️', label: '잡몬정리' },
          { id: '_mega_trade', icon: '🔄', label: '메가교환' },
          { id: '_pvp', icon: '⚔️', label: '배틀' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveCategory(tab.id); setTemplateInput(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`px-2 py-2 rounded-lg text-[11px] text-center leading-tight ${
              activeCategory === tab.id
                ? 'bg-primary text-primary-foreground font-medium'
                : 'bg-card border border-border hover:bg-muted'
            }`}
          >
            <span className="block text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
        {searchFilters.filter(c => c.id !== 'operators').map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setTemplateInput(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`px-2 py-2 rounded-lg text-[11px] text-center leading-tight ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground font-medium'
                : 'bg-card border border-border hover:bg-muted'
            }`}
          >
            <span className="block text-base">{CATEGORY_ICONS[cat.id] || '📌'}</span>
            {cat.nameKo}
          </button>
        ))}
      </div>

      {/* Presets */}
      <div className="mt-3 bg-card border border-border rounded-xl p-3">
        <h3 className="text-sm font-bold mb-2">자주 쓰는 검색어</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
          {[
            { label: '4성 색이 다른', query: '4*&shiny' },
            { label: '미등록 진화', query: 'evolvenew' },
            { label: '전설+환상', query: 'legendary,mythical' },
            { label: '그림자 3성↑', query: 'shadow&3*,shadow&4*' },
            { label: '교환진화', query: 'tradeevolve&!traded' },
            { label: '반짝반짝 4성', query: 'lucky&4*' },
            { label: '특별 색이 다른', query: 'costume&shiny' },
            { label: '오늘 포획', query: 'age0' },
            { label: '1주일 이내', query: 'age-7' },
            { label: 'PVP 그레이트', query: 'cp-1500&3*,cp-1500&4*' },
            { label: 'PVP 울트라', query: 'cp-2500&3*,cp-2500&4*' },
            { label: '레거시 기술', query: '@special' },
            { label: '메가 진화', query: 'megaevolve' },
            { label: '다이맥스', query: 'dynamax' },
            { label: 'XXL', query: 'xxl' },
            { label: '최고의 파트너', query: 'buddy5' },
          ].map(preset => (
            <button key={preset.label} onClick={() => { setQuery(localizeQuery(preset.query)); setPendingOp(null); }}
              className="px-2 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs border border-border text-left">
              <span className="font-medium block">{preset.label}</span>
              <span className="font-mono text-accent text-[10px]">{preset.query}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickInput({ label, onAdd, placeholder }: {
  label: string; onAdd: (value: string) => void; placeholder?: string;
}) {
  const [val, setVal] = useState('');
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <input value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && val) { onAdd(val); setVal(''); } }}
        placeholder={placeholder || '값'}
        className="w-16 px-1.5 py-1 text-xs bg-muted border border-border rounded font-mono" />
      <button onClick={() => { if (val) { onAdd(val); setVal(''); } }} className="text-[11px] text-accent">+</button>
    </div>
  );
}

function RangeInput({ label, onAdd }: {
  label: string; onAdd: (min: string, max: string) => void;
}) {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <input value={min} onChange={e => setMin(e.target.value)} placeholder="최소"
        className="w-14 px-1 py-1 text-xs bg-muted border border-border rounded font-mono" />
      <span className="text-[10px]">~</span>
      <input value={max} onChange={e => setMax(e.target.value)} placeholder="최대"
        className="w-14 px-1 py-1 text-xs bg-muted border border-border rounded font-mono" />
      <button onClick={() => { if (min && max) { onAdd(min, max); setMin(''); setMax(''); } }} className="text-[11px] text-accent">+</button>
    </div>
  );
}
