/// slow
// let flag_create = 1  // temp testing create trees cars
// let flag_windows= 1// temp
// let flag_building = 0
// let amt_tree = 0 //7000
// let flag_cars = 1
// let flag_mouse = 0

// let full_render = 0

import * as THREE from "three";
// import * as THREE from "https://cdn.skypack.dev/three@0.136.0";

import { is_point_in_poly } from "./graph.js";
import { arr_colors } from "./color_art.js";

let gl_w = 1920;
let gl_h = 969;
let split_vertecs = []; // nodes c.o + radious sizes
let flag_create = 1; // temp testing create trees cars
let flag_windows = 1; // temp
let flag_building = 0;
let amt_tree = 0; //7000
let flag_cars = 0;
let flag_mouse = 0;

let full_render = 0;

if (full_render) {
	flag_create = 1; // temp testing create trees cars
	flag_windows = 1; // temp
	flag_building = 1;
	amt_tree = 7500; //7000 7500
	flag_cars = 1;
	flag_mouse = 1;
}

let world_pos = new THREE.Vector3();
let world_quat = new THREE.Quaternion();

let vec_zero = new THREE.Vector3(0, 0, 0);
let vec_up = new THREE.Vector3(0, 1, 0);
let vec_reuse = new THREE.Vector3(0, 0, 0);
let scl_cars = 4;
let chance_car = THREE.MathUtils.randFloat(0.1, 0.9);

console.log("chance_car=", chance_car);
// windows
let color_w = [0xffffff, 0xaaaaaa, 0x888888, 0x444444, 0x111111];
let main_matetrial = THREE.MeshStandardMaterial;

// let p = 155
// let q = p-99

let pos = 66; // 66
let q = pos - 11;
let camera_pos = new THREE.Vector3(0, 281, 0); //281
let draw_pencil = false; // * reuse same arr windows

let defualt_y = 0;
let add_y = 0.0;
let y_objs = 0.31;

export {
	flag_mouse,
	flag_cars,
	y_objs,
	chance_car,
	flag_windows,
	split_vertecs,
	flag_building,
	add_y,
	amt_tree,
	gl_w,
	gl_h,
};

let mul = 1;
let op_mul = 1 / mul;

q *= mul;
///////dims buidlings
let k_lines = q;
let n_lines = q;
let alp_lines = 2;

// let v_n = 0.8*n_lines*alp_lines
// let h_n = 2*n_lines*alp_lines

let v_n = 1 * n_lines * alp_lines;
let h_n = 2.7 * n_lines * alp_lines;

// -- city dims
let len_h = h_n * op_mul;
let len_v = v_n * op_mul;
let dif_v = 0.5; // 0.6 // 0.5
let dif_h = 0.8; // 0.75

let s_v = -len_v * dif_v;
let e_v = len_v * dif_v;

let s_h = -len_h * dif_h;
let e_h = len_h * dif_h;

////////////
let pul = new THREE.Vector3(-s_h, 0, s_v, 0xffff00, 3);
let pur = new THREE.Vector3(s_h, 0, s_v, 0xffff00, 3);

let pdl = new THREE.Vector3(-s_h, 0, -s_v, 0xffff00, 3);
let pdr = new THREE.Vector3(s_h, 0, -s_v, 0xffff00, 3);

let edge_method = "edge_vcir"; //Math.random()>0.5 ? 'edge_vcir' : 'edge_roads';

let rad_edges = 4; // same as c.o radiuos

let sh = new THREE.Vector3(s_h, 0, 0);
let eh = new THREE.Vector3(e_h, 0, 0);
let sv = new THREE.Vector3(0, 0, s_v);
let ev = new THREE.Vector3(0, 0, e_v);

export {
	len_h,
	len_v,
	s_v,
	e_v,
	s_h,
	e_h,
	h_n,
	v_n,
	pul,
	pur,
	pdl,
	pdr,
	edge_method,
	rad_edges,
	sh,
	eh,
	sv,
	ev,
	flag_create,
};

// instace info
// let scene_instances

// holds all mesh array verions: arr , instance main goemetry
// * add all car vertions each top + extrude
let mesh_containers = {
	box: [[], null],
	plane: [[], null],
	// 'capsule_line':[[],null],
	cylinder: [[], null],

	// 'capsule':[[],null],

	cone: [[], null],

	// third parm == scl, forth == signal as car obj (used in randomizedmatrix to scale faster each version car)
	// *** need update third parm, when scaling group.
	wheel: [[], null],
	cone_r: [[], null],
	vent_hole: [[], null],
	///// -- for each car version X, topX + bodyX.

	top0: [[], null],
	body0: [[], null],

	top1: [[], null],
	body1: [[], null],

	top2: [[], null],
	body2: [[], null],

	top3: [[], null],
	body3: [[], null],

	top4: [[], null],
	body4: [[], null],

	top5: [[], null],
	body5: [[], null],

	top6: [[], null],
	body6: [[], null],

	sphere: [[], null],
	win: [[], null],
	win_box: [[], null],
	dbl_pln: [[], null],
	cone_scat: [[], null],
};

// get name nums cars, for optimization

let car_nums = new Map([
	[0, ["top0", "body0"]],
	[1, ["top1", "body1"]],
	[2, ["top2", "body2"]],
	[3, ["top3", "body3"]],
	[4, ["top4", "body4"]],
	[5, ["top5", "body5"]],
	[6, ["top6", "body6"]],
]);

let flag_instance = true;

function arr3d_to_2d(arr) {
	let temp = [];

	arr.forEach((v) => {
		temp.push(new THREE.Vector2(v.x, -v.z));
	});

	return temp;
}

export {
	mesh_containers,
	draw_pencil,
	color_w,
	car_nums,
	defualt_y,
	arr3d_to_2d,
	scl_cars,
};

function OffsetContour(offset, contour, d3 = false) {
	let temp = [];

	if (d3) {
		contour.forEach((v) => {
			temp.push(new THREE.Vector2(v.x, -v.z));
		});

		contour = temp;
	}

	let result = [];

	offset = new THREE.BufferAttribute(new Float32Array([offset, 0, 0]), 3);
	// console.log("offset", offset);

	for (let i = 0; i < contour.length; i++) {
		let v1 = new THREE.Vector2().subVectors(
			contour[i - 1 < 0 ? contour.length - 1 : i - 1],
			contour[i]
		);
		let v2 = new THREE.Vector2().subVectors(
			contour[i + 1 == contour.length ? 0 : i + 1],
			contour[i]
		);
		let angle = v2.angle() - v1.angle();
		let halfAngle = angle * 0.5;

		let hA = halfAngle;
		let tA = v2.angle() + Math.PI * 0.5;

		let shift = Math.tan(hA - Math.PI * 0.5);
		let shiftMatrix = new THREE.Matrix4().set(
			1,
			0,
			0,
			0,
			-shift,
			1,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1
		);

		let tempAngle = tA;
		let rotationMatrix = new THREE.Matrix4().set(
			Math.cos(tempAngle),
			-Math.sin(tempAngle),
			0,
			0,
			Math.sin(tempAngle),
			Math.cos(tempAngle),
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1
		);

		let translationMatrix = new THREE.Matrix4().set(
			1,
			0,
			0,
			contour[i].x,
			0,
			1,
			0,
			contour[i].y,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1
		);

		let cloneOffset = offset.clone();
		// console.log("cloneOffset", cloneOffset);
		cloneOffset.applyMatrix4(shiftMatrix);
		cloneOffset.applyMatrix4(rotationMatrix);
		cloneOffset.applyMatrix4(translationMatrix);

		result.push(new THREE.Vector2(cloneOffset.getX(0), cloneOffset.getY(0)));
	}

	let d3_res = [];
	if (d3) {
		result.forEach((v) => {
			d3_res.push(new THREE.Vector3(v.x, 0, -v.y));
		});

		return d3_res;
	}

	return result;
}

function Precision(n, len = 10000) {
	return Math.round(n * len) / len;
}

function toIndex(x, y, xMax = 100, len = 10000) {
	return Precision(x + y * xMax, len);
}

function random_pick(arr) {
	return arr[Math.floor((arr.length - 0.1) * Math.random())];
}

export { toIndex, random_pick };

export {
	camera_pos,
	Precision,
	OffsetContour,
	main_matetrial,
	flag_instance,
	k_lines,
	n_lines,
	alp_lines,
};

// *
function d3_shape(len1, len2, len3) {
	// indexes to same vertex
	const range1 = new Array(len1).fill([]); // x
	const range2 = new Array(len2).fill([]); // y
	const range3 = new Array(len3).fill([]); // z

	const grid3d_ind = range1.map((e) => range2.map((e) => range3.map((e) => e)));

	/// vertex position
	const r1 = new Array(len1).fill(); // x
	const r2 = new Array(len2).fill(); // y
	const r3 = new Array(len3).fill(); // z

	const grid3d_vert = r1.map((e) => r2.map((e) => r3.map((e) => e)));

	for (let x = 0; x < len1; x++) {
		for (let y = 0; y < len2; y++) {
			for (let z = 0; z < len3; z++) {
				grid3d_ind[x][y][z] = [];
				grid3d_vert[x][y][z] = null;
			}
		}
	}

	////// box
	let b = new THREE.BoxGeometry(
		len1 - 1,
		len2 - 1,
		len3 - 1,
		len1 - 1,
		len2 - 1,
		len3 - 1
	); // same size segs/len to get same res.
	b.translate((len1 - 1) / 2, (len2 - 1) / 2, (len3 - 1) / 2);
	let mm = new THREE.MeshPhongMaterial({ color: 0xff0000, wireframe: false });

	let mesh = new THREE.Mesh(b, mm);

	////// find indexes and add to grid
	let v3 = new THREE.Vector3();
	let pos = mesh.geometry.attributes.position.array;

	// // by positions

	for (let i = 0; i < pos.length; i += 3) {
		let v = new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2]);

		// index
		grid3d_ind[v.x][v.y][v.z].push(i);

		// update vertex position
		if (grid3d_vert[v.x][v.y][v.z] == null) grid3d_vert[v.x][v.y][v.z] = v;
	}

	b.translate(-(len1 - 1) / 2, -(len2 - 1) / 2, -(len3 - 1) / 2);
	return [grid3d_ind, mesh];
}

export { d3_shape };

function get_color_b(i = 0) {
	let temp = arr_colors[i];
	return temp[Math.floor((temp.length - 0.01) * Math.random())];
}

export { get_color_b };

//**repeat */
function ventHoleGeometry() {
	let a = 0.7;
	let arr = [
		[-a, -a],
		[-a, a],
		[a, a],
		[a, -a],
	];

	let shape = new THREE.Shape();
	let len = arr.length;

	shape.moveTo(arr[0][0], arr[0][1]);

	for (let i = 1; i < len; i++) {
		shape.lineTo(arr[i][0], arr[i][1]);
	}

	shape.lineTo(arr[0][0], arr[0][1]);

	const holePath = new THREE.Path().absarc(0, 0, 0.7, 0, Math.PI * 2, true);

	shape.holes.push(holePath);

	const props = {
		steps: 2,
		depth: 1, // car side width
		bevelEnabled: false,
	};

	let q = new THREE.ExtrudeGeometry(shape, props);
	return q;
}

export { ventHoleGeometry };

// side 1 == both, 2 == left, 3 == right
function extend_line(p1, p2, expand = true, side = 1, epsi = 0.5) {
	//let epsi =1.5 //0.1;// * adjust 0.05
	let cur = p1;
	let next = p2;

	let dir = new THREE.Vector3().subVectors(next, cur).normalize();
	let dir2 = dir.clone();

	// extend == true / extract
	let b_expand = expand == true ? 1 : -1;
	let c1 = cur.clone();
	let c2 = next.clone();
	if (side == 1) {
		// both
		c1 = cur.clone().add(dir.multiplyScalar(-epsi * b_expand)); // cur
		c2 = next.clone().add(dir2.multiplyScalar(epsi * b_expand)); // next
	}

	if (side == 2) {
		// p1 (left)
		c1 = cur.clone().add(dir.multiplyScalar(-epsi * b_expand)); // cur
	}

	if (side == 3) {
		c2 = next.clone().add(dir2.multiplyScalar(epsi * b_expand)); // next
	}

	/////// ***************** neeed for shit algorithm ***************** dont comment
	/////// check if useless (most be).
	let val_change = 0.05; // * adjust

	c1.x += THREE.MathUtils.randFloat(-val_change, val_change);
	c1.y += THREE.MathUtils.randFloat(-val_change, val_change);
	c1.z += THREE.MathUtils.randFloat(-val_change, val_change);

	c2.x += THREE.MathUtils.randFloat(-val_change, val_change);
	c2.y += THREE.MathUtils.randFloat(-val_change, val_change);
	c2.z += THREE.MathUtils.randFloat(-val_change, val_change);

	let line = [
		c1, // cur
		c2, // next
	];

	return line;
}

// loop arr verteces & extend edge by epsilone to get intersections
// return arr lines.
function poly_to_lines(arr, expand = true) {
	let res = [];
	let epsi = 0.5; //
	for (let i = 0; i < arr.length; i++) {
		let cur = arr[i];
		let next = arr[(i + 1) % arr.length];
		let line = extend_line(cur, next, expand, 1, 1);

		res.push(line);
	}

	return res;
}

export { poly_to_lines, extend_line };

function outer_90(dir_hor, v1, extrude) {
	// rotate 90 degrees of direction of middle point, for moving coloumns little bit. ( == normal to wall)
	var mx = new THREE.Matrix4().lookAt(dir_hor, vec_zero, vec_up);
	var qt = new THREE.Quaternion().setFromRotationMatrix(mx);

	vec_reuse.set(1, 0, 0);

	vec_reuse.applyQuaternion(qt);
	vec_reuse.multiplyScalar(extrude * 1.5);
	v1.add(vec_reuse);
}

export { outer_90 };

function draw_line(scene, p1, p2, d3 = false, col = 0xff0000, y_t = 0) {
	const material = new THREE.LineBasicMaterial({
		color: col,
	});

	let points;
	if (!d3) {
		points = [];
		points.push(new THREE.Vector3(p1.x, 0, -p1.y));
		points.push(new THREE.Vector3(p2.x, 0, -p2.y));
	} else {
		points = [p1, p2];
	}

	// console.log("points=",points)
	const geometry = new THREE.BufferGeometry().setFromPoints(points);

	const line = new THREE.Line(geometry, material);
	line.position.y += 1 + y_t;

	scene.add(line); // helper, no need instance
}

function outline(s, arr, col = 0x00ff00) {
	const path = new THREE.Path();
	path.moveTo(arr[0].x, -arr[0].z);
	for (let i = 0; i < arr.length; i++) {
		path.lineTo(arr[i].x, -arr[i].z);
	}
	path.lineTo(arr[0].x, -arr[0].z);

	const points = path.getPoints();

	const geometry = new THREE.BufferGeometry().setFromPoints(points);
	const material = new THREE.LineBasicMaterial({ color: col });

	const line = new THREE.Line(geometry, material);
	line.rotateX(-Math.PI / 2);
	line.position.y += 21;
	// scene.add( line ); //

	s.add(line);

	// helper, no need instance
}

export { draw_line, outline };

function get_polygon_centroid(pts, d3 = false) {
	var first = pts[0],
		last = pts[pts.length - 1];
	if (first.x != last.x || first.y != last.y) pts.push(first);
	var twicearea = 0,
		x = 0,
		y = 0,
		nPts = pts.length,
		p1,
		p2,
		f;
	for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
		p1 = pts[i];
		p2 = pts[j];
		f = p1.x * p2.y - p2.x * p1.y;
		twicearea += f;
		x += (p1.x + p2.x) * f;
		y += (p1.y + p2.y) * f;
	}
	f = twicearea * 3;

	return new THREE.Vector2(x / f, y / f);
}

export { get_polygon_centroid };

///////// simplex noise
class SimplexNoise {
	constructor() {
		this.grad3 = [
			[1, 1, 0],
			[-1, 1, 0],
			[1, -1, 0],
			[-1, -1, 0],
			[1, 0, 1],
			[-1, 0, 1],
			[1, 0, -1],
			[-1, 0, -1],
			[0, 1, 1],
			[0, -1, 1],
			[0, 1, -1],
			[0, -1, -1],
		];

		this.p = [];

		for (let i = 0; i < 256; i++) {
			this.p[i] = Math.floor(Math.random() * 256);
		}

		// To remove the need for index wrapping, double the permutation table length
		this.perm = [];

		for (let i = 0; i < 512; i++) {
			this.perm[i] = this.p[i & 255];
		}
	}

	dot(g, x, y) {
		return g[0] * x + g[1] * y;
	}

	noise(xin, yin) {
		let n0; // Noise contributions from the three corners
		let n1;
		let n2;
		// Skew the input space to determine which simplex cell we're in
		const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
		const s = (xin + yin) * F2; // Hairy factor for 2D
		const i = Math.floor(xin + s);
		const j = Math.floor(yin + s);
		const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
		const t = (i + j) * G2;
		const X0 = i - t; // Unskew the cell origin back to (x,y) space
		const Y0 = j - t;
		const x0 = xin - X0; // The x,y distances from the cell origin
		const y0 = yin - Y0;

		let i1; // Offsets for second (middle) corner of simplex in (i,j) coords

		let j1;
		if (x0 > y0) {
			i1 = 1;
			j1 = 0;

			// lower triangle, XY order: (0,0)->(1,0)->(1,1)
		} else {
			i1 = 0;
			j1 = 1;
		} // upper triangle, YX order: (0,0)->(0,1)->(1,1)

		// A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
		// a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
		// c = (3-sqrt(3))/6
		const x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
		const y1 = y0 - j1 + G2;
		const x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
		const y2 = y0 - 1.0 + 2.0 * G2;
		// Work out the hashed gradient indices of the three simplex corners
		const ii = i & 255;
		const jj = j & 255;
		const gi0 = this.perm[ii + this.perm[jj]] % 12;
		const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
		const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
		// Calculate the contribution from the three corners
		let t0 = 0.5 - x0 * x0 - y0 * y0;
		if (t0 < 0) n0 = 0.0;
		else {
			t0 *= t0;
			n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0); // (x,y) of grad3 used for 2D gradient
		}

		let t1 = 0.5 - x1 * x1 - y1 * y1;
		if (t1 < 0) n1 = 0.0;
		else {
			t1 *= t1;
			n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
		}

		let t2 = 0.5 - x2 * x2 - y2 * y2;
		if (t2 < 0) n2 = 0.0;
		else {
			t2 *= t2;
			n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
		}

		// Add contributions from each corner to get the final noise value.
		// The result is scaled to return values in the interval [-1,1].
		return 70.0 * (n0 + n1 + n2);
	}
}

export { SimplexNoise };

// return_dist == [bollean , dist from line]
// closest dist point to line + check if 90 degree.
function dist_lines(p, c1, c2, dist, return_dist = false) {
	const line = new THREE.Line3(c1, c2);
	const target = new THREE.Vector3();
	line.closestPointToPoint(p, true, target); // true // always stay on line

	// dist from line
	const d = target.distanceTo(p);
	// get_sphere(target.x,target.y,target.z,0xff0000)

	// get directions and check angle between
	var ang1 = new THREE.Vector3();
	ang1.copy(target).sub(p);

	var ang2 = new THREE.Vector3();
	ang2.copy(c1).sub(c2);

	var angle = ang1.angleTo(ang2);
	angle = parseFloat(angle.toFixed(3));

	if (!return_dist) {
		if (angle == 1.571 && d < dist) {
			return true;
		}
		return false;
	}

	return [angle == 1.571 && d < dist, d];
}

export { dist_lines };

// if inside park
// add if in poly park  /// or lvl less *
function is_inrange(p, park, edges, gr = null) {
	return is_point_in_poly(edges, p, true, true, gr) == true;
}

//^^^
function collide_point(arr, point, r2 = 2, scene = null) {
	// r2 = 2
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].distanceTo(point) < r2) {
			// if(scene!=null){
			// get_sphere(scene,point.x,point.y,point.z,0x00ff00,2)}

			return true;
		}
	}

	return false;
}

export { collide_point };

function get_noise_memo(
	p1,
	ang1,
	arr,
	main_simplex = null,
	scene = null,
	np,
	na,
	aa = false
) {
	let noise_p = np;

	let mul_alpha = na;
	let cnt = 5555; /// if error, try larger value
	let i = 0;

	// create arr points of river
	let arr_points = [];

	let flag_first = true;

	let c = 0;
	let step = 0.01;
	while (!collide_point(arr, p1, 2, scene)) {
		c += step;

		if (i > cnt) {
			// throw "ERROR : DIDNT FINISH PARTICLE PATH NOISE"
			return arr_points;
		}
		i++;

		arr_points.push(p1.clone());
		let r = main_simplex.noise(p1.x / noise_p, -p1.z / noise_p) * mul_alpha;
		p1.x += Math.cos(ang1 + r) * 0.3;
		p1.z += -Math.sin(ang1 + r) * 0.3;
	}

	return arr_points;
}

export { get_noise_memo };
// park == [vec1,vec2,kind,w,p]
// changed to 2d --> 3d input
function get_trail_noise2(
	scene,
	t1,
	t2,
	a1,
	a2,
	arr,
	simplex = null,
	np = 22,
	ma = 6
) {
	simplex = simplex == null ? new SimplexNoise() : simplex;

	/// starting point + angle
	let ps = [t1, t2];
	let angles = [a1, a2];

	// trail arr points
	let arr_points = [[], []];

	for (let k = 0; k < 2; k++) {
		let p1 = ps[k];
		let ang = angles[k];
		let cnt = 1000; /// if error, try larger value
		let i = 0;

		while (!collide_point(arr, p1, 1.5, scene)) {
			// 1

			if (i > cnt) {
				// throw "ERROR : DIDNT FINISH PARTICLE PATH NOISE"
				break;
			}
			i++;

			arr_points[k].push(p1.clone());
			let r = simplex.noise(p1.x / np, -p1.z / np) * ma;
			p1.x += Math.cos(ang + r) * 0.3;
			p1.z += -Math.sin(ang + r) * 0.3;
		}
	}

	arr_points[0].reverse().pop();
	let new_arr = [...arr_points[0], ...arr_points[1]];
	return new_arr;
}

function get_trail_noise(
	scene,
	t1,
	t2,
	a1,
	a2,
	park,
	edges,
	gr,
	simplex = null,
	np = 22,
	ma = 6
) {
	// console.log("gr=",gr)
	let s = scene;
	simplex = simplex == null ? new SimplexNoise() : simplex;
	// get_sphere(t1.x,t1.y,t1.z,0x00ffff,1)
	let cnt = 1000; /// if error, try larger value
	let i = 0;

	/// starting point + angle
	let particles = [t1, t2];
	let angles = [a1, a2];

	// trail arr points
	let arr_points = [[], []];

	// noise
	let noise_p = np;
	let mul_alpha = ma;

	// while inside map

	let c = 0;
	let step = 0.01;
	while (
		is_inrange(particles[0], park, edges, gr) ||
		is_inrange(particles[1], park, edges, gr)
	) {
		// while(collide_point())
		c += step;
		// console.log("shti")
		if (i > cnt) {
			throw "ERROR : DIDNT FINISH PARTICLE PATH NOISE";
		}
		i++;
		//console.log("shit=",terminated(particles[0]),terminated(particles[1]))
		//if inside  map move dir + add pos to arrays
		for (let i = 0; i < 2; i++) {
			let p1 = particles[i];

			if (is_inrange(p1, park, edges, gr)) {
				arr_points[i].push(p1.clone());
				let r = simplex.noise(p1.x / noise_p, -p1.z / noise_p) * mul_alpha;
				p1.x += Math.cos(angles[i] + r) * 1;
				p1.z += -Math.sin(angles[i] + r) * 1;

				// console.log("p1=",p1)
				// get_sphere(s,p1.x,p1.y,p1.z,0xffffff,0.05)
			}
		}
	}

	// add last point extended beyond border map (both sides)
	// let e1 = arr_points[0][arr_points[0].length-1];
	// let e2 = arr_points[1][arr_points[1].length-1]

	arr_points[0].reverse().pop();

	let new_arr = [...arr_points[0], ...arr_points[1]];

	return new_arr;
} /// function arr noise

export { get_trail_noise, is_inrange, get_trail_noise2 };

function get_sphere(scene, x, y, z, col = 0xffffff, rad = 0.3) {
	let shpere_g = new THREE.SphereGeometry(rad, 11, 11); //(0.3,33,33)
	let shpere_m = new THREE.MeshBasicMaterial({ color: col, wireframe: false });
	let sphere = new THREE.Mesh(shpere_g, shpere_m);
	sphere.position.set(x, y, z);

	scene.add(sphere); // helper, no need instance
}

// flag=0 vectores
// 1 == edges
// 2 == lines

function get_poly_edges(arr, flag = 0) {
	let xmax = -100000;
	let zmax = -100000;
	let xmin = 100000;
	let zmin = 100000;

	// if(flag==0){
	arr.forEach((v) => {
		xmax = Math.max(xmax, v.x);
		zmax = Math.max(zmax, v.z);
		xmin = Math.min(xmin, v.x);
		zmin = Math.min(zmin, v.z);
	});

	return [xmax, zmax, xmin, zmin];

	// }
}

export { get_poly_edges };

function add_container(obj, name, sub_name, w, h, d, p, q, col, scl, ya = 0) {
	obj.getWorldPosition(p);
	obj.getWorldQuaternion(q);

	// replace with ops lens *
	let s =
		name === "box" || name === "win_box"
			? [w, h, d] // 3
			: name === "win" ||
			  name === "dbl_pln" ||
			  name === "plane" ||
			  name === "cylinder" ||
			  name === "cone" ||
			  name === "cone_scat"
			? [w, h] // 2 // cylinder,cone,cone_r
			: name === "sphere"
			? [d] // 1
			: []; // 0 wheel,top,body

	let e = name === "win" || name === "plane" || name === "dbl_pln" ? [scl] : [];

	mesh_containers[name][0].push([
		sub_name,
		...s,
		p.x,
		p.y + ya,
		p.z,
		q.x,
		q.y,
		q.z,
		q.w,
		col,
		...e,
	]);
}

export { add_container };
