import * as THREE from "three";

// import * as THREE from "https://cdn.skypack.dev/three@0.148.0";
// import {OrbitControls} from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls";

import {
	get_ground,
	init_colors2,
	get_edge_lines,
	c_building,
} from "./color_art.js";
const toIndex = (x, y, xMax = 100) => Precision(x + y * xMax);

import {
	main_matetrial,
	ventHoleGeometry,
	arr3d_to_2d,
	dist_lines,
	draw_line,
	scl_cars,
	flag_create,
	flag_building,
	get_color_b,
	random_pick,
	extend_line,
	split_vertecs,
	OffsetContour,
	poly_to_lines,
	gl_w,
	gl_h,
} from "./a_tools.js";

import { OrbitControls } from "../jsm/controls/OrbitControls.js";
import {
	Precision,
	camera_pos,
	mesh_containers,
	d3_shape,
	s_v,
	e_v,
	s_h,
	e_h,
	h_n,
	v_n,
	sh,
	eh,
	sv,
	ev,
	add_container,
	outer_90,
	flag_mouse,
} from "./a_tools.js";

import { update_s } from "./a_roads.js";
import { Building, custom } from "./a_buildings.js";

import {
	G,
	place_objs_inarea,
	init_graph,
	class_car,
	is_point_in_poly,
} from "./graph.js";

import { init_objs } from "./a_objs.js";

let edge_mon = null;
let in_mon = null;

let line3 = new THREE.Line3();
let vec1 = new THREE.Vector3();
let vec2 = new THREE.Vector3();
let flag_ra_edges = null;
let flag_ra_inside = null;
let flag_switch = null; // if true, can switch to any kind ra vir str

let speed_flag = true;

let stop_time = 0;
let s_time = 0;
let time_passed = 0;

let duration = 60000 * 2; // 1 min

let time = Date.now(); //THREE.MathUtils.randFloat(0,duration)
let spotLight2;
let arr_scales = {
	car: 0.2,
};

// index of colors in arr of each instance type // fill latter
let arr_color_indexes = {
	plane: 10,
	box: 11,
	car: 8, // wheel,top,body
	bus: 8,
	micro: 8,
	// 'capsule_line': 9,

	leaf: 10,
	tree: 10,

	cone: 10, // leaf change
	cone_r: 10, // leaf change
	col: 10,
	sphere: 9,
	win: 10,
	win_box: 11,
	dbl_pln: 10,
	cone_scat: 10,
};

let al_car = 0.2;

/// REUSE
let vec_mid = new THREE.Vector3();

let world_pos = new THREE.Vector3();
let world_quat = new THREE.Quaternion();

let tempg = new THREE.BoxGeometry(1, 1, 1); // TEMP FOR ALL BOX
let main_mat = new THREE.MeshBasicMaterial({
	color: 0xffffff,
	side: THREE.DoubleSide,
});
let main_box = new THREE.Mesh(tempg, main_mat);

let cg = new THREE.CylinderGeometry(1, 1, 1, 5);
let main_cylinder = new THREE.Mesh(cg, main_mat);

export { main_cylinder };

let renderer, camera, controls, dirLight;
let scene_instances;

init();
animate();

async function init() {
	// 1 try ground
	// add 2 ops
	let arr_ops = [
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23,
		24, 26, 27, 29, 31, 32, 33, 34, 35, 36, 37, 38, 42, 45, 47,
	];

	let num_cols = random_pick(arr_ops); //THREE.MathUtils.randInt(2,6)

	init_colors2(num_cols);

	let c_ground = get_ground();

	scene_instances = new THREE.Scene();
	scene_instances.background = new THREE.Color(c_ground);
	scene_instances.fog = new THREE.Fog(c_ground, 0, 3000);

	init_objs(scene_instances);

	update_s(scene_instances);
	init_graph(scene_instances, 0.2);

	// console.log("window.innerWidth, window.innerHeight =",window.innerWidth, window.innerHeight )

	// camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 2, 110000 ); // 55
	camera = new THREE.PerspectiveCamera(55, gl_w / gl_h, 4, 110000); // 55 //2

	camera.position.set(camera_pos.x, camera_pos.y, camera_pos.z); //300

	renderer = new THREE.WebGLRenderer({ antialias: true });

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	renderer.setSize(gl_w, gl_h);
	// renderer.setSize( window.innerWidth*0.9, window.innerHeight*0.9 );
	document.body.appendChild(renderer.domElement);

	renderer.setPixelRatio(window.devicePixelRatio); /// added **

	controls = new OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Math.PI / 2;

	if (flag_mouse) {
		controls.minDistance = 100;
		controls.maxDistance = 540;
		controls.enablePan = false;

		controls.maxPolarAngle = Math.PI * 0.48; //0.46
	}
	controls.target = new THREE.Vector3(0, 0, 0);
	controls.update();

	// Lights

	let ambt = new THREE.AmbientLight(0xffffff, 0.5);
	// console.log("ambt=",ambt)
	scene_instances.add(ambt); //0.5

	let d = 300; //222

	dirLight = new THREE.DirectionalLight(0xffffff, 1.5); //1.5
	dirLight.name = "Dir. Light";
	dirLight.position.set(0, 244, 544);
	dirLight.castShadow = true;
	dirLight.shadow.camera.near = 0.5;
	dirLight.shadow.camera.far = 2111; //2111
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;
	dirLight.shadow.mapSize.width = 10000; //6888
	dirLight.shadow.mapSize.height = 10000;
	dirLight.shadow.normalBias = 0.01; //2 0.5
	// dirLight.shadow.bias =  -0.005
	scene_instances.add(dirLight);

	let col = 0x333333;
	const p_mat = new main_matetrial({});
	const p_mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), p_mat);
	p_mesh.receiveShadow = true;
	p_mesh.rotateX(-Math.PI / 2);

	v_n, h_n;

	let ya = 0.09; //-0.01
	// add_container(p_mesh,'plane','plane',h_n*2,v_n*2,0,world_pos,world_quat,col,1,ya
	add_container(
		p_mesh,
		"plane",
		"plane",
		h_n * 2.2,
		v_n * 2.66,
		0,
		world_pos,
		world_quat,
		col,
		1,
		ya
	);

	ya = -1.2;
	// add_container(p_mesh,'plane','plane',7000,7000,0,world_pos,world_quat,c_ground,1,ya)

	//0 normal, 1 park ,
	let kind = 1;
	let w = Math.abs(s_v - e_v) / 2;
	let p = 4; // prioraty

	let vec1 = new THREE.Vector3(s_h, 0, 0);
	let vec2 = new THREE.Vector3(e_h, 0, 0);

	let type_map = 0;
	let [arr_grp, arr_roads] = get_grid_map(type_map);

	/////// LOOP GRAPHS
	for (let grp = 0; grp < arr_grp.length; grp++) {
		let arr_grid = arr_grp[grp];
		let arr_lanes = arr_roads[grp];

		let gr2 = new G(arr_grid, al_car, arr_lanes); // 0.2

		var start = performance.now();
		let polys = gr2.get_lines(false, false, 0x0000ff, 2); // returns same both direction convex
		let park_map = gr2.park_map;
		let props_map = gr2.park_map.props_map;

		//^^
		let id_park = 0; // * need global
		let park_info = [vec1, vec2, kind, w, p, id_park, vec1.distanceTo(vec2)];
		props_map.push(park_info);
		park_map.ids.add(id_park);
		park_map.id_parks_edges.set(id_park, new Set());

		id_park++;

		gr2.get_verteces();

		let num_lanes = 4;

		// ^^flag
		let flag = flag_building;

		// poly + edges graphs

		create_graphs(gr2, polys);

		let outlay_sides = [
			function z1(pol_info) {
				return pol_info.avg.x > s_h && pol_info.avg.x < e_h;
			}, // 3,7 == h, else l
		];

		function get_mid(val) {
			let y = THREE.MathUtils.mapLinear(Math.abs(val), 0, h_n + 2, 120, 25);
			return y;
		}

		let div_h1 = THREE.MathUtils.randInt(5, 15);
		let div_v1 = THREE.MathUtils.randInt(5, 15);

		let div_h2 = THREE.MathUtils.randInt(3, 7);
		let div_v2 = THREE.MathUtils.randInt(3, 7);

		let twist_alpha = Math.random();
		let mid_h = Math.random() < 0.1 ? 1 : 0;
		let high_builinds = Math.random() < 0.5 ? 1 : 0;

		console.log("twist_alpha=", twist_alpha);
		gr2.poly_graph.forEach((pol_info) => {
			if (flag == 1) {
				if (pol_info.kind != 1) {
					// pol_info.alpha_off = -0.5

					let height;
					let dh, dv;

					if (outlay_sides[0](pol_info)) {
						height = high_builinds ? [44, 158] : [44, 128];

						dh = div_h1;
						dv = div_v1;

						if (high_builinds) {
							if (Math.random() < 0.1) {
								height = [132, 222];
							}
						}
					} else {
						// height = THREE.MathUtils.randFloat(12,44)
						// height = [132,222]
						height = [5, 35]; //[5,25] //THREE.MathUtils.randFloat(3,6) //3,4
						dh = div_h2;
						dv = div_v2;
					}

					if (mid_h) {
						// mid h, edges l
						let v = get_mid(pol_info.avg.x + 0, 0);
						height = [v * 0.5, v * 2];
					}

					//graph,polys2,line_props
					let res = get_line_buidling(
						pol_info,
						scene_instances,
						height,
						dh,
						dv,
						twist_alpha
					);

					let temp_mat = c_building; // get r1
					split_graphs(res[0], res[1], res[2], height, temp_mat);
				}
			}
		});

		gr2.connect_roads(); //  -- ROADS

		gr2.get_parks();

		gr2.co_info.forEach((co) => {
			if (flag_create && !is_point_in_poly(gr2.park_poly, co.middle)) {
				co.co_connect(
					gr2,
					flag_ra_edges,
					flag_ra_inside,
					flag_switch,
					edge_mon,
					in_mon
				);
			}
		});

		gr2.get_sidewalk2();
	} /// if == graphs

	window.addEventListener("resize", function () {
		camera.aspect = gl_w / gl_h;
		camera.updateProjectionMatrix();

		renderer.setSize(gl_w, gl_h);
	});

	let arr_names = [
		"plane",
		"box",
		"cylinder",
		"cone",
		"cone_r",
		"vent_hole",
		"wheel",
		"top0",
		"body0",
		"top1",
		"body1",
		"top2",
		"body2",
		"top3",
		"body3",
		"top4",
		"body4",
		"top5",
		"body5",

		"sphere",
		"win",
		"win_box",
		"dbl_pln",
		"cone_scat",
		"top6",
		"body6",
	];

	// // pos,q
	// let arr_start= [
	// 	3,4,2,3,3,3,1,'wheel','top0','body0','top1','body1'
	// ]

	let type_name;

	let t1 = new THREE.Vector3();
	let t3 = new THREE.Quaternion();
	// let position = new THREE.Vector3() // use same vector
	let mesh;
	const randomizeMatrix = (function randomizeMatrix() {
		const scale_init = new THREE.Vector3(1, 1, 1);
		let scale = new THREE.Vector3(1, 1, 1);
		return function (matrix, i) {
			scale.copy(scale_init);

			mesh = mesh_containers[type_name][0][i];

			// console.log("!!!!!!!!===",mesh_containers[type_name][0])
			// throw "S"

			mesh.forEach((item) => {
				// console.log("item",item)
				if (item === undefined) {
					console.log("res undefined ==== ", mesh);
				}
			});

			/// ***  replace with add attributes for all objs
			let kind = mesh[0]; //

			if (
				type_name === "cone" ||
				type_name === "cone_r" ||
				type_name === "cone_scat"
			) {
				t1.set(mesh[3], mesh[4], mesh[5]);
				t3.set(mesh[6], mesh[7], mesh[8], mesh[9]);
				scale.set(mesh[1], mesh[2], mesh[1]);
			}

			if (
				type_name === "plane" ||
				type_name === "win" ||
				type_name === "dbl_pln"
			) {
				//quad w,x,y,z
				t1.set(mesh[3], mesh[4], mesh[5]);
				t3.set(mesh[6], mesh[7], mesh[8], mesh[9]);

				let s = mesh[11];
				scale.x = mesh[1] * s;
				scale.y = mesh[2] * s;
				scale.z = 1;
			}

			// -- plane info
			//d,h,pos,quad,color
			if (type_name === "box" || type_name === "win_box") {
				t1.set(mesh[4], mesh[5], mesh[6]);
				t3.set(mesh[7], mesh[8], mesh[9], mesh[10]);

				scale.x = mesh[1];
				scale.y = mesh[2];
				scale.z = mesh[3];
			}

			// if(type_name === 'capsule_line'){

			// 	t1.set(mesh[2],mesh[3],mesh[4])
			// 	t3.set(mesh[5],mesh[6],mesh[7],mesh[8])

			// 	scale.x = 1
			// 	scale.y = mesh[1];
			// 	scale.z = 1;

			// }

			if (type_name === "cylinder") {
				if (kind === "tree" || kind === "col") {
					t1.set(mesh[3], mesh[4], mesh[5]);
					t3.set(mesh[6], mesh[7], mesh[8], mesh[9]);
					scale.set(mesh[1], mesh[2], mesh[1]);
				}
			}

			if (kind === "car" || kind == "bus" || kind == "micro") {
				// console.log("mesh=",mesh)
				let scl = arr_scales["car"];

				// scl_cars = type_name=== ''? 3 : scl_cars;
				scl *= scl_cars;

				if (type_name === "wheel") {
					if (kind === "car") {
						scl *= 0.1;
					}
					if (kind === "bus") {
						scl *= 0.2;
					}
					if (kind === "micro") {
						scl *= 0.1;
					}
					/// ?*
				}
				scale.x = scl;
				scale.y = scl;
				scale.z = scl;

				t1.set(mesh[1], mesh[2], mesh[3]);
				t3.set(mesh[4], mesh[5], mesh[6], mesh[7]);
			}

			if (type_name === "sphere") {
				t1.set(mesh[2], mesh[3], mesh[4]);
				t3.set(mesh[5], mesh[6], mesh[7], mesh[8]);
				scale.set(mesh[1], mesh[1], mesh[1]);
			}

			if (type_name === "vent_hole") {
				t1.set(mesh[1], mesh[2], mesh[3]);
				t3.set(mesh[4], mesh[5], mesh[6], mesh[7]);
				scale.multiplyScalar(mesh[9]);
			}

			matrix.compose(t1, t3, scale);
		};
	})();

	const matrix = new THREE.Matrix4();
	const color = new THREE.Color();

	let rgh = 1;
	let met = 0;
	let flat = false;

	let arr_goes = [
		new THREE.PlaneGeometry(1, 1),
		new THREE.BoxGeometry(1, 1, 1),

		new THREE.CylinderGeometry(1, 1, 1, 10),
		new THREE.ConeGeometry(1, 1, 3, 1),
		new THREE.ConeGeometry(1, 1, 10, 1),
		ventHoleGeometry(),
		new THREE.CylinderGeometry(1, 1, 0.5, 15),
		class_car.get_top2(d3_shape(2, 2, 2)[0], 0)[0].geometry, // 0
		class_car.get_vehicle(0).children[4].geometry,

		class_car.get_top2(d3_shape(2, 2, 2)[0], 1)[0].geometry, // * 1
		class_car.get_vehicle(1).children[4].geometry, //*

		class_car.get_top2(d3_shape(2, 2, 2)[0], 2)[0].geometry, // * 2
		class_car.get_vehicle(2).children[4].geometry, //*

		class_car.get_top2(d3_shape(2, 2, 2)[0], 3)[0].geometry, // * 3
		class_car.get_vehicle(3).children[4].geometry, //*

		class_car.get_top2(d3_shape(2, 2, 2)[0], 4)[0].geometry, // * 4
		class_car.get_vehicle(4).children[4].geometry, //*

		class_car.get_top2(d3_shape(2, 2, 2)[0], 5)[0].geometry, // * 5
		class_car.get_vehicle(5).children[4].geometry, //*

		new THREE.SphereGeometry(1, 15, 10),
		new THREE.PlaneGeometry(1, 1),
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.PlaneGeometry(1, 1), // double side
		new THREE.ConeGeometry(1, 1, 3, 1), //'cone_scat'

		class_car.get_top2(d3_shape(2, 2, 2)[0], 6)[0].geometry, // * 5
		class_car.get_vehicle(6).children[4].geometry, //*
	];

	for (let i = 0; i < arr_goes.length; i++) {
		//{wireframe:true} more intense *
		let t =
			// i==2 ? new THREE.MeshBasicMaterial({wireframe:true}) :
			i == 6 || i == 22
				? new main_matetrial({ side: THREE.DoubleSide }) //* doubnle {side:THREE.DoubleSide}
				: new main_matetrial(); // *

		let g = arr_goes[i];

		// console.log("arr_names[i]=",arr_names[i])
		// console.log("g=",g)

		mesh_containers[arr_names[i]][1] = new THREE.InstancedMesh(
			g,
			t,
			mesh_containers[arr_names[i]][0].length
		); //{side:THREE.DoubleSide}
	}

	let color_temp = new THREE.Color();

	for (const name in mesh_containers) {
		// get right index for colors

		//  console.log("anme == ",name)
		if (mesh_containers[name][0].length === 0) {
			continue;
		}
		let index_col = arr_color_indexes[mesh_containers[name][0][0][0]];

		type_name = name;

		for (let i = 0; i < mesh_containers[name][1].count; i++) {
			randomizeMatrix(matrix, i); // scale

			color_temp.set(mesh_containers[name][0][i][index_col]);

			// if(type_name==='capsule_line'){

			// 	color_temp.setHex( mesh_containers[name][0][i][index_col])

			// }

			mesh_containers[name][1].setMatrixAt(i, matrix);
			mesh_containers[name][1].setColorAt(i, color_temp);
		}

		// /// disable for lines
		// if(name !== 'capsule_line'){
		mesh_containers[name][1].castShadow = true;
		mesh_containers[name][1].receiveShadow = true;
		// }

		if (
			["win", "win_box", "cone_scat"].includes(mesh_containers[name][0][0][0])
		) {
			// if(mesh_containers[name][0][0][0] === 'win_box')throw "s";
			mesh_containers[name][1].castShadow = false;
		}

		scene_instances.add(mesh_containers[name][1]);
	}

	/// --key board
	document.addEventListener("keydown", onDocumentKeyDown, false);
	function onDocumentKeyDown(event) {
		var keyCode = event.which;
		if (keyCode == 83) {
			// s // ---stop/run sun movement
			speed_flag = !speed_flag;
		}

		if (keyCode == 82) {
			// r // --randomize sun position

			time_passed += THREE.MathUtils.randFloat(0, duration); // add 0-2 mins of secs,
			stop_time = Date.now() - time_passed; // update
		}

		if (!speed_flag) {
			// if stoped save starting time
			s_time = Date.now(); // s
			stop_time = Date.now() - time_passed;
		} else {
			// if rerun , cal the time has been passed time since stoped
			time_passed += Date.now() - s_time;
		}
	}

	console.log("scene_instances= ", mesh_containers);
}

function get_sphere(x, y, z, col = 0xffffff, rad = 0.3, flag_return = false) {
	let shpere_g = new THREE.SphereGeometry(rad, 11, 11); //(0.3,33,33)
	let shpere_m = new THREE.MeshBasicMaterial({ color: col, wireframe: false });
	let sphere = new THREE.Mesh(shpere_g, shpere_m);
	sphere.position.set(x, y, z);

	if (flag_return) {
		return sphere;
	}

	scene_instances.add(sphere); // helper, no need instance
}

function animate() {
	requestAnimationFrame(animate);

	camera.updateMatrixWorld();

	controls.update();

	// save_secs = !speed_flag ?
	let res = orbitCalculation2(time, 111, duration);

	dirLight.position.x = res.x;
	dirLight.position.z = res.z;

	renderer.render(scene_instances, camera);

	// time%=duration

	//time+=speed_flag ? speed : speed2;

	// speed_flg move
	time = speed_flag ? Date.now() - time_passed : stop_time;
}

function orbitCalculation2(time, radius, duration = 60000) {
	return {
		x: Math.sin(((time % duration) / duration) * Math.PI * 2) * radius,
		z: Math.cos(((time % duration) / duration) * Math.PI * 2) * radius,
	};
}

function create_graphs(gr2, polys) {
	let poly_graph = new Map();
	let edge_graph = new Map(); // vetexes = middle vector of 2 c.o indexTo
	let props_map = gr2.park_map.props_map;

	let flag_split = true;

	let m = 0;
	let m_s = 0;
	for (let p = 0; p < polys.length; p++) {
		if (polys[p].length > m_s) {
			m = p;
			m_s = polys[p].length;
		}
	}

	let pp = [];
	for (let p = 0; p < polys.length; p++) {
		if (p == m) continue;

		let poly = polys[p];

		let new_area = [];
		let avg = new THREE.Vector3(0, 0, 0);

		// -- all polys need change.
		poly.reverse();

		let arr_edge_methods = [];

		for (let i = 0; i < poly.length; i++) {
			//

			let current_v = poly[i];
			avg.add(current_v); // poly hash name

			let i1 = i == 0 ? poly.length - 1 : i - 1;
			let i2 = (i + 1) % poly.length;
			// get the 2 neighbers back and front

			let b = poly[i1]; // vectores
			let f = poly[i2];
			let cross_over = gr2.co_info.get(toIndex(current_v.x, -current_v.z));

			let method = cross_over.method;

			let arr_roads = cross_over["arr_roads"];

			let road_b = null; // [b_e1,b_e2,f_e1,f_e2]
			let road_f = null;

			// [lane first, lane last] (road edges)
			let ind_b;
			let ind_f;

			for (let ind = 0; ind < arr_roads.length; ind++) {
				let road = arr_roads[ind];
				let temp_v = road[0]; // vertex vector
				if (temp_v.x == b.x && temp_v.y == b.y && temp_v.z == b.z) {
					road_b = road;
					ind_b = ind;
				}

				if (temp_v.x == f.x && temp_v.y == f.y && temp_v.z == f.z) {
					road_f = road;
					ind_f = ind;
				}
			}

			//// ----- methods co_methods in graph
			// craete inside the selected one, info free space

			if (
				road_b === undefined ||
				road_b === null ||
				road_f === undefined ||
				road_f === null
			)
				continue; // ***

			if (method == "edge_vcir") {
				// 0 == l, last == r , bcz build relative to c.o
				let b_lanes = road_b[road_b.length - 1];
				let f_lanes = road_f[road_f.length - 1];

				//// l of b,
				let bl = b_lanes[0];
				let br = b_lanes[b_lanes.length - 1];

				//// r of f,
				let fl = f_lanes[0];
				let fr = f_lanes[f_lanes.length - 1];

				new_area.push(bl);
				new_area.push(fr);

				arr_edge_methods.push([method, [bl, fr]]);
			}

			if (method == "edge_roads") {
				let b_lanes = road_b[road_b.length - 1];
				let f_lanes = road_f[road_f.length - 1];

				// // l1,r1,l2,r2
				let lanes = [0, b_lanes.length - 1, 0, f_lanes.length - 1];

				let res = cross_over.straight2(lanes, ind_b, ind_f, true, true); // flag1== coonect roads instead of lanes, return_flag
				let v1 = res[2];
				let v2 = res[3];

				new_area.push(v1);

				arr_edge_methods.push([method, [v1, v1]]);
			}
		} // LOOP

		avg.divideScalar(polys[p].length);

		let poly_name = toIndex(avg.x, -avg.z);

		let edges = [];

		//arr_edge_methods
		for (let k = 0; k < poly.length; k++) {
			let cur = k;
			let prev = k - 1;

			if (k == 0) {
				prev = poly.length - 1;
			}

			let current_v = poly[cur];
			let prev_v = poly[prev];

			////--- update c.o poly adjs (not related to this loop)
			let cross_over = gr2.co_info.get(toIndex(current_v.x, -current_v.z));
			cross_over.adj_polys.add(poly_name);
			////---

			let mid_b = new THREE.Vector3().lerpVectors(current_v, prev_v, 0.5); // mid point == edge
			let edge = toIndex(mid_b.x, -mid_b.z); // hash to get name edge
			edges.push(edge);

			if (!edge_graph.has(edge)) {
				edge_graph.set(edge, {
					space: [[arr_edge_methods[prev][1][1], arr_edge_methods[cur][1][0]]],
					adj_polys: [poly_name],
					crosswalks: [], // arr of cws
					edge_vecs: [current_v, prev_v], // maybe remove altter *
					inside_park: false, // update in connect_roads
				});
			} else {
				// added 2 points already, add the remaining

				edge_graph
					.get(edge)
					.space.push([
						arr_edge_methods[prev][1][1],
						arr_edge_methods[cur][1][0],
					]);
				edge_graph.get(edge).adj_polys.push(poly_name);
			}
		}

		let area_b;
		let y_s = 0;

		let alpha_off = -0.5; // -0.5
		new_area.reverse();

		let kind = 0;
		let priority = null;
		let id_park = null;
		for (let k = 0; k < props_map.length; k++) {
			if (dist_lines(avg, props_map[k][0], props_map[k][1], props_map[k][3])) {
				if (priority === null) {
					priority = k;
					kind = props_map[k][2];
					id_park = props_map[k][5];
				} else {
					// if found larger priority, update max
					if (props_map[k][4] > props_map[priority][4]) {
						priority = k;
						kind = props_map[k][2];
						id_park = props_map[k][5];
					}
				}
			}
		}

		poly_graph.set(poly_name, {
			edges: edges, // poly edges
			poly: poly,
			alpha_off: alpha_off,
			new_area: new_area,
			// area_b:area_b,
			avg: avg,
			free_space: true, // kind=0 ? true : false, //
			kind: kind,
			id_park: id_park,
		});
	}

	// update graph
	gr2.poly_graph = poly_graph;
	gr2.edge_graph = edge_graph;
}

// assighn heights to polys
function split_graphs(gr2, polys, line_props, h_temp, mat_temp) {
	let color_main;
	let poly_graph = new Map();
	let edge_graph = new Map(); // vetexes = middle vector of 2 c.o indexTo

	// can be used for graph edge locate
	let line_polys = new Map(); // line --> polys of it

	let flag_line = true; // usless

	/// largest area == convex

	let convex_index = 0;
	let temp_area = 0;
	for (let p = 0; p < polys.length; p++) {
		let temp_arr = arr3d_to_2d(polys[p]);
		let a = Math.abs(THREE.ShapeUtils.area(temp_arr));

		if (a > temp_area) {
			convex_index = p;
			temp_area = a;
		}
	}

	let h2 = THREE.MathUtils.randFloat(0.1, 0.5);

	// poly loop
	let priority = null; // pick more than 1 candidates
	for (let p = 0; p < polys.length; p++) {
		if (p == convex_index) continue; // ignore convex

		let poly = polys[p];

		let arr_2d = [];

		poly.forEach((v) => {
			arr_2d.push(new THREE.Vector2(v.x, -v.z));
		});

		let new_area = [];
		let avg = new THREE.Vector3(0, 0, 0);

		let height = THREE.MathUtils.randFloat(h_temp[0], h_temp[1]); // ^^hh
		color_main = get_color_b(mat_temp);

		// -- all polys need change.
		poly.reverse();

		// first loop get name poly
		for (let i = 0; i < poly.length; i++) {
			avg.add(poly[i]);

			let current_v = poly[i];
			let prev = i - 1;
			if (i == 0) {
				prev = poly.length - 1;
			}
			let prev_v = poly[prev];
		}

		avg.divideScalar(polys[p].length);
		let poly_name = toIndex(avg.x, -avg.z);

		let mat = color_main;

		let type_wall = 4;

		let start_lvl = 1;
		let flr = 3;
		// set heights by lines

		if (flag_line && line_props != null) {
			for (let k = 0; k < line_props.length; k++) {
				// console.log(line_props)
				if (
					dist_lines(avg, line_props[k][0], line_props[k][1], line_props[k][2])
				) {
					if (priority === null) {
						priority = k;
					} else {
						// if found larger priority, update max
						if (line_props[k][7] > line_props[priority][7]) {
							priority = k;
						}
					}
				}
			}

			if (priority !== null) {
				height = THREE.MathUtils.randFloat(
					line_props[priority][4],
					line_props[priority][5]
				);
				mat = line_props[priority][3];
				type_wall = line_props[priority][6];
				start_lvl = line_props[priority][8];
				flr = line_props[priority][9];
			}
		}

		// 3d to 2d

		let res2d = arr3d_to_2d(poly);
		let size_area = THREE.ShapeUtils.area(res2d);

		let edges = [];
		for (let i = 0; i < poly.length; i++) {
			let current_v = poly[i];
			let prev = i - 1;

			if (i == 0) {
				prev = poly.length - 1;
			}

			let prev_v = poly[prev];

			let mid_b = new THREE.Vector3().lerpVectors(current_v, prev_v, 0.5); // mid point == edge

			let edge = toIndex(mid_b.x, -mid_b.z); // hash to get name edge
			edges.push(edge);

			if (!edge_graph.has(edge)) {
				edge_graph.set(edge, {
					h: height,
					y_s: 0,
					adj_polys: [poly_name], // maybe use latter
					verteces: [current_v, prev_v], // * optimize
					cnt: 0,
					mat: mat, /// change to color **
					type_wall: type_wall,
					edge_poly: height != 0 ? true : false,
					start_lvl: start_lvl,
					flr: flr,
					h_wallr: h2, //THREE.MathUtils.randFloat(0.1,0.5)
				});
			} else {
				// update y_s (first),height

				let e = edge_graph.get(edge);
				e.verteces =
					edge_graph.get(edge).h < height
						? [current_v, prev_v]
						: [prev_v, current_v];
				e.y_s = Math.min(edge_graph.get(edge).h, height); // smaller
				e.edge_poly = e.h != height ? true : false; // if older smaller then new --> not edge poly air
				e.start_lvl = edge_graph.get(edge).h < height ? start_lvl : e.start_lvl;
				e.flr = edge_graph.get(edge).h < height ? flr : e.flr;

				e.mat = e.h < height ? mat : e.mat;
				e.type_wall = e.h < height ? type_wall : e.type_wall;

				e.h = Math.abs(edge_graph.get(edge).h - height); // diff
				e.adj_polys.push(poly_name); // maybe use latter
				e.cnt += 1;
				// e.h_wallr= h2
			}
		}

		// **** add all info to new poly vertex
		poly_graph.set(poly_name, {
			avg: avg,
			edges: edges,
			poly: poly,
			h: height,

			mat: mat,
			size_area: size_area,
		});

		// graph lines--- > polys selected (poly_names)
		if (priority !== null) {
			let line_name = toIndex(
				line_props[priority][10].x,
				-line_props[priority][10].z
			); // line_props[k][10] == line name (mid index)

			if (!line_polys.has(line_name)) {
				line_polys.set(line_name, []);
			}

			line_polys.get(line_name).push(poly_name);
		}

		priority = null;
	} // POLYS LOOP

	let b = new Building(2, scene_instances);

	let ch = Math.random();

	let fv = false;
	let fh = false;

	if (ch < 0.2) {
		fv = true;
	} else {
		if (ch < 0.4) {
			fh = true;
		}
	}

	// fv = true

	// -- LOOP all edges + create walls
	// * combine with vector building latter
	edge_graph.forEach((e) => {
		let v1 = e.verteces[0];
		let v2 = e.verteces[1];
		let y_s = e.y_s;
		let h = e.h;
		let mat = e.mat;
		let h_wallr = e.h_wallr;

		if (!(y_s == 0 && h == 0)) {
			b.building_arr_vector2(
				[v1, v2],
				0.01,
				h,
				y_s,
				e.type_wall,
				mat,
				e.start_lvl,
				e.flr,
				fv,
				fh
			);

			/// if edge --> get wall around
			if (e.edge_poly) {
				// 2== 0.1
				single_wall(v1.clone(), v2.clone(), h_wallr, 0.2, y_s + h, "#ffffff"); //0xffffff
			}
		}
	});

	let tempset = new Set();
	let val = 0.05;
	// add custom roof
	poly_graph.forEach((p) => {
		tempset.clear();

		if (p.h != 0) {
			//'#9c635b' ///p.mat

			//p.mat

			custom(p.poly, p.h, scene_instances, p.mat);

			// roof_objs
			if (flag_building && Math.random() < 0.5) {
				// loop all edge poly, if equal, scl
				p.edges.forEach((e) => {
					tempset.add(edge_graph.get(e).h);
				});

				// if not on edge, enlarge option
				let enlarge = tempset.size > 1 ? THREE.MathUtils.randInt(1, 3) : 1;
				place_objs_inarea(p.poly, p.h, enlarge);
			}
		}
	});

	// update graph
	gr2.poly_graph = poly_graph;
	gr2.edge_graph = edge_graph;
}

// * combine with full closed
function single_wall(v1, v2, h, wid, y_s, color) {
	v1.y = y_s + h / 2;
	v2.y = y_s + h / 2;
	// mid of 2 vectors
	vec_mid.lerpVectors(v1, v2, 0.5);

	let d = v1.distanceTo(v2); // dist between

	main_box.position.set(vec_mid.x, vec_mid.y, vec_mid.z);
	main_box.lookAt(v2);
	main_box.rotateY(-Math.PI / 2);

	add_container(
		main_box,
		"box",
		"box",
		d,
		h,
		wid,
		world_pos,
		world_quat,
		color
	);
}

////////// ----   grid map
////////// ----   grid map

function get_grid_map() {
	let e = 0.001;
	let arr_grp = [];
	let arr_roads = [];

	let arr_grid = []; // map
	let arr_lanes = []; // road lane sizes

	/// ra objs
	// 0 trees,1 mons , 2 combined , nothing.
	let ch1 = Math.random();
	let ch2 = Math.random();
	edge_mon = ch1 < 0.3 ? 0 : ch1 < 0.6 ? 1 : ch1 < 0.9 ? 2 : 3;
	in_mon = ch2 < 0.3 ? 0 : ch2 < 0.6 ? 1 : ch2 < 0.9 ? 2 : 3;

	//  console.log("edge_mon==",edge_mon)
	//  console.log("in_mon==",in_mon)

	let smlf = () => {
		return 4;
	};
	let mdmf = (a = 6, b = 12) => {
		let res = THREE.MathUtils.randInt(a, b);
		return res % 2 == 0 ? res : res - 1;
	}; // mdm range 6 -- 12
	let lrgf = () => {
		let res = THREE.MathUtils.randInt(14, 16);
		return res % 2 == 0 ? res : res - 1;
	}; // mdm range 6 -- 12

	//^^ra
	flag_ra_edges = 1; // Math.random()<0.5;

	flag_ra_inside = 1; // Math.random()<0.5;
	flag_switch = Math.random() < 0.2;

	let same_lane = Math.random() < 0.2;

	// console.log("same_lane=",same_lane)
	let ch = Math.random();

	let res = Math.random();
	let res2 = Math.random();
	let ln =
		res < 0.8
			? flag_ra_edges
				? mdmf(8, 14)
				: mdmf()
			: res < 0.5
			? smlf()
			: lrgf();

	let main_same = Math.random() > 0.5;

	let lane_v = main_same
		? ln
		: res < 0.8
		? flag_ra_edges
			? mdmf(8, 14)
			: mdmf()
		: res < 0.5
		? smlf()
		: lrgf();
	let lane_h = main_same
		? ln
		: res2 < 0.8
		? flag_ra_edges
			? mdmf(8, 14)
			: mdmf()
		: res2 < 0.5
		? smlf()
		: lrgf();

	ch = Math.random();
	ln = ch < 0.8 ? mdmf() : lrgf();

	// when all same
	ch = Math.random();
	let lane_same_all = ch < 0.8 ? mdmf() : ch < 0.9 ? 12 : 4;
	// mid
	let mid_lane_v = ln;
	let mid_lane_h = mid_lane_v;

	// rest
	ch = Math.random();
	ln = ch < 0.8 ? mdmf() : smlf();

	// defualt sml mdm lrg
	let large = lrgf();
	let mdm = mdmf();
	let sml = smlf();

	//////// test splits
	let dpx = THREE.MathUtils.randInt(7, 20);
	dpx = dpx % 2 == 0 ? dpx : dpx - 1;

	// dpx = 15

	let sx = (h_n * 2) / dpx;

	// let dpz = 10
	let dpz = THREE.MathUtils.randInt(4, 11);
	dpz = dpz % 2 == 0 ? dpz : dpz - 1;

	// dpz = 10

	let sz = (v_n * 2) / dpz;

	// potantial splits z + x == red
	// actual == green
	for (let i = -h_n; i < h_n; i += sx) {
		let v = new THREE.Vector3(i, 1, -v_n);
		let v2 = new THREE.Vector3(i, 1, v_n);
		// draw_line(scene_instances,v,v2,true,0x00ff00)
	}

	for (let i = -v_n; i < v_n; i += sz) {
		let v = new THREE.Vector3(-h_n, 1, i);
		let v2 = new THREE.Vector3(h_n, 1, i);
		// draw_line(scene_instances,v,v2,true,0x00ff00)
	}

	let arr_hs = [];
	let arr_vs = [];
	let opv;
	let oph;

	////// ------------
	// 1 zig, 2  mid , 3 random ,  4 all
	let map_op = Math.random();

	/// --- zig
	// kind vir/str first
	let flag_zigh = Math.random() > 0.5 ? 1 : 0;
	let flag_zigv = Math.random() > 0.5 ? 1 : 0;

	// switch
	let flag_evenv = 1; //Math.random()>0.5 ? 1:0;
	let flag_evenh = Math.random() < 0.2 ? 0 : 1; // most of time, same opposites

	let flag_mid_method = Math.random() > 0.5 ? "edge_vcir" : "edge_roads"; //mid
	let flag_all = Math.random() < 0.5; // 0 str, 1 cir // all

	let f = 1;

	if (f && map_op < 0.2) {
		console.log("zig");
		opv = oph = 1;
		f = 0;
	}

	/// ---- mid
	if (f && map_op < 0.4) {
		console.log("mid");
		opv = oph = 2;
		f = 0;

		same_lane = Math.random() < 0.1;
	}

	/// ---- random
	if (f && map_op < 0.6) {
		console.log("random");
		opv = oph = 3;
		f = 0;
		flag_switch = 1;
	}

	/// ---- all
	let flag_all_r = Math.random() < 0.5 ? 1 : 0;

	// only when flag_all_r == true
	let all_r =
		Math.random() < 0.8 ? mdmf() : Math.random() < 0.5 ? smlf() : lrgf();

	if (f && map_op < 0.8) {
		console.log("all");
		opv = oph = 4;
		f = 0;

		/// reval same_lane
		same_lane = Math.random() < 0.5;
	}

	/// ---- combined random
	// if above not choose, chose last option
	if (f) {
		console.log("combined");
		opv = THREE.MathUtils.randInt(1, 2, 3, 4);
		oph = THREE.MathUtils.randInt(1, 2, 3, 4);
		f = 0;
	}

	//^^grid

	///// ----  steps jump
	let gam1 = opv == 2 ? sz : sz * 0.7;
	let gam2 = opv == 2 ? sz : sz * 1.2;

	let gam1_z = oph == 2 ? sx : sx * 0.7;
	let gam2_z = oph == 2 ? sx : sx * 1.2;

	// let min_dist = Math.max(Math.max(sz,sx)*0.6,17*2) //  0.51  // adusjt to radiuses *
	// Math.max(sz,sx)*0.6 * (17*1 ) //26*1

	let hu_temp = new THREE.Vector3(0, 0, s_v); // change x
	let hd_temp = new THREE.Vector3(0, 0, e_v);

	let vl_temp = new THREE.Vector3(s_h, 0, 0); // change z
	let vr_temp = new THREE.Vector3(e_h, 0, 0);

	let r = 10;

	let method1, method2;

	let method = "edge_vcir";

	// options : 1 zig, 2  mid , 3 random ,  4 all
	// let opv = 2
	// let oph = 2

	if (opv == 4 || oph == 4) {
		method = flag_all ? "edge_vcir" : "edge_roads";
	}

	let edges_same = Math.random() < 0.8 ? 1 : 0; // same/not edges methods

	console.log("edges_same=", edges_same);

	// -- used only when edges_same
	let r_same = Math.random() < 0.5 ? lane_h : lane_v;
	let m_same = Math.random() < 0.5 ? "edge_vcir" : "edge_roads";

	r = edges_same ? r_same : Math.random() < 0.5 ? lane_h : lane_v;
	method = edges_same
		? m_same
		: Math.random() > 0.5
		? "edge_vcir"
		: "edge_roads";

	// console.log("r===",r)

	// ------ park edges
	vl_temp.z = vr_temp.z = s_v;
	arr_vs.push([vl_temp.clone(), r, method]);

	r = edges_same ? r_same : Math.random() < 0.5 ? lane_h : lane_v;
	method = edges_same
		? m_same
		: Math.random() > 0.5
		? "edge_vcir"
		: "edge_roads";
	// console.log("r===",r)

	arr_vs.push([vr_temp.clone(), r, method]);

	r = edges_same ? r_same : Math.random() < 0.5 ? lane_h : lane_v;
	method = edges_same
		? m_same
		: Math.random() > 0.5
		? "edge_vcir"
		: "edge_roads";
	// console.log("r===",r)

	vl_temp.z = vr_temp.z = e_v;
	arr_vs.push([vl_temp.clone(), r, method]);
	// console.log("r===",r)

	r = edges_same ? r_same : Math.random() < 0.5 ? lane_h : lane_v;
	method = edges_same
		? m_same
		: Math.random() > 0.5
		? "edge_vcir"
		: "edge_roads";

	// console.log("r===",r)
	arr_vs.push([vr_temp.clone(), r, method]);

	let min_dist = 17; //33
	min_dist = Math.max(lane_h, lane_v) * 2.1; // check*
	console.log("min_dist=", min_dist);
	// get_sphere(0,0,0,0xff0000,min_dist/2) // check min size

	////// ---MAP EDGES
	let l3 = [new THREE.Vector3(-h_n, 0, -v_n), new THREE.Vector3(h_n, 0, -v_n)];
	l3 = extend_line(l3[0], l3[1], true, 1, 4);
	arr_grid.push(l3);
	arr_lanes.push(lane_h);

	let l4 = [new THREE.Vector3(-h_n, 0, v_n), new THREE.Vector3(h_n, 0, v_n)];
	l4 = extend_line(l4[0], l4[1], true, 1, 4);
	arr_grid.push(l4);
	arr_lanes.push(lane_h);

	let l1 = [new THREE.Vector3(-h_n, 0, s_v), new THREE.Vector3(h_n, 0, s_v)];
	l1 = extend_line(l1[0], l1[1], true, 1, 4);
	////// ---PARK  EDGES
	arr_grid.push(l1);
	arr_lanes.push(lane_h);

	let l2 = [new THREE.Vector3(-h_n, 0, e_v), new THREE.Vector3(h_n, 0, e_v)];
	l2 = extend_line(l2[0], l2[1], true, 1, 4);

	arr_grid.push(l2);
	arr_lanes.push(lane_h);

	////// --- SPACIAL PARK SPACE EDGES

	let leap = (a, b) => {
		return THREE.MathUtils.randFloat(a, b); // 3,5
	};

	let r1v, r2v;

	let cnt_z = 0;
	let prev = new THREE.Vector3(0, 0, -v_n);

	let loop_dir = Math.random() > 0.5 ? 1 : 0;

	let start = loop_dir ? v_n : -v_n;
	let end = loop_dir ? -v_n : v_n;
	let sign = loop_dir ? -1 : 1;

	// for(let i = -v_n  ;i < v_n  ;i+=leap(gam1,gam2)){
	for (
		let i = start;
		loop_dir ? i > end : i < end;
		i += leap(gam1, gam2) * sign
	) {
		let v = new THREE.Vector3(0, 0, i);
		if (
			!(
				v.distanceTo(sv) < min_dist ||
				v.distanceTo(ev) < min_dist ||
				Math.abs(v.z - -v_n) < min_dist ||
				Math.abs(v.z - v_n) < min_dist ||
				prev.distanceTo(v) < min_dist
			)
		) {
			prev.copy(v); // update prev
			let line = [new THREE.Vector3(-h_n, 0, i), new THREE.Vector3(h_n, 0, i)];
			line = extend_line(line[0], line[1], true, 1, 4);

			// draw_line(scene_instances,line[0],line[1],true,0x00ff00,2)

			arr_grid.push(line);

			let ch = Math.random();

			let num_lanes = same_lane
				? lane_same_all
				: ch < 0.4
				? sml
				: ch < 0.8
				? mdm
				: large;

			if (opv == 1) {
				// zigzage

				if (flag_evenv) {
					r1v = flag_zigv ? mdm : sml;
					r2v = flag_zigv ? mdm : sml;
					method1 = method2 = flag_zigv ? "edge_vcir" : "edge_roads";
				} else {
					r1v = flag_zigv ? mdm : sml;
					r2v = flag_zigv ? sml : mdm;
					method1 = flag_zigv ? "edge_vcir" : "edge_roads";
					method2 = flag_zigv ? "edge_roads" : "edge_vcir";
				}

				flag_zigv = !flag_zigv;
			}

			if (opv == 2) {
				// mid
				let flag = Math.abs(i) < 3;
				r1v = flag ? lane_v : sml;
				r2v = flag ? lane_v : sml;

				method1 = method2 = flag ? "edge_vcir" : flag_mid_method;

				num_lanes = flag ? lane_v : num_lanes;
			}

			if (opv == 3) {
				// r
				let ch = Math.random();
				method1 = Math.random() > 0.5 ? "edge_vcir" : "edge_roads";
				method2 = Math.random() > 0.5 ? "edge_vcir" : "edge_roads";

				ch = Math.random();
				r1v =
					method1 === "edge_vcir"
						? Math.random() < 0.8
							? mdmf()
							: Math.random() < 0.5
							? sml
							: large
						: 4;

				r2v =
					method2 === "edge_vcir"
						? Math.random() < 0.8
							? mdmf()
							: Math.random() < 0.5
							? sml
							: large
						: 4;
			}

			if (opv == 4) {
				// all

				r1v = flag_all_r
					? all_r
					: Math.random() < 0.8
					? mdmf()
					: Math.random() < 0.5
					? smlf()
					: lrgf();
				r2v = flag_all_r
					? all_r
					: Math.random() < 0.8
					? mdmf()
					: Math.random() < 0.5
					? smlf()
					: lrgf();
				method1 = method2 = flag_all ? "edge_vcir" : "edge_roads";
			}

			vl_temp.z = vr_temp.z = i;

			// get_sphere(vl_temp.x,vl_temp.y,vl_temp.z,0xff0000,2)
			// get_sphere(vr_temp.x,vr_temp.y,vr_temp.z,0x00ff00,2)

			arr_vs.push([vl_temp.clone(), r1v, method1]); //r1v
			arr_vs.push([vr_temp.clone(), r2v, method2]); //r2v

			num_lanes = num_lanes > lane_v ? lane_v : num_lanes; // main roads >= rest
			arr_lanes.push(num_lanes);

			// }

			cnt_z++;
		}
	}

	// console.log("cnt_z=",cnt_z)

	// need atleast 1 split inside park*
	if (cnt_z == 0) {
		// split in mid

		let line = [new THREE.Vector3(-h_n, 0, 0), new THREE.Vector3(h_n, 0, 0)];
		line = extend_line(line[0], line[1], true, 1, 4);

		// draw_line(scene_instances,line[0],line[1],true,0x00ff00,3)

		arr_grid.push(line);

		let m = Math.random() > 0.5 ? "edge_vcir" : "edge_roads";
		vl_temp.z = vr_temp.z = 0;
		arr_vs.push([vl_temp.clone(), 8, m]); //r1v
		arr_vs.push([vr_temp.clone(), 8, m]); //r2v

		arr_lanes.push(lane_v);
	}

	// /////////////////// ------ X AXIS

	///// ---MAP EDGES
	let vertexs_x = [];
	let line = [
		new THREE.Vector3(-h_n + e, 0, -v_n),
		new THREE.Vector3(-h_n, 0, v_n),
	];
	line = extend_line(line[0], line[1], true, 1, 4);

	// draw_line(scene_instances,line[0],line[1],true,0x00ff00)
	e += 0.0001;

	let line2 = [
		new THREE.Vector3(h_n + e, 0, -v_n),
		new THREE.Vector3(h_n, 0, v_n),
	];
	line2 = extend_line(line2[0], line2[1], true, 1, 4);
	// draw_line(scene_instances,line2[0],line2[1],true,0x00ff00)
	e += 0.0001;

	arr_grid.push(extend_line(line[0], line[1], true, 1, 4));
	arr_lanes.push(lane_v);

	arr_grid.push(extend_line(line2[0], line2[1], true, 1, 4));
	arr_lanes.push(lane_v);

	let line3 = [
		new THREE.Vector3(s_h + e, 0, -v_n),
		new THREE.Vector3(s_h, 0, v_n),
	];
	line3 = extend_line(line3[0], line3[1], true, 1, 4);
	// draw_line(scene_instances,line3[0],line3[1],true,0x00ff00)
	e += 0.0001;

	let line4 = [
		new THREE.Vector3(e_h + e, 0, -v_n),
		new THREE.Vector3(e_h, 0, v_n),
	];
	line4 = extend_line(line4[0], line4[1], true, 1, 4);
	// draw_line(scene_instances,line4[0],line4[1],true,0x00ff00)
	e += 0.0001;

	// // // // ////// ---PARK  EDGES
	arr_grid.push(extend_line(line3[0], line3[1], true, 1, 4));
	arr_lanes.push(lane_v);
	arr_grid.push(extend_line(line4[0], line4[1], true, 1, 4));
	arr_lanes.push(lane_v);

	let r2h, r1h;
	// ////// --- SPACIAL PARK SPACE EDGES

	prev = new THREE.Vector3(-h_n, 0, 0); //-h_n

	for (let i = -h_n; i < h_n; i += leap(gam1_z, gam2_z)) {
		let v = new THREE.Vector3(i + e, 0, 0);

		if (
			!(
				v.distanceTo(sh) < min_dist ||
				v.distanceTo(eh) < min_dist ||
				Math.abs(v.x - -h_n) < min_dist ||
				Math.abs(v.x - h_n) < min_dist ||
				prev.distanceTo(v) < min_dist
			)
		) {
			prev.copy(v);

			let line = [
				new THREE.Vector3(i + e, 0, -v_n),
				new THREE.Vector3(i, 0, v_n),
			];
			line = extend_line(line[0], line[1], true, 1, 4);
			// draw_line(scene_instances,line[0],line[1],true,0x00ff00)
			e += 0.0001;

			arr_grid.push(extend_line(line[0], line[1]));

			method1 = method2 = flag_zigv ? "edge_vcir" : "edge_roads";

			let ch = Math.random();
			let num_lanes = same_lane
				? mid_lane_h
				: ch < 0.4
				? sml
				: ch < 0.8
				? mdm
				: large;

			if (oph == 1) {
				// zigzag
				if (flag_evenh) {
					r1h = flag_zigh ? mdm : sml;
					r2h = flag_zigh ? mdm : sml;
					method1 = method2 = flag_zigh ? "edge_vcir" : "edge_roads";
				} else {
					r1h = flag_zigh ? mdm : sml;
					r2h = flag_zigh ? sml : mdm;
					method1 = flag_zigh ? "edge_vcir" : "edge_roads";
					method2 = flag_zigh ? "edge_roads" : "edge_vcir";
				}
				flag_zigh = !flag_zigh;
			}

			if (oph == 2) {
				//mid
				let flag = Math.abs(i) < 3;
				r1h = flag ? lane_h : sml;
				r2h = flag ? lane_h : sml;
				method1 = method2 = flag ? "edge_vcir" : flag_mid_method;

				num_lanes = flag ? lane_h : num_lanes;
			}

			if (oph == 3) {
				// r

				method1 = Math.random() > 0.5 ? "edge_vcir" : "edge_roads";
				method2 = Math.random() > 0.5 ? "edge_vcir" : "edge_roads";

				let ch = Math.random();
				r1h =
					method1 === "edge_vcir"
						? Math.random() < 0.8
							? mdmf()
							: Math.random() < 0.5
							? sml
							: large
						: 4;

				r2h =
					method2 === "edge_vcir"
						? Math.random() < 0.8
							? mdmf()
							: Math.random() < 0.5
							? sml
							: large
						: 4;
			}

			if (oph == 4) {
				// all

				r1h = flag_all_r
					? all_r
					: Math.random() < 0.8
					? mdmf()
					: Math.random() < 0.5
					? smlf()
					: lrgf();
				r2h = flag_all_r
					? all_r
					: Math.random() < 0.8
					? mdmf()
					: Math.random() < 0.5
					? smlf()
					: lrgf();
				method1 = method2 = flag_all ? "edge_vcir" : "edge_roads";
			}

			// r1h = r2h = 0
			hu_temp.x = hd_temp.x = i;
			arr_hs.push([hu_temp.clone(), r1h, method1]); //r1h
			arr_hs.push([hd_temp.clone(), r2h, method2]); //r2h

			num_lanes = num_lanes > lane_h ? lane_h : num_lanes; // main roads >= rest
			arr_lanes.push(num_lanes);
		}
	}

	////////// ---- check sizes C.O
	// arr_hs.forEach(v=>{
	//     get_sphere(v[0].x,v[0].y,v[0].z,0xff0000,v[1])
	// })

	// arr_vs.forEach(v=>{
	//     get_sphere(v[0].x,v[0].y,v[0].z,0xff0000,v[1])
	// })
	////////// ---------------

	split_vertecs.push(...arr_hs);
	split_vertecs.push(...arr_vs);

	// console.log("split_vertecs()",split_vertecs)

	arr_grid.forEach((line) => {
		let line_t = extend_line(
			line[0],
			line[1],
			true,
			1,
			THREE.MathUtils.randFloat(40, 560)
		);
		draw_line(
			scene_instances,
			line_t[0],
			line_t[1],
			true,
			get_edge_lines(),
			-2
		);
	});

	arr_grp.push(arr_grid);
	// let arr_lanes2 = new Array(arr_grid.length).fill(16)
	// arr_roads.push(arr_lanes2)

	arr_roads.push(arr_lanes); ///*** orig

	return [arr_grp, arr_roads];
}

////////// ----   grid map

// ////////// ----   grid map
// ////////// ----   grid map

// function get_grid_map(){

//     let e = 0.001
//     let arr_grp = []
//     let arr_roads = []

//     let arr_grid = [] // map
//     let arr_lanes = []  // road lane sizes

// let smlf = ()=>{return 4 }
// let mdmf = (a=6,b=12)=>{ let res = THREE.MathUtils.randInt(a,b); return res%2==0 ? res  : res-1  } // mdm range 6 -- 12
// let lrgf = ()=>{ let res = THREE.MathUtils.randInt(14,16); return res%2==0 ? res : res-1 } // mdm range 6 -- 12

// //^^ra
// flag_ra_edges =   1 //Math.random()<0.5;
// // console.log("edges===",flag_ra_edges)
// flag_ra_inside =  1 //Math.random()<0.5;
// flag_switch = Math.random()<0.2;

// let same_lane = Math.random()<0.2;

// // console.log("same_lane=",same_lane)
// let ch = Math.random();

// let res = Math.random();
// let res2 = Math.random();
// let ln =  res < 0.8 ? ( flag_ra_edges? mdmf(8,14) : mdmf() ): res < 0.5 ? smlf() : lrgf();

// let main_same = Math.random()>0.5;

// let lane_v = main_same ? ln : res < 0.8 ? ( flag_ra_edges? mdmf(8,14) : mdmf() ) : res < 0.5 ? smlf() : lrgf();
// let lane_h = main_same ? ln : res2 < 0.8 ? ( flag_ra_edges? mdmf(8,14) : mdmf() ) : res2 < 0.5 ? smlf() : lrgf();

// ch = Math.random();
// ln =  ch<0.8 ? mdmf()  : lrgf();

// // when all same
// ch = Math.random();
// let lane_same_all = ch<0.8 ? mdmf()  : ch < 0.9 ? 12 : 4;
// // mid
// let mid_lane_v =  ln
// let mid_lane_h = mid_lane_v

// // rest
// ch = Math.random();
// ln = ch < 0.8 ? mdmf() : smlf();

// // defualt sml mdm lrg
// let large = lrgf()
// let mdm = mdmf()
// let sml = smlf()

// //////// test splits
// let dpx = THREE.MathUtils.randInt(7,20)
// dpx = dpx%2==0 ? dpx : dpx-1

// // dpx = 15

// let sx =(h_n*2/dpx)

// // let dpz = 10
// let dpz = THREE.MathUtils.randInt(3,11)
// dpz = dpz%2==0 ? dpz : dpz-1

// dpz = 5

// let sz =(v_n*2/dpz)

// // potantial splits z + x == red
// // actual == green
// for(let i=-h_n;i<h_n;i+=sx){
//     let v = new THREE.Vector3(i,1,-v_n)
//     let v2 = new THREE.Vector3(i,1,v_n)
//     // draw_line(scene_instances,v,v2,true,0x00ff00)
// }

// for(let i=-v_n;i<v_n;i+=sz){
//     let v = new THREE.Vector3(-h_n,1,i)
//     let v2 = new THREE.Vector3(h_n,1,i)
//     // draw_line(scene_instances,v,v2,true,0x00ff00)
// }

// let arr_hs = []
// let arr_vs = []
// let opv;
// let oph;

// ////// ------------
// // 1 zig, 2  mid , 3 random ,  4 all
// let map_op = Math.random();

// /// --- zig
// // kind vir/str first
//     let flag_zigh = Math.random()>0.5 ? 1:0;
//     let flag_zigv = Math.random()>0.5 ? 1:0;

// 	// switch
//     let flag_evenv =  1 //Math.random()>0.5 ? 1:0;
//     let flag_evenh = Math.random() < 0.2 ? 0:1; // most of time, same opposites

//     let flag_mid_method = Math.random()>0.5 ?  'edge_vcir' : 'edge_roads' ; //mid
//     let flag_all = Math.random()<0.5; // 0 str, 1 cir // all

// let f = 1;

//     if(f && map_op<0.2){
//         console.log("zig")
//         opv = oph = 1;
//         f = 0
//     }

// /// ---- mid
//     if(f &&map_op<0.4){
//         console.log("mid")
//         opv = oph = 2;
//         f = 0

// 		same_lane = Math.random()<0.1
//     }

// /// ---- random
//     if(f &&map_op<0.6){
//         console.log("random")
//         opv = oph = 3;
//         f = 0
// 		flag_switch = 1
//     }

// /// ---- all
// let flag_all_r = Math.random()<0.5 ? 1:0;

// // only when flag_all_r == true
// let all_r = Math.random()<0.8 ? mdmf() : Math.random()<0.5 ? smlf():lrgf();

//     if(f &&map_op<0.8){
//         console.log("all")
//         opv = oph = 4;
//         f = 0

// 		/// reval same_lane
// 		same_lane = Math.random()<0.5
//     }

// /// ---- combined random
// // if above not choose, chose last option
//     if(f){
//         console.log("combined")
//         opv = THREE.MathUtils.randInt(1,2,3,4);
//         oph = THREE.MathUtils.randInt(1,2,3,4);
//         f = 0
//     }

// //^^grid

// ///// ----  steps jump
// let gam1 = opv == 2 ? sz : sz*0.7
// let gam2 = opv == 2 ? sz : sz*1.2

// let gam1_z = oph == 2 ? sx : sx*0.7
// let gam2_z = oph == 2 ? sx : sx*1.2

// // let min_dist = Math.max(Math.max(sz,sx)*0.6,17*2) //  0.51  // adusjt to radiuses *
//  // Math.max(sz,sx)*0.6 * (17*1 ) //26*1

// let hu_temp = new THREE.Vector3(0,0,s_v) // change x
// let hd_temp = new THREE.Vector3(0,0,e_v)

// let vl_temp = new THREE.Vector3(s_h,0,0) // change z
// let vr_temp = new THREE.Vector3(e_h,0,0)

// let r = 10

// let method1,method2;

// let method = 'edge_vcir'

// // options : 1 zig, 2  mid , 3 random ,  4 all
// // let opv = 2
// // let oph = 2

// if(opv==4 || oph==4){
//     method = flag_all ?  'edge_vcir' : 'edge_roads'
// }

// let edges_same = Math.random()<0.8 ? 1 :0; // same/not edges methods

// console.log("edges_same=",edges_same)

// // -- used only when edges_same
// let r_same = Math.random()<0.5 ? lane_h : lane_v;
// let m_same = Math.random()<0.5 ? 'edge_vcir' : 'edge_roads'

// r = edges_same ? r_same :  Math.random()<0.5 ? lane_h : lane_v;
// method = edges_same ? m_same : Math.random() >0.5 ? 'edge_vcir' : 'edge_roads' ;

// // console.log("r===",r)

// let arr_es = []
// // ------ park edges
// vl_temp.z = vr_temp.z = s_v
// // arr_vs.push([vl_temp.clone(),r,method])
// arr_es.push([vl_temp.clone(),r,method])

// r = edges_same ? r_same :  Math.random()<0.5 ? lane_h : lane_v;
// method = edges_same ? m_same : Math.random() >0.5 ? 'edge_vcir' : 'edge_roads' ;
// // console.log("r===",r)

// // arr_vs.push([vr_temp.clone(),r,method])
// arr_es.push([vr_temp.clone(),r,method])

// r = edges_same ? r_same :  Math.random()<0.5 ? lane_h : lane_v;
// method = edges_same ? m_same : Math.random() >0.5 ? 'edge_vcir' : 'edge_roads' ;
// // console.log("r===",r)

// vl_temp.z = vr_temp.z = e_v
// // arr_vs.push([vl_temp.clone(),r,method])
// arr_es.push([vl_temp.clone(),r,method])

// // console.log("r===",r)

// r = edges_same ? r_same :  Math.random()<0.5 ? lane_h : lane_v;
// method = edges_same ? m_same : Math.random() >0.5 ? 'edge_vcir' : 'edge_roads' ;

// // console.log("r===",r)
// // arr_vs.push([vr_temp.clone(),r,method])
// arr_es.push([vr_temp.clone(),r,method])

// let min_dist_max =  Math.max(lane_v,lane_h)*2.1 //33
// let min_distv =  lane_v*2.1 //33
// let min_disth =  lane_h*2.1 //33
// // get_sphere(0,0,0,0xff0000,min_dist/2) // check min size

// ////// ---MAP EDGES
// let l3 = [new THREE.Vector3(-h_n,0,-v_n),new THREE.Vector3(h_n,0,-v_n)]
// l3 = extend_line(l3[0],l3[1],true,1,4)
// arr_grid.push(	l3)
// arr_lanes.push(lane_h)

// let l4 = [new THREE.Vector3(-h_n,0,v_n),new THREE.Vector3(h_n,0,v_n)]
// l4 = extend_line(l4[0],l4[1],true,1,4)
// arr_grid.push(	l4	)
// arr_lanes.push(lane_h)

// let l1 = [new THREE.Vector3(-h_n,0,s_v),new THREE.Vector3(h_n,0,s_v)]
// l1 = extend_line(l1[0],l1[1],true,1,4)
// ////// ---PARK  EDGES
// arr_grid.push(	l1	)
// arr_lanes.push(lane_h)

// let l2 = [new THREE.Vector3(-h_n,0,e_v),new THREE.Vector3(h_n,0,e_v)]
// l2 = extend_line(l2[0],l2[1],true,1,4)

// arr_grid.push(	l2	)
// arr_lanes.push(lane_h)

// ////// --- SPACIAL PARK SPACE EDGES

// let leap = (a,b)=>{
//     return THREE.MathUtils.randFloat(a,b); // 3,5
// }

// let r1v,r2v;

// // loop arr with radiuses + pos, retrun if collide
// function is_collide(arr,pos,rad){

// 	for(let i=0;i<arr.length;i++){
// 		if(arr[i][0].distanceTo(pos) * 1.1 <= rad + arr[i][1]){
// 			return true
// 		}
// 	}
// 	return false

// }

// let cnt_z = 0
// let prev =  new THREE.Vector3(0,0, -v_n)
// for(let i = -v_n  ;i < v_n  ;i+=leap(gam1,gam2)){
//     let vlt = vl_temp.clone()
// 	let vlr = vr_temp
// 	vlt.z = vlr.z = i

//     if(     !(is_collide(arr_es,vlt,min_dist_max)  || is_collide(arr_vs,vlt,min_distv) || is_collide(arr_vs,vrt,min_distv))   ){

//         // prev.copy(v) // update prev
//         let line = [new THREE.Vector3(-h_n,0,i),new THREE.Vector3(h_n,0,i)]
//         line = extend_line(line[0],line[1],true,1,4)

//         // draw_line(scene_instances,line[0],line[1],true,0x00ff00,2)

//         arr_grid.push(	line	)

//         let ch = Math.random();

//         let num_lanes =  same_lane ? lane_same_all : ch<0.4 ? sml : ch< 0.8 ? mdm: large ;

//             if(opv==1){ // zigzage

//                 if(flag_evenv){
//                     r1v = flag_zigv ? mdm : sml;
//                     r2v = flag_zigv ? mdm : sml;
//                     method1 = method2 = flag_zigv ?  'edge_vcir' : 'edge_roads'

//                 }
//                 else{
//                     r1v = flag_zigv ? mdm : sml;
//                     r2v = flag_zigv ? sml : mdm;
//                     method1 = flag_zigv ?  'edge_vcir' : 'edge_roads'
//                     method2 = flag_zigv ?  'edge_roads' : 'edge_vcir'
//                 }

//                 flag_zigv = !flag_zigv
//             }

//             if(opv==2){ // mid
//                 let flag = Math.abs(i) < 3;
//                 r1v = flag ? lane_v : sml;
//                 r2v = flag ? lane_v : sml;

//                 method1 = method2 =  flag ? 'edge_vcir' : flag_mid_method;

//                 num_lanes = flag ? lane_v : num_lanes

//             }

//             if(opv==3){ // r
//                 let ch = Math.random();
//                 method1 = Math.random()>0.5 ?  'edge_vcir' : 'edge_roads'
//                 method2 = Math.random()>0.5 ?  'edge_vcir' : 'edge_roads'

//                 ch = Math.random()
//                 r1v = method1 === 'edge_vcir' ? ( Math.random()<0.8 ? mdmf()  : Math.random()<0.5 ? sml : large )
//                 : 4;

//                 r2v = method2 === 'edge_vcir' ? ( Math.random()<0.8 ? mdmf()  : Math.random()<0.5 ? sml : large )
//                 : 4;

//             }

//             if(opv==4){ // all

//                 r1v = flag_all_r ? all_r : Math.random()<0.8 ? mdmf() : Math.random()<0.5 ? smlf():lrgf();
//                 r2v = flag_all_r ? all_r : Math.random()<0.8 ? mdmf() : Math.random()<0.5 ? smlf():lrgf();
//                 method1 = method2 = flag_all ?  'edge_vcir' : 'edge_roads'
//             }

//             // vl_temp.z = vr_temp.z = i

// 			// get_sphere(vl_temp.x,vl_temp.y,vl_temp.z,0xff0000,2)
// 			// get_sphere(vr_temp.x,vr_temp.y,vr_temp.z,0x00ff00,2)

//             arr_vs.push([vl_temp.clone(),r1v,method1]) //r1v
//             arr_vs.push([vr_temp.clone(),r2v,method2])  //r2v

//             num_lanes = num_lanes > lane_v ? lane_v : num_lanes; // main roads >= rest

//             arr_lanes.push(num_lanes)

//         // }

// 		cnt_z++;

// }

// // console.log("cnt_z=",cnt_z)

// // need atleast 1 split inside park*
// if(cnt_z==0){

// 	// split in mid

// 	let line = [new THREE.Vector3(-h_n,0,0),new THREE.Vector3(h_n,0,0)]
// 	line = extend_line(line[0],line[1],true,1,4)

// 	// draw_line(scene_instances,line[0],line[1],true,0x00ff00,3)

// 	arr_grid.push(	line	)

// 	let m = Math.random()>0.5 ? 'edge_vcir' : 'edge_roads' ;
// 	vl_temp.z = vr_temp.z = 0
// 	arr_vs.push([vl_temp.clone(),8,m]) //r1v
// 	arr_vs.push([vr_temp.clone(),8,m])  //r2v

// 	arr_lanes.push(lane_v)

// }

// // /////////////////// ------ X AXIS

// ///// ---MAP EDGES
// let vertexs_x = []
// let line = [new THREE.Vector3(-h_n+e,0,-v_n),new THREE.Vector3(-h_n,0,v_n)]
// line = extend_line(line[0],line[1],true,1,4)

// // draw_line(scene_instances,line[0],line[1],true,0x00ff00)
// e+=0.0001

// let line2 = [new THREE.Vector3(h_n+e,0,-v_n),new THREE.Vector3(h_n,0,v_n)]
// line2 = extend_line(line2[0],line2[1],true,1,4)
// // draw_line(scene_instances,line2[0],line2[1],true,0x00ff00)
// e+=0.0001

// arr_grid.push(extend_line(line[0],line[1],true,1,4))
// arr_lanes.push(lane_v)

// arr_grid.push(extend_line(line2[0],line2[1],true,1,4))
// arr_lanes.push(lane_v)

// let line3 = [new THREE.Vector3(s_h+e,0,-v_n),new THREE.Vector3(s_h,0,v_n)]
// line3 = extend_line(line3[0],line3[1],true,1,4)
// // draw_line(scene_instances,line3[0],line3[1],true,0x00ff00)
// e+=0.0001

// let line4 = [new THREE.Vector3(e_h+e,0,-v_n),new THREE.Vector3(e_h,0,v_n)]
// line4 = extend_line(line4[0],line4[1],true,1,4)
// // draw_line(scene_instances,line4[0],line4[1],true,0x00ff00)
// e+=0.0001

// // // // // ////// ---PARK  EDGES
// arr_grid.push(	extend_line(line3[0],line3[1],true,1,4))
// arr_lanes.push(lane_v)
// arr_grid.push(	extend_line(line4[0],line4[1],true,1,4))
// arr_lanes.push(lane_v)

// let r2h,r1h;
// // ////// --- SPACIAL PARK SPACE EDGES

// prev = new THREE.Vector3(-h_n ,0,0) //-h_n

// for(let i = -h_n  ;i < h_n  ;i+=leap(gam1_z,gam2_z)){
//     let v = new THREE.Vector3(i+e,0,0)

//         if(     !(v.distanceTo(sh) <  min_dist || v.distanceTo(eh) <  min_dist ||
//         Math.abs(v.x-(-h_n)) <  min_dist|| Math.abs(v.x-h_n) <  min_dist ||
//         prev.distanceTo(v) < min_dist)   ){

//             prev.copy(v)

//         let line = [new THREE.Vector3(i+e,0,-v_n),new THREE.Vector3(i,0,v_n)]
//         line = extend_line(line[0],line[1],true,1,4)
//         // draw_line(scene_instances,line[0],line[1],true,0x00ff00)
//         e+=0.0001

//         arr_grid.push(	extend_line(line[0],line[1]))

//         method1 = method2 = flag_zigv ?  'edge_vcir' : 'edge_roads'

//         let ch = Math.random();
//         let num_lanes = same_lane ? mid_lane_h : ch<0.4 ? sml : ch< 0.8 ? mdm: large ;

//             if(oph==1){ // zigzag
//                     if(flag_evenh){

//                         r1h = flag_zigh ? mdm : sml;
//                         r2h = flag_zigh ? mdm : sml;;
//                         method1 = method2 = flag_zigh ?  'edge_vcir' : 'edge_roads'

//                     }
//                     else{
//                         r1h = flag_zigh ? mdm : sml;
//                         r2h = flag_zigh ? sml : mdm;
//                         method1 = flag_zigh ?  'edge_vcir' : 'edge_roads'
//                         method2 = flag_zigh ?  'edge_roads' : 'edge_vcir'
//                     }
//                 flag_zigh = !flag_zigh

//             }

//             if(oph==2){ //mid
//                 let flag = Math.abs(i) < 3;
//                 r1h = flag ? lane_h : sml;
//                 r2h = flag ? lane_h : sml;
//                 method1 = method2 =   flag ? 'edge_vcir' : flag_mid_method ;

//                 num_lanes = flag ? lane_h : num_lanes

//              }

//              if(oph==3){ // r

//                 method1 = Math.random()>0.5 ?  'edge_vcir' : 'edge_roads'
//                 method2 = Math.random()>0.5 ?  'edge_vcir' : 'edge_roads'

//                 let ch = Math.random()
//                 r1h = method1 === 'edge_vcir' ? ( Math.random()<0.8 ? mdmf()  : Math.random()<0.5 ? sml : large )
//                 : 4;

//                 r2h = method2 === 'edge_vcir' ? ( Math.random()<0.8 ? mdmf()  : Math.random()<0.5 ? sml : large )
//                 : 4;

//             }

//             if(oph==4){ // all

//                 r1h = flag_all_r ? all_r : Math.random()<0.8 ? mdmf() : Math.random()<0.5 ? smlf():lrgf();
//                 r2h = flag_all_r ? all_r : Math.random()<0.8 ? mdmf() : Math.random()<0.5 ? smlf():lrgf();
//                 method1 = method2 = flag_all ?  'edge_vcir' : 'edge_roads'
//             }

//             // r1h = r2h = 0
//             hu_temp.x = hd_temp.x = i
//             arr_hs.push([hu_temp.clone(),r1h,method1]) //r1h
//             arr_hs.push([hd_temp.clone(),r2h,method2]) //r2h

//             num_lanes = num_lanes > lane_h ? lane_h : num_lanes; // main roads >= rest
//             arr_lanes.push(num_lanes)

//         }

// }

// ////////// ---- check sizes C.O
// // arr_hs.forEach(v=>{
// //     get_sphere(v[0].x,v[0].y,v[0].z,0xff0000,v[1])
// // })

// // arr_vs.forEach(v=>{
// //     get_sphere(v[0].x,v[0].y,v[0].z,0xff0000,v[1])
// // })
// ////////// ---------------

// split_vertecs.push(...arr_hs)
// split_vertecs.push(...arr_vs)

// // console.log("split_vertecs()",split_vertecs)

// arr_grid.forEach(line=>{
//     let line_t = extend_line(line[0],line[1],true,1,THREE.MathUtils.randFloat(40,560))
//     draw_line(scene_instances,line_t[0],line_t[1],true,get_edge_lines(),-2)
// })

//     arr_grp.push(arr_grid)
// 	// let arr_lanes2 = new Array(arr_grid.length).fill(16)
//     // arr_roads.push(arr_lanes2)

//     arr_roads.push(arr_lanes) ///*** orig

//     return [arr_grp,arr_roads]

// }

// ////////// ----   grid map

//////// ----- building linesss

function get_line_buidling(info_poly, s, h, div_h, div_v, twist_alpha) {
	let area_b = OffsetContour(info_poly.alpha_off * 1, info_poly.new_area, true);
	let offset_lines = OffsetContour(info_poly.alpha_off, area_b, true);

	let res_lines = floor_lines(area_b, div_h, div_v, 0, twist_alpha);

	let shape = [...poly_to_lines(area_b), ...res_lines];

	let graph = new G(shape); //
	let polys2 = graph.get_lines(false, false, 0xff00ff, 1); //2,1 //0.1

	let wid = Math.abs(info_poly.alpha_off) * 13; // //11

	let line_props = [];
	let flag_edge = false;
	let n = null;

	let start_lvl = 1.5;
	let flr = 1.5;
	let color = get_color_b(c_building);
	let p = THREE.MathUtils.randInt(1, 4);
	let w = wid;

	for (let i = 0; i < offset_lines.length; i++) {
		// let corner_line =
		line3.start.copy(offset_lines[i]);
		line3.end.copy(offset_lines[(i + 1) % offset_lines.length]);

		let dir = new THREE.Vector3()
			.subVectors(line3.start, line3.end)
			.normalize();
		let step = 0;
		let cur = 0;
		let edge = 0;

		let func_color = get_color_b;
		let c = c_building;

		color = func_color(c);

		while (cur < 1) {
			step = THREE.MathUtils.randFloat(0.1, 0.5); // THREE.MathUtils.randFloat(0.2,0.5)  /// 0.1,0.3 /// 0.2,0.5

			edge = THREE.MathUtils.clamp(cur + step, 0, 1);

			if (1 - edge < 0.1) {
				edge = 1;
			}

			line3.at(cur, vec1);
			line3.at(edge, vec2);
			color = flag_edge ? color : func_color(c);

			let color2 = Math.random() * 0xffffff;

			// draw_line(scene,vec1,vec2,true,   color2,100)

			let m2 = new THREE.Vector3().lerpVectors(vec1, vec2, 0.5);
			outer_90(dir, m2, w);
			// get_sphere(m2.x,m2.y + 100 ,m2.z,color2,1)

			// flr = flag_edge ?  flr :THREE.MathUtils.randInt(3,4) //(2,3)
			flr = flag_edge ? flr : THREE.MathUtils.randInt(2, 3); //(2,3)

			start_lvl = flag_edge ? start_lvl : THREE.MathUtils.randInt(1.3, 1.8);

			n = THREE.MathUtils.randFloat(h[0], h[1]);

			p = flag_edge ? p : THREE.MathUtils.randInt(1, 14);
			w = flag_edge ? w : THREE.MathUtils.randFloat(2, 4) * wid; //            w = flag_edge ? w : THREE.MathUtils.randFloat(5,10)*wid (check*)
			// w = wid*THREE.MathUtils.randFloat(2,16)

			let line_name = new THREE.Vector3().lerpVectors(vec1, vec2, 0.5);
			line_props.push([
				vec1.clone(),
				vec2.clone(),
				w,
				color,
				n,
				n,
				4,
				p,
				start_lvl,
				flr,
				line_name,
			]); /// start_lvl,floor
			cur = edge;

			flag_edge = false;
		} // each line

		flag_edge = Math.random() > 0.5;
	} // loop offset circle

	return [graph, polys2, line_props, area_b];
}

function floor_lines(arr_o, div_h, div_v, yf = 0, twist_alpha = 0) {
	let top_r = [10000, 10000];
	let bottom_l = [-10000, -10000];
	let epi = 0.001;
	let arr6 = [];
	arr_o.forEach((p) => {
		arr6.push(p.clone());
		// get_sphere(p.x,p.y,p.z,0xff0000,1)
	});

	/// create lines +  get maxes
	let arr_lines = [];
	for (let i = 0; i < arr6.length; i++) {
		arr_lines.push([arr6[i], arr6[(i + 1) % arr6.length]]);

		if (arr6[i].x < top_r[0]) {
			top_r[0] = arr6[i].x - epi;
		}
		if (arr6[i].z < top_r[1]) {
			top_r[1] = arr6[i].z - epi;
		}
		if (arr6[i].x > bottom_l[0]) {
			bottom_l[0] = arr6[i].x + epi;
		}
		if (arr6[i].z > bottom_l[1]) {
			bottom_l[1] = arr6[i].z + epi;
		}
	}

	// get_sphere(top_r[0],144,top_r[1],0x0000ff,2)
	// get_sphere(bottom_l[0],144,bottom_l[1],0x00ff00,2)

	let n_j = Math.abs(-top_r[0] + bottom_l[0]);
	let n_i = Math.abs(-top_r[1] + bottom_l[1]);

	let step_x = n_j / div_h;
	let step_z = n_i / div_v;

	let rd = (a) => {
		return THREE.MathUtils.randFloat(-a, a);
	};
	let gr = new G(arr_lines);
	let res_line = [];
	for (let j = 0; j < 2; j++) {
		let s = j == 0 ? top_r[1] : top_r[0];
		let e = j == 0 ? bottom_l[1] : bottom_l[0];

		let step = j == 0 ? step_z : step_x;
		for (let i = s + step / 2; i < e; i += step) {
			let x1 = j == 0 ? top_r[0] : i;
			let x2 = j == 0 ? bottom_l[0] : i;

			let z1 = j == 0 ? i : top_r[1];
			let z2 = j == 0 ? i : bottom_l[1];

			//^^^
			let al =
				twist_alpha < 0.5
					? 0
					: twist_alpha < 0.8
					? THREE.MathUtils.randFloat(0, 2)
					: THREE.MathUtils.randFloat(2, 5);

			let line = [
				new THREE.Vector3(x1 + rd(al), 0, z1 + rd(al)),
				new THREE.Vector3(x2 + rd(al), 0, z2 + rd(al)),
			];

			let temp = extend_line(line[0], line[1], true, 1, 1);

			// draw_line(scene_instances,temp[0],temp[1],true,0xff00ff,155)
			gr.arr.push(temp);

			let res = gr.get_lines(true, false, 0xff0000, 0.2);

			if (res.size != 0) {
				let temp_line = res.get(arr_lines.length - 1);

				if (temp_line === undefined) continue;
				for (let j = 0; j < temp_line.length; j += 2) {
					if (j + 1 >= temp_line.length) {
						break;
					}

					let line = [
						new THREE.Vector3(temp_line[j].x, yf, -temp_line[j].y),
						new THREE.Vector3(temp_line[j + 1].x, yf, -temp_line[j + 1].y),
					];

					line = extend_line(line[0], line[1], true, 1, 1);

					// draw_line(scene_instances,line[0],line[1],true,0x00ff00,144)

					res_line.push(line);
				}
			} /// if res

			// pop temp line split

			gr.arr.pop();
		}
	} // loop new lines

	return res_line;
}

//////// ----- building linesss
