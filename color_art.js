//// GET RANDOM COMBINATIONS C
import * as THREE from "three";

// import * as THREE from "https://cdn.skypack.dev/three@0.136.0";

import { get_color_b } from "./a_tools.js";

function get_ground() {
	return c_ground;
}

function get_edge_lines() {
	return edge_lines;
}

export { get_ground, get_edge_lines };

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}

	return array;
}

/////////// colorsss

let c_building, // F
	c_base, // F/P
	c_sd1, // F/P
	c_cars1, // F/P
	c_sd2, // F
	c_ground, // F
	c_trees, // F/P
	c_cars2, // F
	c_trails_cars,
	c_trails_p,
	dis_kind; // FP

let f_sd1 = true, // fp
	f_cars1 = true, // fp
	f_cars2 = true,
	f_sd2 = true, // fp
	f_trees = true, // fp **
	f_trails_cars = true, // fp **
	f_trails_p = true, // fp **
	g_trails_cars = true,
	g_trails_p = true,
	g_cars1 = true,
	g_cars2 = true,
	lake_col = 0,
	edge_lines = null;

//#42e8dc,#23648f,#1d3241
let arr_colors = [
	["#181717", "#392a2a", "#2d1b1b"],
	["#181717", "#392a2a", "#2d1b1b", "#Dedede", "#969494"],
	["#444241", "#181717", "#878480", "#f1f0eb"],
	[
		"#b9b4af",
		"#5b5a57",
		"#444241",
		"#181717",
		"#3c3c3a",
		"#76726e",
		"#878480",
		"#f1f0eb",
		"#4c4c44",
		"#7e7c73",
	],
	["#e37847", "#42e8dc", "#23648f", "#1d3241", "#968f73", "#848283"], //'#f1f2ef'
	["#c2dda8", "#94bca4", "#737f76", "#aca59f", "#494340"],
	["#ffffff", "#000000", "#a9b7d0", "#3e414e"],
	["#723458", "#cb7368", "#0d0505", "#8c3c4d", "#321819"],
	[
		"#8841c0",
		"#7d2960",
		"#2e0f7d",
		"#1d0f3a",
		"#542052",
		"#403252",
		"#604c7b",
		"#3c153d",
	],
	["#0f0607", "#331c1c", "#e28673", "#542444", "#a2555a", "#502532", "#895844"],
	["#efc172", "#805534", "#462e1b", "#2e1e14", "#160f09"], // 10
	["#595846", "#9f865f", "#ebc57e", "#bdb476", "#d49c6c", "#9ca47c", "#6c5444"],
	["#cfd3d5", "#7d93a0", "#15212c", "#817677", "#3e5d70", "#76d0f0"],
	["#c9231f", "#781818", "#1d1f35", "#057e53", "#3a3b52", "#351b2b", "#7e5a30"],
	["#45381c", "#0c3534", "#a77b32", "#d3aa45", "#246133", "#0f3424", "#d84211"],
	["#3a2f36", "#353438", "#4d5a4c", "#60825a"],
	[
		"#131212",
		"#333530",
		"#81b46e",
		"#3a3e37",
		"#fef1af",
		"#e0b154",
		"#a77740",
		"#36342e",
		"#384334",
	], // w,org,yellow,brown,black,green
	["#f6eccc", "#e4d3a8", "#6c6351", "#554b3e", "#3c372f"], // 233 --> brown
	[
		"#212c33",
		"#e36341",
		"#fef7d4",
		"#a39676",
		"#fbeec2",
		"#67645f",
		"#533433",
		"#353333",
	], // org,black,233,brown,red
	[
		"#d3cfcb",
		"#3e372c",
		"#9a8f80",
		"#c89843",
		"#7e7b7a",
		"#73634d",
		"#acaca3",
		"#5f5e5c",
		"#acacac",
		"#827c6a",
	],
	["#463c39", "#b6b2b1", "#7e7977", "#949490", "#21201f"], // 20
	[
		"#654d49",
		"#d5ccc3",
		"#9f948c",
		"#c29487",
		"#9c635b",
		"#292423",
		"#b8acac",
		"#601616",
		"#837c7c",
		"#d1b49c",
	],
	["#181717", "#5b5a57", "#444241"], //'#5b5a57','#444241','#181717','#3c3c3a','#76726e','#878480','#f1f0eb','#4c4c44','#7e7c73'],

	[
		"#dca040",
		"#dc5434",
		"#e4dc9c",
		"#f2f1e7",
		"#545434",
		"#42342f",
		"#2c4444",
		"#d0b4a4",
		"#c89080",
		"#8c8c74",
	], // autumn
	["#ffffff"],
	["#125b32", "#447551"],
	[
		"#284a4c",
		"#6e5b4d",
		"#8f7e66",
		"#7c8d84",
		"#1bc1ba",
		"#bcbe96",
		"#b0c1b8",
		"#d0c7b8",
	],
	["#dddddd", "#dd2222", "#663322"],
	[
		"#d0abb8",
		"#2a191e",
		"#885560",
		"#5e3340",
		"#9c9c91",
		"#be3264",
		"#695a66",
		"#645f55",
		"#493d46",
		"#9e829d",
	], // 9 == pink forst
	["#dfd8cf", "#1c1c1c"], // 10 brwdn wihte
	["#dfd8cf", "#1c1c1c", "#004444"],
	[
		"#4a667e",
		"#c0bfbb",
		"#4d3714",
		"#a2a2a0",
		"#8a693a",
		"#333940",
		"#6e7577",
		"#191c19",
	],
	[
		"#1e81b0",
		"#eeeee4",
		"#e28743",
		"#eab676",
		"#76b5c5",
		"#21130d",
		"#873e23",
		"#abdbe3",
		"#063970",
		"#ff1111",
	],
	["#000000"],
	["#fee40b", "#ef7400", "#ca2b27", "#0088c4", "#3ec46d"], // coral
	[
		"#42e8dc",
		"#23648f",
		"#42e8dc",
		"#23648f",
		"#1d3241",
		"#968f73",
		"#f1f2ef",
		"#e37847",
	],
	["#848283", "#57b8bc", "#259faf", "#152636", "#044553"], // 36 //'#b4d2d3'
	["#770000"], // 37
	[
		"#77110d",
		"#ad5316",
		"#2b482c",
		"#caa330",
		"#2b4025",
		"#192718",
		"#c09c31",
		"#f29f31",
		"#be681d",
		"#ae341d",
		"#0b0c0c",
		"#291815",
	], // 38

	["#373734", "#3ba3a4", "#20697B", "#A63813", "#ffffff"], // blck white cyan org // 39
	["#efe8e2", "#a41752", "#000000"], // 'white pink black // 40
	["#f0aae1", "#93702d", "#e099e1", "#83502a", "#220000"], // white bl shit
	["#d6d5d5", "#222222", "#878787", "#6c6c6b", "#646c6c"], // gray
	["#16496c", "#3c8a88", "#ddcfb0", "#dd983d", "#985d75"], // cyan white ylw white
	["#d81128", "#54aca4", "#355555", "#d6dccc", "#cc454b"], // red white cyan /'#edebe2'
	["#651e3a", "#d7b48d", "#253637", "#5e5144", "#a15637", "#a3a2a4"], // 45
	["#da8a9d", "#89253e", "#f2d3d9", "#b73457", "#c3536f", "#fcbcd4"], // pink

	["#CCC1C2", "#696161", "#6DFD6E", "#5B5C6D"], // 47
	["#BC4C1C", "#221202", "#F77747", "#250505", "#69E9E9", "#364606"],
	["#5E1E4A", "#E3A2C1", "#AE44A4", "#B78757"],
	["#EDCB0E", "#FFBE0E", "#9E9E9E"], //

	["#C2F6C2", "#61DD61", "#C20963", "#121212"], // 51
	["#3F3F9E", "#616161", "#C22463"],
	["#128C12", "#820913", "#AF313B", "#9A1D5D", "#256025", "#540413"],
	["#4B42C3", "#4B42C3", "#4B42C3", "#FF6C2C", "#E56626", "#4516D5"], //'#4B42C3', '#4B42C3', '#FF6C2C', '#E56626', '#4516D5'
	["#052305", "#872387", "#6923A7", "#4B00F6"],
	["#493B39", "#5F8C5A", "#B487BC", "#4E74D5"], // 56666
	["#CC8293", "#5BF2F4", "#613557", "#84E9DB"],
	["#FFCB0E", "#008282"],
	["#2CC1C2", "#0212E5", "#6DFD6E", "#5B5C6D", "#2B3525"],
	["#6DFD6E", "#5B5C6D", "#004600"],
	["#2CC1C2", "#4A6222", "#121212", "#6DFD6E", "#5B5C6D"],
	[
		"#8C2C6B",
		"#6C0D21",
		"#44060E",
		"#3361F4",
		"#3E1E1E",
		"#894586",
		"#8C9703",
		"#0DD601",
		"#365838",
		"#9CD405",
		"#F5C8BB",
		"#AC3628",
	],
	["#641777", "#B9E4E6", "#6E1EED", "#16A103", "#821112"],
	["#000000", "#6DFD6E", "#5B5C6D", "#46A5E6"],
	["#83D354", "#00CA4B", "#DEDEDE"],
	["#F5F403", "#B701C1", "#9DBBC7", "#95A675", "#FB89B5", "#2A1513", "#A41332"],
	["#FFCB0E", "#000000", "#FF8C00", "#E1E1E1"],
	[
		"#2D74A4",
		"#D2D2F2",
		"#1F3767",
		"#C60042",
		"#7F2AD9",
		"#664564",
		"#FF8E8C",
		"#4E5644",
		"#AA88F7",
	],
	["#A1A252", "#6B3494", "#FFCB0E"],
	["#052233", "#D86D53"],
	["#F6D163", "#79D163", "#FFF9C1", "#016172"],
	["#121212", "#CF3A11", "#5E5E5E"],
	["#DEF2B7", "#3416EE", "#A30C3A", "#C49C0F"],
	["#FFCB0E", "#121212", "#851212"],
	["#7D2333", "#241212"],
	["#F7AA8B", "#034A49", "#BCBCFD", "#8827B7", "#474564"],
	["#FFCB0E"],
	["#601616", "#9a443f", "#c58d7c", "#d5ccc3", "#99948e"], // 78
	["#331111", "#967274", "#86646f", "#85505f"], // 79
	["#949494", "#737373", "#525252", "#313131", "#101010"],

	[
		"#432122",
		"#896763",
		"#303030",
		"#4c4e4e",
		"#83363d",
		"#71341d",
		"#262628",
		"#000000",
		"#b9a082",
		"#d8c5af",
	], // 81

	[
		"#2a3c2c",
		"#364c37", // grn gren
		"#858e80",
		"#757c6f", // gry gry
		"#24281b",
		"#684432", // blk brn
		"#262628",
		"#000000", //blk blk
		"#405831",
		"#405441",
	], // wt wt

	// [0x2a3c2c,0x364c37,// grn gren
	// 0x858e80,0x757c6f, // gry gry
	// 0x24281b,0x684432, // blk brn
	// 0x262628,0x000000, //blk blk
	// 0x405831,0x405441], // wt wt

	["#041b29", "#0c2939", "#083248", "#8c0e0f", "#e69c31", "#dca958"], // 83

	["#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557"],
	["#606c38", "#283618", "#fefae0", "#dda15e", "#bc6c25"],
	["#cdb4db", "#ffc8dd", "#ffafcc", "#bde0fe", "#a2d2ff"],
	["#edede9", "#d6ccc2", "#f5ebe0", "#e3d5ca", "#d5bdaf"],
	["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
	["#22223b", "#4a4e69", "#9a8c98", "#c9ada7", "#f2e9e4"],
	["#dad7cd", "#a3b18a", "#588157", "#3a5a40", "#344e41"], // 90
	[
		"#001219",
		"#005f73",
		"#0a9396",
		"#94d2bd",
		"#e9d8a6",
		"#ee9b00",
		"#ca6702",
		"#bb3e03",
		"#ae2012",
		"#9b2226",
	],
	[
		"#848283",
		"#219ebc",
		"#023047",
		"#023047",
		"#ffb703",
		"#fb8500",
		"#ffb703",
		"#fb8500",
	], // 92
	["#ccd5ae", "#e9edc9", "#fefae0", "#faedcd", "#d4a373"], //
	["#000814", "#001d3d", "#003566", "#ffc300", "#ffd60a"],
	["#231942", "#5e548e", "#9f86c0", "#be95c4", "#e0b1cb"], // 95 848283
	["#f6bd60", "#f7ede2", "#f5cac3", "#84a59d", "#f28482"],
	["#f4f1de", "#e07a5f", "#3d405b", "#81b29a", "#f2cc8f"],
	["#ffcdb2", "#ffb4a2", "#e5989b", "#b5838d", "#6d6875"],
	["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
	[
		"#fbf8cc",
		"#fde4cf",
		"#ffcfd2",
		"#f1c0e8",
		"#cfbaf0",
		"#a3c4f3",
		"#90dbf4",
		"#8eecf5",
		"#98f5e1",
		"#b9fbc0",
	], //100
	["#cad2c5", "#84a98c", "#52796f", "#354f52", "#2f3e46"],
	[
		"#eae4e9",
		"#fff1e6",
		"#fde2e4",
		"#fad2e1",
		"#e2ece9",
		"#bee1e6",
		"#f0efeb",
		"#dfe7fd",
		"#cddafd",
	],
	["#cb997e", "#ddbea9", "#ffe8d6", "#b7b7a4", "#a5a58d", "#6b705c"],
	["#000000", "#14213d", "#fca311", "#e5e5e5", "#ffffff"],
	[
		"#03045e",
		"#023e8a",
		"#0077b6",
		"#0096c7",
		"#00b4d8",
		"#48cae4",
		"#90e0ef",
		"#ade8f4",
		"#caf0f8",
	],
	[
		"#7400b8",
		"#6930c3",
		"#5e60ce",
		"#5390d9",
		"#4ea8de",
		"#48bfe3",
		"#56cfe1",
		"#64dfdf",
		"#72efdd",
		"#80ffdb",
	],
	["#780000", "#c1121f", "#fdf0d5", "#003049", "#669bbc"],
	["#0d1b2a", "#1b263b", "#415a77", "#778da9", "#848283"], ///108  848283
	[
		"#ffedd8",
		"#f3d5b5",
		"#e7bc91",
		"#d4a276",
		"#bc8a5f",
		"#a47148",
		"#8b5e34",
		"#6f4518",
		"#603808",
		"#583101",
	],
	[
		"#03071e",
		"#370617",
		"#6a040f",
		"#9d0208",
		"#d00000",
		"#dc2f02",
		"#e85d04",
		"#f48c06",
		"#faa307",
		"#ffba08",
	],
	[
		"#fec5bb",
		"#fcd5ce",
		"#fae1dd",
		"#f8edeb",
		"#e8e8e4",
		"#d8e2dc",
		"#ece4db",
		"#ffe5d9",
		"#ffd7ba",
		"#fec89a",
	],
	["#006d77", "#83c5be", "#edf6f9", "#ffddd2", "#e29578"],
	[
		"#f8f9fa",
		"#e9ecef",
		"#dee2e6",
		"#ced4da",
		"#adb5bd",
		"#6c757d",
		"#495057",
		"#343a40",
		"#212529",
	],
	["#fffcf2", "#ccc5b9", "#403d39", "#252422", "#eb5e28"],
	[
		"#582f0e",
		"#7f4f24",
		"#936639",
		"#a68a64",
		"#b6ad90",
		"#c2c5aa",
		"#a4ac86",
		"#656d4a",
		"#414833",
		"#333d29",
	],
	["#562c2c", "#f2542d", "#f5dfbb", "#0e9594", "#127475", "#ff7d00"],
	[
		"#0b090a",
		"#161a1d",
		"#660708",
		"#a4161a",
		"#ba181b",
		"#e5383b",
		"#b1a7a6",
		"#d3d3d3",
		"#f5f3f4",
		"#ffffff",
	],
	["#353535", "#3c6e71", "#ffffff", "#d9d9d9", "#284b63"],
	["#461220", "#8c2f39", "#b23a48", "#fcb9b2", "#fed0bb"],
	["#d0db97", "#69b578", "#3a7d44", "#254d32", "#181d27"],
	["#93b7be", "#f1fffa", "#d5c7bc", "#785964", "#454545"],
	["#6e0d25", "#ffffb3", "#dcab6b", "#774e24", "#6a381f"],
	["#070707", "#553555", "#755b69", "#96c5b0", "#adf1d2"],
	["#698fd1", "#698fd1", "#fed5a9", "#f0b184", "#a11b2e", "#a11b2e"], // 4
	["#fae6d9", "#f7e4c9", "#695c54"],
	["#9b55ec", "#ba85f1", "#4e2373", "#7e187a", "#ddccdf"],
	["#506c64", "#5b4f47", "#848283", "#6a381f", "#6f8289"], //#848283
	["#8c230a", "#cd6212", "#f69c20", "#5e5717"], // automn 128
	["#216277", "#0f49a5", "#254F92", "#14304d"], // 129 //blue
	["#d4c26e", "#7c851c", "#ab854f", "#754f24", "#1f1712"], // 130
	["#333333", "#666666", "#777777", "#999999", "#aaaaaa", "#cccccc"], // gry plt //131
	[
		"#002222",
		"#003333",
		"#004444",
		"#005555",
		"#006666",
		"#007777",
		"#008888",
		"#009999",
	], // blue plt //132

	[
		"#2b3d3d",
		"#c6c5b9",
		"#835d5e",
		"#90ae9f",
		"#8b2c33",
		"#7c2c35",
		"#3e3134",
		"#5d4b4d",
		"#3e3e41",
	], //133 // milli
	["#201329", "#121719", "#40305d", "#33777c", "#1c3a44", "#6c939c"], // night
	["#1a1a1a", "#2a2728", "#f9f2e6", "#c6b8a4", "#a19a77", "#575544", "#36342d"], // vin drk
	[
		"#d8ac66",
		"#cfaf85",
		"#b1ab8d",
		"#493f33",
		"#695e43",
		"#393933",
		"#c39b6e",
		"#2c1c1a",
		"#462521",
	], // vin
	["#5d4d4a", "#d5c5ba", "#9c9289", "#b2ada5", "#96645c", "#4d1818", "#bd564c"], // rd 137
	["#0e0e0e", "#654365", "#c7efe2", "#7f6a72"], // 138
	["#bec3c1", "#72624c", "#517e83", "#53484e"], // 139
	["#0b0704", "#402b1a", "#78603b"], // 140

	["#6e0d25", "#848283", "#dcab6b", "#774e24", "#6a381f"], // dup 36 (141)

	["#f6eccc"], //9  (142) fef7d4,

	,
];

//['#f6eccc','#e4d3a8','#6c6351','#554b3e','#3c372f'],

let flag_memories = true;

let mc_arr = null;

function func_kind(k, temp, map_grps) {
	// console.log('k==',k)
	// throw "s"
	return k == 0
		? temp <= map_grps.size / 2 // half
		: k == 1
		? temp % 2 == 0 // %
		: k == 2
		? true // only noise
		: false; // k ==3  // only 1 color
}

export { func_kind };

// 27 lake shit
let c3 = 1;

//^^^

let arr_comb = [
	[
		// ------------ blk white  0
		1, // bld
		0x110000, //sd // outer // 1 color
		4, //cr1 // 40,4
		4, //cr2
		0x000000, //sd // park
		0xffffff, // grd
		[arr_colors[22]], // tres
		0x000000, // trials c
		false, /// grp t c //
		0x000000, // t p
		false, /// grp t p
		1,
		33,
	],

	[
		// ---------- artblock rd prlpl grn  1
		13, // bld
		0, //sd
		13, //cr1
		4, //cr2
		0, //sd
		"#1d1f44", // grd //'#1d1f99'
		[arr_colors[13]], // tres
		13, // trials c
		true, /// grp t c
		13, // t p
		true, /// grp t p
		1,

		13,
	],

	[
		// -------- coral  (?) 2
		34, // bld
		0xaa5500, //sd
		34, //cr1
		34, //cr2
		0xaa5500, //sd
		"#033b61", // grd
		[arr_colors[34]], // tres
		34, // trials c
		true, /// grp t c
		34, // t p
		true, /// grp t p
		1,

		34,
	],

	////#42e8dc,#23648f,#1d3241
	[
		// ------------ water color blue ground 3
		0, //0
		arr_colors[4][4], //sd
		36, //cr1
		36, //cr2
		arr_colors[4][4], //sd
		arr_colors[4][2], // grd //arr_colors[4][2], 0x110000 0x110033
		[arr_colors[4]], // tres
		4, // trials c
		true, /// grp t c
		4, // t p
		true, /// grp t p
		1,

		36, // lake group col // 88 or brn
	],

	[
		//-------- water color blue ground 4 correct ***** 4
		1, // bld
		0, //sd
		1, //cr1
		1, //cr2
		0, //sd
		"#132632", // grd //  '#162232'
		[arr_colors[36]], // tres
		4, // trials c
		true, /// grp t c
		4, // t p
		true, /// grp t p
		1,

		132,
	],

	[
		// --------  mc red  55
		37, // bld
		0, //sd
		38, //cr1
		38, //cr2
		0, //sd
		"#440000", // grd //  '#162232'
		[
			["#77110d", "#ad5316"],
			["#2b482c", "#caa330"],
			["#2b4025", "#192718"],
			["#c09c31", "#f29f31"],
			["#be681d", "#ae341d"],
			["#0b0c0c", "#291815"],

			// arr_colors[38]
		], // tres
		4, // trials c
		true, /// grp t c
		4, // t p
		true, /// grp t p
		1,

		4, // 3
	],

	[
		// --------  green jungle  6
		14, // bld
		0, //sd
		14, //cr1
		14, //cr2
		0, //sd
		arr_colors[14][5], // grd //  '#162232'
		[arr_colors[14]], // tres
		4, // trials c
		true, /// grp t c
		4, // t p
		true, /// grp t p
		1,

		36, // 4
	],

	[
		// --------   red pink 7
		79, // bld
		arr_colors[79][1], //sd
		79, //cr1
		79, //cr2
		arr_colors[79][1], //sd
		"#110000", // grd //  '#162232'
		[
			arr_colors[79].slice(0, 2),
			arr_colors[79].slice(1, 3),
			arr_colors[79].slice(2, 4),
			// arr_colors[79].slice(0,2),
			// arr_colors[78]
		], // tres
		79, // trials c
		true, /// grp t c
		79, // t p
		true, /// grp t p
		1,

		79, // 3 // need less white
	],

	[
		// --------  purple  8
		8, // bld
		0, //sd
		8, //cr1
		8, //cr2
		0, //sd
		"#111111", // grd //  '#162232' // '#111111'
		[
			arr_colors[8], // arr_colors[78]
		], // tres
		8, // trials c
		true, /// grp t c
		8, // t p
		true, /// grp t p
		1,

		8, // 3
	],

	[
		// --------  vin  9
		17, // bld
		arr_colors[17][2], //sd arr_colors[17][0]
		17, //cr1
		17, //cr2
		arr_colors[17][2], //sd
		"#111111", // grd //  '#162232'
		[
			arr_colors[17], // arr_colors[78]
		], // tres
		17, // trials c
		true, /// grp t c
		17, // t p
		true, /// grp t p
		2,

		17, // 3
	],

	[
		// --------  grn br 10 /// *
		15, // bld
		arr_colors[15][1], //sd
		15, //cr1
		15, //cr2
		arr_colors[15][1], //sd
		arr_colors[15][2], // grd //  '#162232'
		[
			arr_colors[15], // arr_colors[78]
		], // tres
		15, // trials c
		true, /// grp t c
		4, // t p
		true, /// grp t p
		1,

		15, // 3
	],

	[
		// --------  pink ylw 11
		7, // bld
		arr_colors[7][1], //sd
		7, //cr1
		7, //cr2
		arr_colors[7][1], //sd
		0x110000, // grd //  '#162232'
		[
			arr_colors[7],
			arr_colors[11], // arr_colors[78]
		], // tres
		11, // trials c
		true, /// grp t c
		7, // t p
		true, /// grp t p
		1,
		56, // lake
	],

	[
		// --------  bl rd wht 12
		81, // bld
		arr_colors[81][1], //sd
		81, //cr1
		81, //cr2
		arr_colors[81][1], //sd
		"#162232", // grd //  '#162232'
		[arr_colors[81]], // tres
		81, // trials c
		true, /// grp t c
		81, // t p
		true, /// grp t p
		1,
		82, // 71
	],

	[
		// --------  gr ornh br 13
		82, // bld
		arr_colors[82][0], //sd
		82, //cr1
		82, //cr2
		arr_colors[82][0], //sd
		0x111111, // grd //  '#162232'
		[arr_colors[82]], // tres
		82, // trials c
		true, /// grp t c
		82, // t p
		true, /// grp t p
		1,
		25,
	],

	[
		// --------  gr ornh br 14
		16, // bld
		arr_colors[16][0], //sd
		16, //cr1
		16, //cr2
		arr_colors[16][0], //sd
		0x221111, // grd //  '#162232'
		[arr_colors[16]], // tres
		4, // trials c
		true, /// grp t c
		4, // t p
		true, /// grp t p
		1,
		22,
	],

	[
		// --------  rd gold blue 15
		83, // bld
		arr_colors[83][1], //sd
		83, //cr1
		83, //cr2
		arr_colors[83][1], //sd
		"#111111", // grd //  '#162232'
		[
			arr_colors[83],
			// arr_colors[83].slice(0,2),
			// arr_colors[83].slice(2,4),
			// arr_colors[83].slice(4,6),
			// arr_colors[83].slice(4,6)
		], // tres
		83, // trials c
		true, /// grp t c
		83, // t p
		true, /// grp t p
		1,
		83,
	],

	[
		// --------  rd gold blue 16
		13, // bld
		arr_colors[13][4], //sd
		13, //cr1
		1, //cr2
		arr_colors[13][4], //sd
		0x221111, // grd //  '#162232'
		[arr_colors[13], arr_colors[1]], // tres
		13, // trials c
		true, /// grp t c
		1, // t p
		true, /// grp t p
		1,
		13,
	],

	//^^^
	[
		// --------  rd gold blue 17
		0, // bld
		0xaaaaaa, //sd
		36, //cr1
		13, //cr2
		0xaaaaaa, //sd
		"#221111", // grd //  '#162232'
		[
			arr_colors[1],
			// shuffleArray(arr_colors[c3]).slice(0,3),
			// shuffleArray(arr_colors[c3]).slice(3,6),
			// shuffleArray(arr_colors[c3]).slice()
		], // tres
		4, // trials c
		true, /// grp t c
		4, // t p
		true, /// grp t p
		1,
		36,
	],

	[
		// --------  rd gold blue 18
		127, // bld
		arr_colors[127][0], //sd
		40, //cr1
		40, //cr2
		arr_colors[127][0], //sd
		"#110000", // grd //  '#162232'
		[
			// arr_colors[c3]
			// shuffleArray(arr_colors[127]).slice(),
			// shuffleArray(arr_colors[127]).slice(),
			// shuffleArray(arr_colors[127]).slice()

			// arr_colors[127].slice(0,2),
			// arr_colors[127].slice(2,4),
			// arr_colors[127].slice(4,6)
			arr_colors[127],
		], // tres
		127, // trials c
		true, /// grp t c
		127, // t p
		true, /// grp t p
		1,
		127,
	],

	[
		// --------  rd gold blue 19
		124, // bld
		arr_colors[124][0], //sd
		124, //cr1
		124, //cr2
		arr_colors[124][0], //sd
		"#220000", // grd //  '#162232'
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[124]).slice(),
			shuffleArray(arr_colors[124]).slice(),
			shuffleArray(arr_colors[124]).slice(),
		], // tres
		124, // trials c
		true, /// grp t c
		124, // t p
		true, /// grp t p
		1,
		124,
	],

	[
		// --------  20 =========
		122, // bld
		arr_colors[122][1], //sd
		122, //cr1
		122, //cr2
		arr_colors[122][1], //sd
		"#220000", // grd //  '#162232'
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[122]).slice(),
			shuffleArray(arr_colors[122]).slice(),
			shuffleArray(arr_colors[122]).slice(),
		], // tres
		122, // trials c
		true, /// grp t c
		122, // t p
		true, /// grp t p
		1,
		141,
	],

	[
		// --------  21 =========
		108, // bld
		arr_colors[108][0], //sd
		7, //cr1
		7, //cr2
		arr_colors[108][0], //sd
		"#000011", // grd //  '#162232'
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[108]).slice(),
			shuffleArray(arr_colors[108]).slice(),
			shuffleArray(arr_colors[108]).slice(),
		], // tres
		108, // trials c
		true, /// grp t c
		108, // t p
		true, /// grp t p
		1,
		108,
	],

	[
		// --------  22 =========
		95, // bld
		arr_colors[95][2], //sd
		95, //cr1
		95, //cr2
		arr_colors[95][2], //sd
		"#111122", // grd //  '#162232'
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[95]).slice(),
			shuffleArray(arr_colors[95]).slice(),
			shuffleArray(arr_colors[95]).slice(),

			// arr_colors[95].slice(0,3),
			// arr_colors[95].slice(3,6),
		], // tres
		95, // trials c
		true, /// grp t c
		95, // t p
		true, /// grp t p
		1,
		95,
	],

	[
		// --------  23 =========
		92, // bld
		arr_colors[92][2], //sd
		92, //cr1
		92, //cr2
		arr_colors[92][2], //sd
		"#000011", // grd //  '#162232'
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[92]).slice(),
			shuffleArray(arr_colors[92]).slice(),
			shuffleArray(arr_colors[92]).slice(),
		], // tres
		92, // trials c
		true, /// grp t c
		92, // t p
		true, /// grp t p
		1,
		92,
	],

	[
		// --------  24 =========
		91, // bld
		arr_colors[91][2], //sd
		91, //cr1
		91, //cr2
		arr_colors[91][2], //sd
		"#111122", // grd //  '#162232'
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[91]).slice(),
			shuffleArray(arr_colors[91]).slice(),
			shuffleArray(arr_colors[91]).slice(),
		], // tres
		91, // trials c
		true, /// grp t c
		91, // t p
		true, /// grp t p
		1,
		91,
	],

	[
		// --------  25 =========
		90, // bld
		arr_colors[90][2], //sd
		90, //cr1
		90, //cr2
		arr_colors[90][2], //sd
		arr_colors[90][4], // grd //  '#162232'
		[
			arr_colors[90],
			arr_colors[9],
			// shuffleArray(arr_colors[90]).slice(),
			// shuffleArray(arr_colors[90]).slice(),
			// shuffleArray(arr_colors[90]).slice()
		], // tres
		36, // trials c
		true, /// grp t c
		36, // t p
		true, /// grp t p
		1,
		36,
	],

	[
		// --------  26 =========
		85, // bld
		arr_colors[85][2], //sd
		85, //cr1
		85, //cr2
		arr_colors[85][2], //sd
		arr_colors[85][1], // grd //  '#162232'
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[85]).slice(),
			shuffleArray(arr_colors[85]).slice(),
			shuffleArray(arr_colors[85]).slice(),
		], // tres
		85, // trials c
		true, /// grp t c
		85, // t p
		true, /// grp t p
		1,
		85,
	],

	[
		// --------  27 =========
		81, // bld
		arr_colors[81][2], //sd
		81, //cr1
		81, //cr2
		arr_colors[81][2], //sd
		"#110000", // grd //  '#162232' arr_colors[81][1]
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[81]).slice(),
			shuffleArray(arr_colors[81]).slice(),
			shuffleArray(arr_colors[81]).slice(),
		], // tres
		81, // trials c
		true, /// grp t c
		81, // t p
		true, /// grp t p
		1,
		14,
	],

	[
		// --------  28 =========
		76, // bld
		arr_colors[76][2], //sd
		76, //cr1
		76, //cr2
		arr_colors[76][2], //sd
		"#001100", // grd //  '#162232' //arr_colors[76][1]
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[76]).slice(),
			shuffleArray(arr_colors[76]).slice(),
			shuffleArray(arr_colors[76]).slice(),
		], // tres
		76, // trials c
		true, /// grp t c
		76, // t p
		true, /// grp t p
		1,
		36,
	],

	[
		// --------  29 =========
		54, // bld
		arr_colors[54][0], //sd
		54, //cr1
		54, //cr2
		arr_colors[54][0], //sd
		0x110000, // grd //  '#162232' arr_colors[54][1]
		[
			arr_colors[54],
			arr_colors[8],
			// arr_colors[54].slice(0,2),
			// arr_colors[54].slice(),
			// shuffleArray(arr_colors[54]).slice()
		], // tres
		4, // trials c 13
		true, /// grp t c
		15, // t p
		true, /// grp t p
		1,
		8,
	],

	[
		// --------  30 =========
		53, // bld
		arr_colors[53][2], //sd
		53, //cr1
		53, //cr2
		arr_colors[53][2], //sd
		"#220000", // grd //  '#162232'
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[53]).slice(),
			shuffleArray(arr_colors[53]).slice(),
			shuffleArray(arr_colors[53]).slice(),
		], // tres
		79, // trials c
		true, /// grp t c
		79, // t p
		true, /// grp t p
		1,
		53,
	],

	[
		// --------  31 =========
		45, // bld
		arr_colors[45][2], //sd
		45, //cr1
		45, //cr2
		arr_colors[45][2], //sd
		"#220000", // grd //  '#162232'
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[45]).slice(),
			shuffleArray(arr_colors[45]).slice(),
			shuffleArray(arr_colors[45]).slice(),
		], // tres
		45, // trials c
		true, /// grp t c
		45, // t p
		true, /// grp t p
		1,
		45,
	],

	[
		// --------  32 =========
		44, // bld
		arr_colors[44][2], //sd
		44, //cr1
		44, //cr2
		arr_colors[44][2], //sd
		"#110000", // grd //  '#162232'
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[44]).slice(),
			shuffleArray(arr_colors[44]).slice(),
			shuffleArray(arr_colors[44]).slice(),
		], // tres
		44, // trials c
		true, /// grp t c
		44, // t p
		true, /// grp t p
		1,
		44,
	],

	[
		// --------  33 =========
		41, // bld
		arr_colors[41][2], //sd
		41, //cr1
		41, //cr2
		arr_colors[41][2], //sd
		0x110000, // grd //  '#162232'
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[41]).slice(),
			shuffleArray(arr_colors[41]).slice(),
			shuffleArray(arr_colors[41]).slice(),
		], // tres
		10, // trials c
		true, /// grp t c
		10, // t p
		true, /// grp t p
		1,
		108,
	],

	[
		// --------  34 ========= xxxxxxxxxxxx
		40, // bld
		arr_colors[40][2], //sd
		7, //cr1
		7, //cr2
		arr_colors[40][2], //sd
		0x110011, // grd //  '#162232' //arr_colors[40][1],
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[40]).slice(),
			shuffleArray(arr_colors[40]).slice(),
			shuffleArray(arr_colors[40]).slice(),
		], // tres
		7, // trials c
		true, /// grp t c
		7, // t p
		true, /// grp t p
		1,
		79,
	],

	[
		// --------  35 ========= ??????
		39, // bld
		arr_colors[39][2], //sd
		39, //cr1
		39, //cr2
		arr_colors[39][2], //sd
		"#110000", // grd //  '#162232' //arr_colors[39][1]
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[39]).slice(),
			shuffleArray(arr_colors[39]).slice(),
			shuffleArray(arr_colors[39]).slice(),
		], // tres
		4, // trials c
		true, /// grp t c
		4, // t p
		true, /// grp t p
		1,
		79,
	],

	[
		// --------  36 =========
		32, // bld
		0x110000, //sd
		32, //cr1
		32, //cr2
		0x110000, //sd
		0x110011, // grd //  '#162232' //arr_colors[32][0]
		[
			arr_colors[32],
			// shuffleArray(arr_colors[32]).slice(),
			// shuffleArray(arr_colors[32]).slice(),
			// shuffleArray(arr_colors[32]).slice()
		], // tres
		36, // trials c
		true, /// grp t c
		32, // t p
		true, /// grp t p
		1,
		129,
	],

	[
		// --------  37 =========
		18, // bld
		arr_colors[18][2], //sd
		18, //cr1
		18, //cr2
		arr_colors[18][2], //sd
		0x110000, // grd //  '#162232' //arr_colors[18][0]
		[
			// arr_colors[c3]
			shuffleArray(arr_colors[18]).slice(),
			shuffleArray(arr_colors[18]).slice(),
			shuffleArray(arr_colors[18]).slice(),
		], // tres
		18, // trials c
		true, /// grp t c
		18, // t p
		true, /// grp t p
		1,
		18,
	],

	[
		// --------  38 =========
		128, // bld
		arr_colors[18][3], //sd
		128, //cr1
		128, //cr2
		arr_colors[128][3], //sd
		0x110000, // grd //  '#162232'
		[
			// arr_colors[c3]
			// arr_colors[128].slice(0,2),
			// arr_colors[128].slice(1,3),
			// arr_colors[128].slice(2,4),
			arr_colors[128],
		], // tres
		4, // trials c
		true, /// grp t c
		4, // t p
		true, /// grp t p
		1,
		129,
	],

	[
		// --------  39 ========= //  gray
		131, // bld
		arr_colors[131][3], //sd
		79, //cr1
		79, //cr2
		arr_colors[131][3], //sd
		arr_colors[131][0], // grd //  '#162232'
		[
			// arr_colors[c3]
			// arr_colors[128].slice(0,2),
			// arr_colors[128].slice(1,3),
			// arr_colors[128].slice(2,4),
			arr_colors[131],
		], // tres
		7, // trials c
		true, /// grp t c
		131, // t p
		true, /// grp t p
		3,
		131,
	],

	[
		// --------  40 ========= //  blue
		132, // bld
		arr_colors[132][3], //sd
		79, //cr1
		79, //cr2
		arr_colors[132][3], //sd
		0x001111, // grd //  '#162232'
		[
			// arr_colors[c3]
			// arr_colors[128].slice(0,2),
			// arr_colors[128].slice(1,3),
			// arr_colors[128].slice(2,4),
			arr_colors[132],
		], // tres
		132, // trials c
		true, /// grp t c
		132, // t p
		true, /// grp t p
		1,
		132,
	],

	[
		// --------  41 ========= //  ?
		7, // bld
		arr_colors[131][3], //sd
		1, //cr1
		1, //cr2
		arr_colors[131][3], //sd
		0x111111, // grd //  '#162232'
		[
			// arr_colors[c3]
			// arr_colors[128].slice(0,2),
			// arr_colors[128].slice(1,3),
			// arr_colors[128].slice(2,4),
			arr_colors[79],
		], // tres
		4, // trials c
		true, /// grp t c
		4, // t p
		true, /// grp t p
		3,
		9,
	],

	[
		// --------  42 ========= //   same mili
		133, // bld
		arr_colors[133][3], //sd
		133, //cr1
		133, //cr2
		arr_colors[133][3], //sd
		0x111111, // grd //  '#162232'
		[
			// arr_colors[c3]
			// arr_colors[128].slice(0,2),
			// arr_colors[128].slice(1,3),
			// arr_colors[128].slice(2,4),
			arr_colors[133],
		], // tres
		133, // trials c
		true, /// grp t c
		133, // t p
		true, /// grp t p
		1,
		133,
	],

	//^^^
	[
		// --------  43 ========= //   same mili xxxx
		134, // bld
		arr_colors[134][3], //sd
		134, //cr1
		134, //cr2
		arr_colors[134][3], //sd
		arr_colors[134][3], // grd //  '#162232'
		[
			// arr_colors[c3]
			// arr_colors[128].slice(0,2),
			// arr_colors[128].slice(1,3),
			// arr_colors[128].slice(2,4),
			arr_colors[134],
		], // tres
		134, // trials c
		true, /// grp t c
		134, // t p
		true, /// grp t p
		1,
		134,
	],

	//^^^

	[
		// --------  44 ========= //   same mili xxxx
		135, // bld
		arr_colors[135][3], //sd
		135, //cr1
		135, //cr2
		arr_colors[135][3], //sd
		arr_colors[135][6], // grd //  '#162232'
		[
			// arr_colors[c3]
			// arr_colors[128].slice(0,2),
			// arr_colors[128].slice(1,3),
			// arr_colors[128].slice(2,4),
			arr_colors[135],
		], // tres
		135, // trials c
		true, /// grp t c
		135, // t p
		true, /// grp t p
		1,
		135,
	],

	[
		// --------  45 ========= //   same mili xxxx
		136, // bld
		arr_colors[136][3], //sd
		136, //cr1
		136, //cr2
		arr_colors[136][3], //sd
		0x111111, // grd //  '#162232'
		[
			// arr_colors[c3]
			// arr_colors[128].slice(0,2),
			// arr_colors[128].slice(1,3),
			// arr_colors[128].slice(2,4),
			arr_colors[136],
		], // tres
		136, // trials c
		true, /// grp t c
		136, // t p
		true, /// grp t p
		1,
		136,
	],

	[
		// --------  46 ========= //   same mili xxxx
		138, // bld
		arr_colors[138][3], //sd
		138, //cr1
		138, //cr2
		arr_colors[138][3], //sd
		0x111111, // grd //  '#162232'
		[
			// arr_colors[c3]
			// arr_colors[128].slice(0,2),
			// arr_colors[128].slice(1,3),
			// arr_colors[128].slice(2,4),
			arr_colors[138],
		], // tres
		138, // trials c
		true, /// grp t c
		138, // t p
		true, /// grp t p
		1,
		138,
	],

	[
		// --------  47 ========= //   s???
		139, // bld
		arr_colors[139][3], //sd
		139, //cr1
		139, //cr2
		arr_colors[139][3], //sd
		0x111111, // grd //  '#162232'
		[
			// arr_colors[c3]
			// arr_colors[128].slice(0,2),
			// arr_colors[128].slice(1,3),
			// arr_colors[128].slice(2,4),
			arr_colors[139],
		], // tres
		4, // trials c
		true, /// grp t c
		4, // t p
		true, /// grp t p
		1,
		139,
	],

	[
		// --------  48 ========= //   s???
		140, // bld
		arr_colors[140][3], //sd
		140, //cr1
		140, //cr2
		arr_colors[140][3], //sd
		0x110000, // grd //  '#162232'
		[
			// arr_colors[c3]
			// arr_colors[128].slice(0,2),
			// arr_colors[128].slice(1,3),
			// arr_colors[128].slice(2,4),
			arr_colors[140],
		], // tres
		7, // trials c
		true, /// grp t c
		7, // t p
		true, /// grp t p
		1,
		140,
	],

	[
		// --------  49 ========= //   s???
		131, // bld
		arr_colors[131][3], //sd
		79, //cr1
		79, //cr2
		arr_colors[131][3], //sd
		0x110000, // grd //  '#162232'
		[
			// arr_colors[c3]
			// arr_colors[128].slice(0,2),
			// arr_colors[128].slice(1,3),
			// arr_colors[128].slice(2,4),
			arr_colors[79],
			arr_colors[36],
		], // tres
		131, // trials c
		true, /// grp t c
		131, // t p
		true, /// grp t p
		1,
		79,
	],

	// [ // --------  50 ========= //
	// 142, // bld
	// arr_colors[141][3], //sd
	// 141, //cr1
	// 141, //cr2
	// arr_colors[141][2],//sdR
	// 0x111111, // grd //  '#162232'
	// [
	// // arr_colors[c3]
	// // arr_colors[128].slice(0,2),
	// // arr_colors[128].slice(1,3),
	// // arr_colors[128].slice(2,4),
	// arr_colors[142],

	// ], // tres
	// 79, // trials c
	// true, /// grp t c
	// 79, // t p
	// true ,/// grp t p
	// 1,
	// 79
	// ],
];

// B+P 141
// T
//R

function init_colors2(num = 9) {
	let arr = arr_comb[num];

	c_building = arr[0];

	// console.log("arr=",arr)
	// throw "Sss"
	c_sd1 = arr[1];
	f_sd1 = true; // fp

	//     //c =  rc() //THREE.MathUtils.randInt(0,28) //33
	c_cars1 = arr[2]; //rc()// THREE.MathUtils.randInt(0,28) // 21;
	f_cars1 = true; // fp

	c_cars2 = arr[3]; //rc()// THREE.MathUtils.randInt(0,28) // 21;
	f_cars2 = true; // fp

	// //264653-2a9d8f-e9c46a-f4a261-e76f51',
	c_sd2 = arr[4]; //21
	f_sd2 = true; // fp
	//     //c = THREE.MathUtils.randInt(0,40)

	c_ground = arr[5]; //get_color_b(c) // get_color_b(c) //get_color_b(c) //0x333333 //0x221111
	// console.log("c_ground=",c_ground)
	// c_ground = get_color_b(c)

	// //c = rc()//THREE.MathUtils.randInt(0,28) // 4 // get_color_b 4 == gold
	c_trees = arr[6];
	f_trees = true; // fp **
	// //c =  THREE.MathUtils.randInt(0,40)
	c_trails_cars = arr[7]; //c2 // f
	g_trails_cars = arr[8];

	// console.log("c=",c_trails_cars)
	// console.log("c=",g_trails_cars)

	// f_trails_cars = true // fp **

	// //c = THREE.MathUtils.randInt(0,40)
	c_trails_p = arr[9];
	// f_trails_p = true // fp **
	g_trails_p = arr[10];

	// console.log("arr=",arr)
	dis_kind = arr[11];

	// g_cars1 = arr[12]
	// g_cars2 = arr[13]

	lake_col = arr[12];

	/// memories colors
	mc_arr = arr[6];

	// console.log("mc_arr=",mc_arr)

	edge_lines = mc_arr[0][Math.floor((mc_arr[0].length - 0.1) * Math.random())];

	// console.log("aaaaaaaaaaaaaaaaaaa=",mc_arr[0])
}

export { mc_arr, flag_memories, init_colors2 };

let window_cols = ["#463c39", "#b6b2b1", "#7e7977", "#949490", "#21201f"];

export {
	c_building, // F
	c_base, // F/P
	c_sd1, // F/P
	c_cars1, // F/P
	c_cars2,
	c_sd2, // F
	c_ground, // F
	c_trees, // F/P
	c_trails_cars, // F
	c_trails_p, // FP
	f_sd1, // fp
	f_cars1, // fp
	f_sd2, // fp
	f_trees, // fp **
	f_trails_cars, // fp **
	f_trails_p, // fp **
	arr_colors,
	g_trails_cars,
	g_trails_p,
	dis_kind,
	g_cars1,
	g_cars2,
	lake_col,
	window_cols,
};

///////
