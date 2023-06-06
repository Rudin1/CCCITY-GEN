import * as THREE from "three";
// import * as THREE from "https://cdn.skypack.dev/three@0.136.0";

import {
	mesh_containers,
	main_matetrial,
	get_color_b,
	extend_line,
	draw_line,
	y_objs,
	add_container,
} from "./a_tools.js";
import { mc_arr, flag_memories, window_cols } from "./color_art.js";
import { get_sphere } from "./graph.js";

let q = 1 / 28.5;
let scene;
let world_pos = new THREE.Vector3();
let world_quat = new THREE.Quaternion();

let main_lamp = new THREE.Group(); //new THREE.Mesh( LampGeometry(), main_mat );
let main_plane = null;
let main_box = null;
let main_truck = null;
let main_leaf = null;

let main_water_con = null;

let first_time = true;

/// create main for each group
// try to combine all to 1 mesh latter **
function init_objs(scene_instances) {
	let main_mat = new THREE.MeshBasicMaterial({ color: 0xffffff });

	if (first_time) {
		scene = scene_instances;

		////////// ========== box
		main_box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), main_mat);
		main_plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), main_mat);

		///////// === main tree
		// main truck
		let h = 10 * 0.05;
		let r = h / 20;

		main_truck = new THREE.Mesh(
			new THREE.CylinderGeometry(r, r, h, 8, 1),
			main_mat
		);
		main_leaf = new THREE.Mesh(new THREE.ConeGeometry(), main_mat);

		main_water_con = init_water_con();

		first_time = false;
	}
}

export { init_objs };

function get_main_vent() {
	// cover EXTRUDE
	let vent = new THREE.Group();

	// cover EXTRUDE
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
	let m = new THREE.MeshPhongMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide,
	});

	let vent_hole = new THREE.Mesh(q, m);

	vent_hole.position.y += 1 - props.depth;
	vent_hole.rotateX(-Math.PI / 2);

	vent.add(vent_hole);

	let r = Math.random() * Math.PI * 2;
	let pl = new THREE.PlaneGeometry(0.2, 1.2);
	let pl2 = new THREE.PlaneGeometry(0.2, 1.2);

	let b1 = new THREE.PlaneGeometry(1, 1);

	let m5 = new THREE.MeshPhongMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide,
	});

	let plane = new THREE.Mesh(pl, m5);
	let plane2 = new THREE.Mesh(pl2, m5);
	let bottom = new THREE.Mesh(b1, m5);

	plane.position.y = 1;
	plane2.position.y = 1;
	bottom.position.y = 0.2;

	plane.rotateY(0 + r);
	plane.rotateX(-Math.PI / 2);

	plane2.rotateY(Math.PI / 2 + r);
	plane2.rotateX(-Math.PI / 2);
	bottom.rotateX(-Math.PI / 2);

	vent.add(plane);
	vent.add(plane2);
	vent.add(bottom);
	return vent;
}

let main_vent_hole = get_main_vent();

function objs_scene(s) {
	scene = s;
}

export { objs_scene };

function get_tree(
	pos,
	color = 0,
	col_grp = true,
	size = [2, 2],
	amount = 65,
	type = 1,
	fm = null,
	ea1 = null,
	ea2 = null
) {
	fm = fm === false ? flag_memories : false;

	// type = 1
	let alpha = THREE.MathUtils.randFloat(size[0], size[1]); // THREE.MathUtils.randFloat(1,4);
	let c = 0; //THREE.MathUtils.randInt(0,6)
	let col1 = get_color_b(c);
	let colt = col1;

	let h = 10 * 0.05 * alpha; //10 *
	let r = h / 20;

	main_truck.position.set(pos.x, pos.y + h / 2, pos.z);

	//add_container(main_truck,'cylinder','tree',r,h,0,world_pos,world_quat,col1)
	let ht = type == 0 ? h : h * 1.8;
	// top cone
	main_leaf.rotation.set(0, 0, 0);
	main_leaf.position.set(pos.x, pos.y + ht / 2, pos.z);

	add_container(
		main_leaf,
		"cone",
		"cone",
		r * 2,
		ht,
		0,
		world_pos,
		world_quat,
		colt,
		1
	); //*1.8

	let tp = type;
	let beta = tp == 0 ? 8 : 15;
	let d = beta * 0.05 * alpha;
	let rad = 1 * alpha;
	let height = 0.2 * alpha;
	c = 3; //THREE.MathUtils.randInt(0,6)

	// console.log("amount=",amount)

	for (let i = 0; i < amount; i++) {
		let f_top = i > amount * 0.95;
		let r1 = THREE.MathUtils.randFloat(rad * 0.8, rad * 1.5);
		let h_t = THREE.MathUtils.randFloat(height * 0.8, height * 1.5);

		let q1 = Math.random() > 0.5 ? 1 : -1;
		let q2 = Math.random() > 0.5 ? 1 : -1;
		let q3 = Math.random() > 0.5 ? 1 : -1;

		// let d1 = i>amount*0.7 ? d/4 : d
		if (f_top) {
			// main_leaf.rotation.set(0,0,0)
			// get top pos

			let q1 = Math.random() > 0.5 ? 1 : -1;
			let q2 = Math.random() > 0.5 ? 1 : -1;
			let q3 = Math.random() > 0.5 ? 1 : -1;
			let d1 = d / 9;
			let x = THREE.MathUtils.randFloat(0, d1) * q1 * 0.5;
			let y = THREE.MathUtils.randFloat(0, d1) * q2 * 0.5;
			let z = THREE.MathUtils.randFloat(0, d1) * q3 * 0.5;

			main_leaf.position.set(pos.x, pos.y, pos.z);
			main_leaf.position.x += x;
			main_leaf.position.y += h + y + 0.02;
			main_leaf.position.z += z;

			// add_container(main_leaf,'cone','leaf',r,h*0.1,0,world_pos,world_quat,col1,1,y_objs)

			// get_sphere(main_leaf.position.x,main_leaf.position.y,main_leaf.position.z,0xff0000,0.1)
		} else {
			if (tp == 0) {
				// d1 = d/5
				let x = THREE.MathUtils.randFloat(0, d) * q1 * 0.5;
				let y = THREE.MathUtils.randFloat(0, d) * q2 * 0.5;
				let z = THREE.MathUtils.randFloat(0, d) * q3 * 0.5;

				main_leaf.position.set(pos.x, pos.y, pos.z);
				main_leaf.position.x += x;
				main_leaf.position.y += h + y;
				main_leaf.position.z += z;
			}

			// cone
			if (tp == 1) {
				// let d1 = i>amount*0.7 ? d/4 : d

				let bottom_h = d / 4;
				let bottom_rad = d / 4;
				let h1 = THREE.MathUtils.randFloat(0, d);
				let raduis = THREE.MathUtils.mapLinear(h1, 0, d, bottom_rad, 0);

				let x = THREE.MathUtils.randFloat(0, raduis) * q1;
				let z = THREE.MathUtils.randFloat(0, raduis) * q3;

				// ang
				main_leaf.position.set(pos.x, pos.y, pos.z);
				main_leaf.position.x += x;
				main_leaf.position.y += bottom_h + h1;
				main_leaf.position.z += z;
			}
		}
		//rot
		// if(!f_top){
		main_leaf.rotateX(Math.random() * Math.PI * 2);
		main_leaf.rotateY(Math.random() * Math.PI * 2);
		main_leaf.rotateZ(Math.random() * Math.PI * 2);

		// main_leaf.getWorldPosition(world_pos)
		// main_leaf.getWorldQuaternion(world_quat)

		if (col_grp) {
			// throw "aaa"
			if (fm) {
				col1 = mc_arr[color][THREE.MathUtils.randInt(0, 1)];
			} else {
				col1 = get_color_b(color);
			}
		} else {
			col1 = color;
			// console.log("col1",col1)
		}

		// }else{
		//     col1 = colt
		// }

		add_container(
			main_leaf,
			"cone",
			"leaf",
			r1 * 0.03,
			h_t * 0.03,
			0,
			world_pos,
			world_quat,
			col1,
			1,
			y_objs
		);

		// // add edge leafs on top
		// for(let i=0;i<10;i++){

		//     add_container(main_leaf,'cone','leaf',r1* 0.03,h_t* 0.03,0,world_pos,world_quat,col1,1,y_objs)

		// }
	}

	// scatter leaves

	// maxes = e_lines1 0 u, 2 d, (z) ||  e_lines2 0 l ,1 r (x)

	let scatter = 1;

	let e = 4;
	// if on edge, dont saccter
	if (
		ea1 != null &&
		(Math.abs(pos.z - ea1[0].z) < e ||
			Math.abs(pos.z - ea1[2].z) < e ||
			Math.abs(pos.x - ea2[0].x) < e ||
			Math.abs(pos.x - ea1[1].x) < e)
	) {
		return;
	}

	main_leaf.rotation.set(0, 0, 0);
	// main_leaf.rotateX(-Math.PI/2)
	if (scatter) {
		for (let i = 0; i < 5; i++) {
			let r1 = THREE.MathUtils.randFloat(rad * 0.8, rad * 1.5);
			let h_t = THREE.MathUtils.randFloat(height * 0.8, height * 1.5);

			let q1 = Math.random() > 0.5 ? 1 : -1;
			let q2 = Math.random() > 0.5 ? 1 : -1;
			let q3 = Math.random() > 0.5 ? 1 : -1;

			let x = THREE.MathUtils.randFloat(d / 2, d * 0.8) * q1 * 0.5;
			let y = 0.01;
			let z = THREE.MathUtils.randFloat(d / 2, d * 0.8) * q3 * 0.5;
			// main_leaf.rotateX(-Math.PI/2)
			main_leaf.rotateY(Math.random() * Math.PI * 2);
			// main_leaf.rotateZ(Math.random()*Math.PI*2)

			// scene.add(leaf)
			main_leaf.position.set(pos.x, pos.y, pos.z);
			main_leaf.position.x += x;
			main_leaf.position.y += y;
			main_leaf.position.z += z;

			// main_leaf.getWorldPosition(world_pos)
			// main_leaf.getWorldQuaternion(world_quat)

			if (col_grp) {
				if (fm) {
					col1 = mc_arr[0][color][THREE.MathUtils.randInt(0, 1)];
				} else {
					col1 = get_color_b(color);
				}
			} else {
				col1 = color;
			}

			add_container(
				main_leaf,
				"cone_scat",
				"cone_scat",
				r1 * 0.05,
				h_t * 0.05,
				0,
				world_pos,
				world_quat,
				col1,
				1,
				y_objs
			);
		}
	}
}
export { get_tree };

//^^
function get_water_con(pos, y_s, scl, look = null) {
	let t_col2 =
		window_cols[Math.floor((window_cols.length - 0.01) * Math.random())];
	let op_scl = 1 / scl;
	let col1 = "#ff0000"; // correct * by heights
	main_water_con.position.set(pos.x, y_s, pos.z);
	main_water_con.scale.multiplyScalar(scl);
	main_water_con.rotateY(Math.random() * Math.PI * 2);

	let arr = main_water_con.children;

	for (let i = 0; i < arr.length; i++) {
		if (i == arr.length - 2) continue;

		let mesh = arr[i];
		mesh.getWorldPosition(world_pos);
		mesh.getWorldQuaternion(world_quat);
		let p = mesh.geometry.parameters;
		let r = p.radiusBottom;
		let h = p.height;
		//// -- instancing

		//pos,quad,color
		mesh_containers["cylinder"][0].push([
			"col",
			r * scl,
			h * scl,
			world_pos.x,
			world_pos.y,
			world_pos.z,
			world_quat.x,
			world_quat.y,
			world_quat.z,
			world_quat.w,
			t_col2,
		]);
	}

	// let col2 =  get_color_b(c_cars1)
	let col2 =
		window_cols[Math.floor((window_cols.length - 0.01) * Math.random())];

	// /// last item cone
	let mesh = arr[arr.length - 2];
	mesh.getWorldPosition(world_pos);
	mesh.getWorldQuaternion(world_quat);
	let p = mesh.geometry.parameters;
	let r = p.radius;
	let h = p.height;
	//// -- instancing

	mesh_containers["cone_r"][0].push([
		"cone",
		r * scl,
		h * scl, // check
		world_pos.x,
		world_pos.y,
		world_pos.z,
		world_quat.x,
		world_quat.y,
		world_quat.z,
		world_quat.w,
		col2,
	]);

	/// reset
	main_water_con.scale.multiplyScalar(op_scl);
	main_water_con.rotation.set(0, 0, 0);
}

//init_water_con
function init_water_con() {
	let col1 = get_color_b(1);
	let col2 = get_color_b(1);

	let rad = 1;
	let d = 5;
	let alpha = 1;
	let h1 = (d - 1) * alpha;
	/// 1
	// //body

	const geometry = new THREE.CylinderGeometry(rad, 1.0, 2, 8, 1, false);
	const m2 = new main_matetrial({ color: col1, side: THREE.DoubleSide });
	const cylinder = new THREE.Mesh(geometry, m2);
	cylinder.position.y += 1 + h1;
	cylinder.rotateY(-Math.PI / 4);

	cylinder.castShadow = true;
	cylinder.receiveShadow = true;

	const g2 = new THREE.ConeGeometry(rad * 1.2, 1, 8);
	const material = new main_matetrial({ color: col2 });
	const cone = new THREE.Mesh(g2, material);
	cone.position.y += 2.5 + h1;

	let scl = 1;
	let change = 0.9;
	let pos = new THREE.Vector3();

	let parts = get_tower(pos, scl, 0, rad * 1.5, alpha, d, 4, 1, change);

	parts.add(cone);
	parts.add(cylinder);

	return parts;
}

export { get_water_con };

function get_vent(pos, y_s, scl, look = null) {
	let vent = main_vent_hole;
	let reset = 1 / scl;
	vent.scale.multiplyScalar(scl);
	vent.position.set(pos.x, 0, pos.z);

	if (look !== null) vent.lookAt(look); // floor == 0 == rotateY

	vent.position.y = pos.y + y_s;

	//same not as floor
	let t_col1 =
		window_cols[Math.floor((window_cols.length - 0.01) * Math.random())];
	let t_col2 =
		window_cols[Math.floor((window_cols.length - 0.01) * Math.random())];
	let t_col3 =
		window_cols[Math.floor((window_cols.length - 0.01) * Math.random())];

	let hole = vent.children[0];
	let p1 = vent.children[1];
	let p2 = vent.children[2];
	let bt = vent.children[3];

	hole.getWorldPosition(world_pos);
	hole.getWorldQuaternion(world_quat);

	//    //// -- instancing
	// //    mesh_containers['box'][0].push(mesh)
	mesh_containers["vent_hole"][0].push([
		"vent_hole",
		world_pos.x,
		world_pos.y,
		world_pos.z,
		world_quat.x,
		world_quat.y,
		world_quat.z,
		world_quat.w,
		0xffffff,
		scl,
	]);

	add_container(
		bt,
		"plane",
		"plane",
		1.4,
		1.4,
		0,
		world_pos,
		world_quat,
		t_col1,
		scl
	);

	let r = Math.random() * Math.PI * 2;
	vent.rotateY(r);

	add_container(
		p1,
		"plane",
		"plane",
		0.2,
		1.2,
		0,
		world_pos,
		world_quat,
		t_col2,
		scl
	);

	add_container(
		p2,
		"plane",
		"plane",
		0.2,
		1.2,
		0,
		world_pos,
		world_quat,
		t_col3,
		scl
	);

	vent.rotation.set(0, 0, 0);
	vent.scale.multiplyScalar(reset);
}

/// anttena/ tower / ifel
function rec(
	temp,
	rad,
	y_s = 0,
	alpha = 2,
	d = 5,
	sides = 15,
	line_segs = 3,
	change = 0.9,
	flag_change = 0,
	center = new THREE.Vector3(),
	grid_line = null
) {
	//temp,radius,alpha,depth,sides,line_segs)

	if (d == 0) {
		return;
	}
	const curve = new THREE.EllipseCurve(
		center.x,
		-center.z,

		rad,
		rad,
		0,
		2 * Math.PI,
		false,
		0
	);

	const points = curve.getPoints(sides);

	// console.log("points=",points)
	const geometry = new THREE.BufferGeometry().setFromPoints(points);

	const m2 = new THREE.LineBasicMaterial({ color: 0x00ff00 });

	//////Create the final object to add to the scene
	const ellipse = new THREE.Line(geometry, m2);
	ellipse.rotateX(-Math.PI / 2);

	ellipse.position.y = y_s;
	// scene.add(ellipse) //  -- check circle path floors

	ellipse.updateMatrixWorld();
	let pos = ellipse.geometry.attributes.position.array;

	//UPDATE WORLD POS + 3D VECTORS
	let arr = [];
	for (let i = 0; i < pos.length; i += 3) {
		let v1 = new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2]);
		ellipse.localToWorld(v1);

		arr.push(v1);
	}

	// add lines to map

	let new_arr = [];
	// SPLIT INSIDE
	for (let i = 0; i < arr.length; i++) {
		let line = new THREE.LineCurve3(arr[i], arr[(i + 1) % arr.length]);

		let res = line.getSpacedPoints(line_segs);
		new_arr.push(...res);

		if (grid_line !== null) {
			let temp = extend_line(arr[i], arr[(i + 1) % arr.length]);
			// draw_line(scene,temp[0],temp[1],true)

			grid_line[0].push(temp);
			grid_line[1].push(2);
		}
	}

	temp.push(new_arr);

	if (!first_time) {
	}
	// scene.add(ellipse) //  -- check circle path floors

	// rec(temp,rad*0.7,y_s + alpha,alpha*1.1,d-1)

	if (flag_change == 0) {
		rec(
			temp,
			rad * change,
			y_s + alpha,
			alpha,
			d - 1,
			sides,
			line_segs,
			change,
			flag_change,
			center,
			grid_line
		);
	}
	if (flag_change == 1) {
		rec(
			temp,
			rad + change,
			y_s,
			alpha,
			d - 1,
			sides,
			line_segs,
			change,
			flag_change,
			center,
			grid_line
		);
	}
}

// rad,
// y_s = 0,
// alpha = 2
// ,d = 5,
// sides = 15,
// line_segs = 3,
// change = 0.9,
// enter = new THREE.Vector3(),
// grid_line = null

export { rec };

function get_tower(
	pos,
	scl = 1,
	y_s = 0,
	radius = 5,
	alpha = 3,
	depth = 15,
	sides = 3,
	line_segs = 5,
	change = 1
) {
	let anchor = pos;
	let a = 0.01;
	let temp = [];

	let parts = new THREE.Group();

	rec(temp, radius, 0, alpha, depth, sides, line_segs, change);

	// console.log("temp=",temp)

	let h, h2, h3;
	let s = 4;
	let col = 0xff0000;

	let flag = false; // color floor control
	for (let i = 0; i < temp.length - 1; i++) {
		flag = s % 4 == 0 ? !flag : flag;

		col = flag ? 0xff0000 : 0xffffff;
		const material = new THREE.MeshPhongMaterial({ color: col }); // col l->r
		const material2 = new THREE.MeshPhongMaterial({ color: col }); // col r->l
		const material3 = new THREE.MeshPhongMaterial({ color: col }); // striaght floor
		for (let j = 0; j < temp[0].length; j++) {
			let v1 = temp[i][j];
			let v2 = temp[i + 1][(j + 1) % temp[0].length];

			let t1 = temp[i][(j + 1) % temp[0].length];
			let t2 = temp[i + 1][j];

			let h = v1.distanceTo(v2);
			let h2 = t1.distanceTo(t2);

			let pos = new THREE.Vector3().lerpVectors(v1, v2, 0.5);
			const geometry = new THREE.CylinderGeometry(1 * a, 1 * a, h, 4);
			// const material = new THREE.MeshPhongMaterial( {color: 0xff0000} );
			const cylinder = new THREE.Mesh(geometry, material);
			cylinder.position.copy(pos);
			cylinder.lookAt(v2);
			cylinder.rotateX(-Math.PI / 2);

			let pos2 = new THREE.Vector3().lerpVectors(t1, t2, 0.5);
			const geometry2 = new THREE.CylinderGeometry(1 * a, 1 * a, h2, 4);
			// const material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
			const cylinder2 = new THREE.Mesh(geometry2, material2);
			cylinder2.position.copy(pos2);
			cylinder2.lookAt(t2);
			cylinder2.rotateX(-Math.PI / 2);

			cylinder.castShadow = true;
			cylinder.receiveShadow = true;
			cylinder2.castShadow = true;
			cylinder2.receiveShadow = true;

			/// striaght line cols

			let mid = new THREE.Vector3().lerpVectors(v2, t2, 0.5);
			h3 = t2.distanceTo(v2);
			const geometry3 = new THREE.CylinderGeometry(1 * a, 1 * a, h3, 4);
			const cylinder3 = new THREE.Mesh(geometry3, material3);
			cylinder3.position.copy(mid);
			cylinder3.lookAt(t2);
			cylinder3.rotateX(-Math.PI / 2);

			cylinder3.castShadow = true;
			cylinder3.receiveShadow = true;

			parts.add(cylinder);
			parts.add(cylinder2);
			parts.add(cylinder3);
		}
	}

	parts.position.set(anchor.x, y_s, anchor.z);

	return parts;
}

// simple box randomize
function get_rect(pos, y_s, w, h, d, look = null) {
	let ang = Math.PI * 2;

	// or angs of walls around
	let arr = [ang * 0.75, ang * 0.5, ang * 0.25];

	for (let i = 0; i < 1; i++) {
		let col =
			window_cols[Math.floor((window_cols.length - 0.01) * Math.random())];
		let r1 = THREE.MathUtils.randFloat(-w, w);
		let r2 = THREE.MathUtils.randFloat(-d, d);
		let h1 = h * Math.floor(THREE.MathUtils.randFloat(1, 4));

		if (Math.random() < 0.5) {
			w = d;
		}

		main_box.position.set(pos.x, y_s + h1 / 2, pos.z);

		main_box.rotateY(arr[Math.floor(Math.random() * (arr.length - 0.01))]);

		main_box.position.x += r1;
		main_box.position.z += r2;

		// parts.add(rect)

		if (look !== null) main_box.lookAt(look); // check

		main_box.getWorldPosition(world_pos);
		main_box.getWorldQuaternion(world_quat);

		mesh_containers["box"][0].push([
			"box",
			w,
			h1,
			d,
			world_pos.x,
			world_pos.y,
			world_pos.z,
			world_quat.x,
			world_quat.y,
			world_quat.z,
			world_quat.w,
			col,
		]);
	}
}

export { get_rect };

export { get_vent, get_tower };
