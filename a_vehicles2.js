import * as THREE from "three";
// import * as THREE from "https://cdn.skypack.dev/three@0.136.0";

let col1 = 0x000000;

let flag_firsttime = true;
let scene = null;
// latter convert to function
class VehicleGenerator {
	// --- each car, wheel pos changes
	// --- types:
	// 0 == normal x
	// 1 == wagon <---
	// 2 == sedan
	// 3 == wagon
	// 4 == bus
	// 5 pickup
	// 6 minibus
	// 7 van
	// 8 truck
	// jeep,suv,
	// limozin
	// roadster ?
	// lartge car suv/cuv

	constructor(al, flag_firsttime = true, s = null, col = 0xffff00) {
		this.col2 = col;

		scene = s;
		this.al = al;

		/// alpha
		if (flag_firsttime) {
			// 3d
			let arr = get_arr_type;
			for (let i = 0; i < arr.length; i++) {
				for (let j = 0; j < arr[i].length; j++) {
					for (let z = 0; z < arr[i][j].length; z++) {
						arr[i][j][z] *= al;
					}
				}
			}

			this.get_arr_type = arr;

			for (let i = 0; i < get_wly.length; i++) {
				for (let j = 0; j < get_wly[i].length; j++) {
					get_wly[i][j] *= al;
				}
			}

			this.get_wly = get_wly;

			// wheels
			for (let i = 0; i < arr_wheels.length; i++) {
				// arr cars

				for (let j = 0; j < arr_wheels[i].length; j++) {
					// arr wheel info pairs

					for (let z = 0; z < 3; z++) {
						// arr wheel inside pairs
						arr_wheels[i][j][z] *= al;
					}
				}
			}

			this.arr_wheels = arr_wheels;
		}

		flag_firsttime = false;
	}

	get_pos(x, y, z, axis, dir = -1) {
		let t = new THREE.Vector3(x, y, dir * z);
		t.applyAxisAngle(axis, Math.PI / 2);
		return t;
	}

	// front wheel directions
	update(car, v = null) {
		// car == group parts
		if (!v) {
			throw "no anchor wheel";
		}
		let ws1 = car.children[0];
		let ws2 = car.children[1];

		let v1 = new THREE.Vector3();
		ws1.getWorldPosition(v1);

		let v2 = new THREE.Vector3();
		ws2.getWorldPosition(v2);

		let mid = new THREE.Vector3().lerpVectors(v1, v2, 0.5);

		// let dir_mid = new THREE.Vector3().subVectors(v,mid).normalize()

		var origin_ang = Math.atan2(-mid.z - -v.z, mid.x - v.x);

		let x = mid.x - v.x;
		// let y = v1.y - v2.y
		let z = mid.z - v.z;

		let ang = Math.atan2(x, z); // ang between v1,v2

		ws1.rotateX(ang);
		ws2.rotateX(ang);
		get_sphere(v.x, v.y, v.z, 0xff0000, 0.1);
	}

	get_wheels(type) {
		let wheels = arr_wheels[type];
		let wly = get_wly[type];
		let rad_add = arr_add[type];

		// if(type==6){
		// 	console.log(wheels)
		// 	console.log(wly)
		// 	console.log(rad_add)
		// 	throw "s"
		// }

		///// get wheels w1 == w0 size
		let b = 0.9;
		let gf1 = new THREE.CylinderGeometry(
			wheels[0][2] * b,
			wheels[0][2] * b,
			wheels[0][2] * 0.5,
			15
		); //front
		let gf2 = new THREE.CylinderGeometry(
			wheels[0][2] * b,
			wheels[0][2] * b,
			wheels[0][2] * 0.5,
			15
		); //front

		let gb1 = new THREE.CylinderGeometry(
			wheels[0][2] * b,
			wheels[0][2] * b,
			wheels[0][2] * 0.5,
			15
		); // back
		let gb2 = new THREE.CylinderGeometry(
			wheels[0][2] * b,
			wheels[0][2] * b,
			wheels[0][2] * 0.5,
			15
		); // back
		let wm = new THREE.MeshPhongMaterial({ color: 0x111111 });

		let wf1 = new THREE.Mesh(gf1, wm); // lookat far object test
		let wb1 = new THREE.Mesh(gb1, wm); // remains without rotation
		let wf2 = new THREE.Mesh(gf2, wm); // lookat far object test
		let wb2 = new THREE.Mesh(gb2, wm); // remains without rotation

		let rad = wheels[1][2];

		wf1.position.set(
			wly[0] / 2,
			wheels[1][1],
			wheels[1][0] - wly[1] / 2 + rad - rad * rad_add
		); //// LITTLE GAP **** - rad_add???
		wf1.rotateZ(Math.PI / 2);

		wf2.position.set(
			-wly[0] / 2,
			wheels[1][1],
			wheels[1][0] - wly[1] / 2 + rad - rad * rad_add
		); //// LITTLE GAP **** -rad*0.2 ???
		wf2.rotateZ(Math.PI / 2);

		wb1.position.set(
			wly[0] / 2,
			wheels[0][1],
			wheels[0][0] - wly[1] / 2 + rad - rad * rad_add
		); //// LITTLE GAP **** -rad*0.2 ???
		wb1.rotateZ(Math.PI / 2);

		wb2.position.set(
			-wly[0] / 2,
			wheels[0][1],
			wheels[0][0] - wly[1] / 2 + rad - rad * rad_add
		); //// LITTLE GAP **** -rad*0.2 ???
		wb2.rotateZ(Math.PI / 2);

		return [wf1, wf2, wb1, wb2];
	}

	get_vehicle(type, col = 0xffffff) {
		// optimizeeeeeeeeeeee latter ******************
		let arr, body;

		body = this.get_shape(type, col);

		let wly = get_wly[type];

		// tran to 0,0,0 + rotate facing z axis
		tran_pos(body.geometry, -wly[1] / 2, 0, -wly[0] / 2);
		body.geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2));

		//////////// ------------- add wheels  --------------
		let [wf1, wf2, wb1, wb2] = this.get_wheels(type);

		body.wly = wly;

		let parts = new THREE.Group();
		parts.add(wf1);
		parts.add(wf2);

		parts.add(wb1);
		parts.add(wb2);

		parts.add(body);

		// let parts = [wf1,wf2,wb1,wb2,body]

		return parts;
	}

	get_shape(n, col) {
		let arr = get_arr_type[n];
		let wly = get_wly[n];
		let wheels = arr_wheels[n];

		let shape = new THREE.Shape();

		let len = arr.length;

		shape.moveTo(arr[0][0], arr[0][1]);

		for (let i = 1; i < len; i++) {
			shape.lineTo(arr[i][0], arr[i][1]);
		}

		shape.absarc(...wheels[1]); // back
		shape.absarc(...wheels[0]); /// front
		shape.lineTo(arr[0][0], arr[0][1]);

		const props = {
			steps: 2,
			depth: wly[0], // car side width
			bevelEnabled: false,
			bevelThickness: 0.01,
			bevelSize: 0.01,
			bevelOffset: 0.05,
			bevelSegments: 1,
		};

		let q = new THREE.ExtrudeGeometry(shape, props);
		//let col = ['#d3b981','#2d2d28','#5c5749','#9ca78f','#627458','#ae5c1c']
		let c = col;

		//this.col2
		let m = new THREE.MeshPhongMaterial({
			color: c,
			wireframe: false,
			side: THREE.DoubleSide,
		});
		let mesh = new THREE.Mesh(q, m);

		mesh.receiveShadow = true;
		mesh.castShadow = true;

		return mesh;
	}

	get_top2(grid, type, col) {
		/// top plane

		let pp = arr_scale[type];
		// console.log("col=",col)
		let b = new THREE.BoxGeometry(0.65 * pp, 0.16 * pp, 0.6 * pp, 1, 1, 1);
		// let m_c = new THREE.MeshPhongMaterial({color:col, wireframe:false})
		let m_c = new THREE.MeshPhongMaterial({
			color: 0x333333,
			wireframe: false,
		});
		let m_w = new THREE.MeshPhongMaterial({
			color: 0x333333,
			wireframe: false,
		});
		// let mesh = new THREE.Mesh(b,[m_w,m_w,m_c,m_w,m_w,m_w])
		let mesh = new THREE.Mesh(b, m_w);

		let pos = mesh.geometry.attributes.position.array;
		let al = 0.3 * pp;

		// each vehicle own beta to twist , gamma to add pos
		let beta = arr_beta[type];
		let gamma = arr_gamma[type];

		let tfl = new THREE.Vector3(0, 0, 0);
		let tfr = new THREE.Vector3(0, 0, 0);
		let tbr = new THREE.Vector3(0, 0, 0);
		let tbl = new THREE.Vector3(0, 0, 0);

		// beta[0] = -2.27
		// beta[1] = 1
		grid[0][0][0].forEach((ind) => {
			// b,r
			// get_sphere(pos[ind],pos[ind+1],pos[pos+2])

			pos[ind + 2] += beta[0] * al;
		});

		grid[0][0][1].forEach((ind) => {
			// f,r
			// get_sphere(pos[ind],pos[ind+1],pos[pos+2])

			pos[ind + 2] += beta[1] * al;
		});

		grid[1][0][1].forEach((ind) => {
			// f,l
			//get_sphere(pos[ind],pos[ind+1],pos[pos+2])

			pos[ind + 2] += beta[2] * al;
		});

		grid[1][0][0].forEach((ind) => {
			// b,l
			//get_sphere(pos[ind],pos[ind+1],pos[pos+2])

			pos[ind + 2] += beta[0] * al;
		});

		// beta[12] = beta[13] = beta[14] = beta[15] = 0.3
		///(u)  4 next == x == wid in side, z == len == ind+2
		//beta[4]
		// let qq = -1.7; // b8

		grid[0][1][0].forEach((ind) => {
			// b,l
			// get_sphere(pos[ind],pos[ind+1],pos[pos+2])

			pos[ind] += beta[4] * al;
			pos[ind + 1] += beta[12] * al;
			pos[ind + 2] += beta[8] * al;

			tbl.x += beta[4] * al;
			tbl.y += beta[12] * al;
			tbl.z += beta[8] * al;
		});

		grid[1][1][0].forEach((ind) => {
			// b,r
			// get_sphere(pos[ind],pos[ind+1],pos[pos+2])

			pos[ind] += beta[5] * al;
			pos[ind + 1] += beta[13] * al;
			pos[ind + 2] += beta[9] * al; //9

			tbr.x += beta[5] * al;
			tbr.y += beta[13] * al;
			tbr.z += beta[9] * al;
		});

		grid[0][1][1].forEach((ind) => {
			// f,r
			// get_sphere(pos[ind],pos[ind+1],pos[pos+2])

			pos[ind] += beta[6] * al;
			pos[ind + 1] += beta[14] * al;
			pos[ind + 2] += beta[10] * al;

			tfr.x += beta[6] * al;
			tfr.y += beta[14] * al;
			tfr.z += beta[10] * al;
		});

		grid[1][1][1].forEach((ind) => {
			// f,l
			// get_sphere(pos[ind],pos[ind+1],pos[ind+2])

			pos[ind] += beta[7] * al;
			pos[ind + 1] += beta[15] * al;
			pos[ind + 2] += beta[11] * al;

			tfl.x += beta[7] * al;
			tfl.y += beta[15] * al;
			tfl.z += beta[11] * al;
		});

		// 4 next

		// console.log("mesh.position.y=",mesh.position.y)

		/// check translation latter
		mesh.position.x += gamma[0];
		mesh.position.y += gamma[1];
		mesh.position.z += gamma[2];

		// middle top
		let bl = grid[0][1][0][0]; //bl
		let br = grid[1][1][0][0]; //br
		let fr = grid[0][1][1][0]; //fr
		let fl = grid[1][1][1][0]; //fl

		let v = new THREE.Vector3(0, 0, 0);
		let blv = new THREE.Vector3(pos[bl], pos[bl + 1], pos[bl + 2]);
		let brv = new THREE.Vector3(pos[br], pos[br + 1], pos[br + 2]);
		let frv = new THREE.Vector3(pos[fr], pos[fr + 1], pos[fr + 2]);
		let flv = new THREE.Vector3(pos[fl], pos[fl + 1], pos[fl + 2]);

		let top_plane = new THREE.PlaneGeometry(
			brv.x - blv.x + 10,
			frv.z - brv.z + 10
		); //brv.x -blv.x
		let mesh2 = new THREE.Mesh(top_plane, m_c);
		mesh2.rotateX(-Math.PI / 2);
		// mesh2.position.y+=(0.16*pp)/2
		mesh2.position.x += gamma[0];
		mesh2.position.y += gamma[1] + 0.01 + (0.16 * pp) / 2;
		mesh2.position.z += gamma[2] - (tbl.y + tfl.y) / 2;

		return [mesh, mesh2];
	}
}

let ava = 1.3;
let arr_wheels = [
	[
		[3 * 0.3, 1 * 0.3, 0.5, 0, Math.PI * 1, false],
		[5.7, 1 * 0.3, 0.5, 0, Math.PI * 1, false],
	], // normal
	[
		[3 * 0.3, 1 * 0.3, 0.5, 0, Math.PI * 1, false],
		[5.8, 1 * 0.3, 0.5, 0, Math.PI * 1, false],
	], // long

	[
		[2.4, 0.6, 1, 0, Math.PI, false],
		[12.6, 0.6, 1, 0, Math.PI, false],
	], // bus  *

	[
		[3 * 0.4, 1 * 0.3, 0.5, 0, Math.PI * 1, false],
		[5.7, 1 * 0.3, 0.5, 0, Math.PI * 1, false],
	], // pickup
	[
		[3 * 0.4, 1 * 0.3, 0.5, 0, Math.PI * 1, false],
		[5.7, 1 * 0.3, 0.5, 0, Math.PI * 1, false],
	], // sedan1

	[
		[0.7, 1 * 0.3, 0.5, 0, Math.PI * 1, false],
		[3, 1 * 0.3, 0.5, 0, Math.PI * 1, false],
	], // micro

	[
		[1.5 * ava, 1 * 0.3 * ava, 0.5 * ava, 0, Math.PI * 1, false],
		[5.5 * ava, 1 * 0.3 * ava, 0.5 * ava, 0, Math.PI * 1, false],
	], //van
];

// each type, verteces arr 0 ---> last
// -- seperate body/top latter
// add more types
let get_arr_type = [
	[
		[0, 0.3],
		[0, 1],
		[1.6, 1.1],
		[6, 1.1],
		[7, 1],
		[7, 0.4],
	], //	 0 sedan
	[
		[0, 0.3],
		[0, 1],
		[2, 1.2],
		[3.0, 1.2],
		[7, 1.2],
		[7, 0.4],
	], // 	1 wagon

	[
		[0, 0.6],
		[0, 4],
		[16, 4],
		[16, 0.8],
		[14.0, 0.6],
	], // 2 	bus (or instead last 2, [4,0])

	[
		[0, 0.3],
		[0, 1.2],
		[1.6, 1.3],
		[4, 1.3],
		[4, 1.0],
		[7, 1.0],
		[7, 0.3],
	], //	 3 pickup
	[
		[0, 0.3],
		[0, 1],
		[2, 1.2],
		[3.0, 1.2],
		[7, 1.2],
		[7, 0.4],
	], // 	4 hatchback

	[
		[0, 0.3],
		[0, 1],
		[1.6, 1.1],
		[4, 1.1],
		[4, 0.3],
	], // micro

	[
		[0, 0.3 * ava],
		[0.2 * ava, 1.2 * ava],
		[1.1 * ava, 1.45 * ava],
		[3.7 * ava, 1.45 * ava],
		[3.7 * ava, 2.5 * ava],
		[7 * ava, 2.5 * ava],
		[7 * ava, 0.3 * ava],
	], //	 3 van/truck

	[
		[0, 0],
		[0, 0.75],
		[0.5, 1],
		[1.5, 1.75],
		[6, 1.75],
		[6, 0],
	], // 5 	minibus
	[
		[0, 0],
		[0, 3],
		[3, 4],
		[5, 6],
		[7, 6],
		[7, 2],
		[16, 2],
		[16, 0],
	], // 6 	small truck (larger latter)
];

let get_wly = [
	[2.5, 7, 1.7],
	[2, 7, 1.8],

	[3.5, 14, 3.6],

	[2, 8, 1],
	[2, 7, 1.8], //4

	[2.3, 4, 1.1], //5

	[2 * ava, 7 * ava, 2.5 * ava],
];

// add radious ?
let arr_add = [
	0.2, // normal
	0.4, // long

	2, // bus

	-1.2, // pickup

	0.8, // sedan

	0.4, // micro

	0.8 * ava, // pickup
];

// BD ,
/// beta twist top
let arr_beta = [
	[-0.7, 1, 1, -0.7, 0.3, -0.3, 0.3, -0.3, 0, 0, 0, 0, 0, 0, 0, 0],
	[
		-2.27, 1, 1, -2.27, 0.3, -0.3, 0.3, -0.3, -1.7, -1.7, 0, 0, 0.3, 0.3, 0.3,
		0.3,
	],
	[
		-2.27, 1, 1, -2.27, 0.3, -0.3, 0.3, -0.3, -1.7, -1.7, 0, 0, 0.3, 0.3, 0.3,
		0.3,
	], // x
	[0.5, 1, 1, -2.27, 0.3, -0.3, 0.3, -0.3, 0.5, 0.5, 0, 0, 0.3, 0.3, 0.3, 0.3],
	[
		-2.2, 1, 1, 1.2, 0.3, -0.3, 0.3, -0.3, -1.1, -1.1, -0.5, -0.5, 0.1, 0.1,
		0.1, 0.1,
	], // 4
	[
		-0.51, 0.53, 0.53, -0.7, 0.2, -0.2, 0.2, -0.2, -0.1, -0.1, -0.3, -0.3, 0.22,
		0.22, 0.22, 0.22,
	], // micro // 5

	[
		0.5 * ava,
		1 * ava,
		1 * ava,
		-2.27 * ava,
		0.3 * ava,
		-0.3 * ava,
		0.3 * ava,
		-0.3 * ava,
		0.5 * ava,
		0.5 * ava,
		0,
		0,
		0.5 * ava,
		0.5 * ava,
		0.5 * ava,
		0.5 * ava,
	], // van
];

/// gamma add to position top
let arr_gamma = [
	[0, 0.282, -0.1],
	[0, 0.292, -0.1],
	[0, 0.584, -0.2],
	[0, 0.31, 0.1],
	[0, 0.292, -0.1], // 4

	[0, 0.28, -0.08], // 5

	[0, 0.35 * ava, 0.07 * ava], // 6
];

// top scale
let arr_scale = [
	0.75,
	0.61,
	1.5,
	0.65,
	0.61,

	0.7,

	0.65 * ava, // 6
];

// let arr_wheels = [
// 	[[3*0.3, 1*0.3, 0.5, 0, Math.PI * 1, false], [5.7, 1*0.3, 0.5, 0, Math.PI * 1, false]  ],
// 	[[3*0.3, 1*0.3, 0.5, 0, Math.PI * 1, false], [5.8, 1*0.3, 0.5, 0, Math.PI * 1, false]  ]
// ]

// ///***cur
// // each type, verteces arr 0 ---> last
// // -- seperate body/top latter
// // add more types
// let get_arr_type = [
// [[0,0.3],[0,1],[1.6,1.1],[6,1.1],[7,1],[7,0.4]], //	 0 sedan [[0,0],[0,1],[1.6,1.1],[2.6,1.7],[5.5,1.7],[6,1.2],[7,1],[7,0]]
// [[0,0.3],[0,1],[2,1.2],[3.0,1.2],[7,1.2],[7,0.4]], // 	1 wagon
// [[0,0],[0,1],[2,1.1],[3.2,1.8],[6,1.8],[7,1],[7,0]], // 2 	hatchback
// [[0,0],[0,2],[8,2],[8,0.2],[6,0]], // 3 	bus (or instead last 2, [4,0])
// [[0,0],[0,1],[1,1],[2,1.8],[3.3,1.8],[3.3,1],[6,1],[6,0]], // 4 	pickup
// [[0,0],[0,0.75],[0.5,1],[1.5,1.75],[6,1.75],[6,0]], // 5 	minibus
// [[0,0],[0,3],[3,4],[5,6],[7,6],[7,2],[16,2],[16,0]], // 6 	small truck (larger latter)

// ]

// let get_wly = [
// 	[2.5,7,1.1],
// 	[2,7,1.2],
// 	[2,7,1.8],
// 	[2,8,1],
// 	[2,6,1.8],
// 	[2,6,1.75],
// 	[4,16,6],
// ]

// // add radious ?
// let arr_add = [
// 	0.2,
// 	0.4
// ]

// /// beta twist top
// let arr_beta = [
// 	[-0.7,1,1, -0.7,0.3,-0.3,0.3,-0.3,0,0,0,0,0,0,0,0],
// 	[-2.27,1,1, -2.27,0.3,-0.3,0.3,-0.3,-1.7,-1.7,0,0,0.3,0.3,0.3,0.3],

// 	]

// /// gamma add to position top
// 	let arr_gamma =[
// 		[0,0.282,-0.1],
// 		[0,0.292,-0.1] //[0,0.292,-0.1]

// 	]

// 	// top scale
// 	let arr_scale = [
// 		0.75,
// 		0.61,

// 	]

// window % connection steps
let arr_win_steps = [
	[0.35, 0.45, 0.8, 0.8],
	[0.35, 0.45, 0.8, 0.8],
];

function get_sphere(x, y, z, col = 0xff0000, size = 0.1) {
	let shpere_g = new THREE.SphereGeometry(size, 11, 11); //(0.3,33,33)
	let shpere_m = new THREE.MeshBasicMaterial({ color: col, wireframe: false });
	let sphere = new THREE.Mesh(shpere_g, shpere_m);
	sphere.position.set(x, y, z);

	scene.add(sphere);
}

function tran_pos(g, x, y, z) {
	g.applyMatrix4(new THREE.Matrix4().makeTranslation(x, y, z));
}

export { VehicleGenerator, get_wly };
