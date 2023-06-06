import * as THREE from "three";
// import * as THREE from "https://cdn.skypack.dev/three@0.136.0";

import {
	get_color_b,
	main_matetrial,
	outer_90,
	flag_windows,
} from "./a_tools.js";
import { camera_pos, mesh_containers, add_container } from "./a_tools.js";
import { window_cols } from "./color_art.js";
import { get_sphere } from "./graph.js";

let main_plain = null;
let main_box = null;
let world_pos = new THREE.Vector3();
let world_quat = new THREE.Quaternion();

let vec1 = new THREE.Vector3();
let vec2 = new THREE.Vector3();

let vec3 = new THREE.Vector3();
let vec4 = new THREE.Vector3();

var dir_hor = new THREE.Vector3();
var dir_ver = new THREE.Vector3(0, 1, 0); // y

class Building {
	constructor(type, scene) {
		this.type = type;
		this.last_lvl_thickness = 0;
		this.scene = scene;

		let main_mat = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			side: THREE.DoubleSide,
		});
		/// SET SAME OBJ
		let plain_g = new THREE.PlaneGeometry(1, 1); // TEMP FOR ALL PLANES
		main_plain = new THREE.Mesh(plain_g, main_mat);
		let box_g = new THREE.BoxGeometry(1, 1, 1); // TEMP FOR ALL BOX
		main_box = new THREE.Mesh(box_g, main_mat);
	}

	get_generic_wall(v1, v2, y_s, h, start_lvl, flr, mat = null) {
		if (h == 0) return;

		let d = v1.distanceTo(v2);

		vec4.lerpVectors(v1, v2, 0.5);

		let x = v1.x - v2.x;
		let z = v1.z - v2.z;
		let ang = Math.atan2(x, z); // ang between v1,v2

		mat = mat === null ? 0xffffff : mat;
		main_plain.rotation.y = -Math.PI / 2 + ang;

		//start_lvl,flr
		let flag_start = false;
		if (y_s == 0) {
			y_s = start_lvl;
			h = h - start_lvl;
			flag_start = true;
		}

		//* latter

		//plane info
		//d,h,pos,quad,color
		mesh_containers["plane"][0].push([
			"plane",
			d,
			h,
			vec4.x,
			h / 2 + y_s,
			vec4.z,

			main_plain.quaternion.x,
			main_plain.quaternion.y,
			main_plain.quaternion.z,
			main_plain.quaternion.w,
			mat,
			1,
		]);

		// ops
		//1 extrude inside, map vertex get cycles

		mat = get_color_b(3);
		if (flag_start) {
			mesh_containers["plane"][0].push([
				"plane",
				d,
				start_lvl,
				vec4.x,
				start_lvl / 2,
				vec4.z,
				main_plain.quaternion.x,
				main_plain.quaternion.y,
				main_plain.quaternion.z,
				main_plain.quaternion.w,
				mat,
				1,
			]);
		}

		/// reset rotation main plain *
		main_plain.rotation.set(0, 0, 0);
	}

	// building by arr vectors
	// 1 wall only
	building_arr_vector2(
		arr,
		al,
		height = null,
		y_s = 0,
		type = 2,
		color = 0xffffff,
		start_lvl = 1,
		flr = 1,
		fv,
		fh
	) {
		let v1 = arr[0];
		let v2 = arr[1];

		vec1.lerpVectors(v1, v2, 0.5);

		// --- angle filter
		// -- dir of plane
		var dir1 = new THREE.Vector3().subVectors(v2, v1).normalize();
		// rotate 90 degrees of direction of middle point, for moving coloumns little bit. ( == normal to wall)
		var mx = new THREE.Matrix4().lookAt(
			dir1,
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 1, 0)
		);
		var qt = new THREE.Quaternion().setFromRotationMatrix(mx);
		const vector = new THREE.Vector3(1, 0, 0);
		vector.applyQuaternion(qt);

		// -- dir of plane --> camera
		var dir2 = new THREE.Vector3().subVectors(camera_pos, vec1).normalize();

		// create only if wall is side of camera
		let flag_ang = true;
		if (vector.dot(dir2) < 0) {
			flag_ang = false;
		}

		let h = height;

		let extrude = 0; // stick wall

		if (flag_ang) {
			let v1 = arr[0];
			let v2 = arr[1];

			extrude = 2 * al; // 0 == stick to wall

			vec1.set(v1.x, v1.y, v1.z);
			vec2.set(v1.x, v1.y + h, v1.z);
			vec3.set(v2.x, v2.y + h, v2.z);
			vec4.set(v2.x, v2.y, v2.z);

			if (flag_windows) {
				this.window_grid2(
					vec1,
					vec2,
					vec3,
					vec4,

					extrude * 1,

					y_s,
					start_lvl,
					flr,
					fv,
					fh
				);
			}
		}

		this.get_generic_wall(v1, v2, y_s, h, start_lvl, flr, color);
	}

	// a== dl, b == ul, c == ur, d == dr
	window_grid2(
		a,
		b,
		c,
		d,
		extrude,
		y_s,
		start_lvl,
		flr,
		fv,
		fh,
		w_h = null,
		w_v = null
	) {
		dir_hor.subVectors(c, b).normalize(); // for vertical direction,get dir of 2 cols dir | < ---- | (hor)
		dir_ver.set(0, 1, 0);
		let v_dirlook = new THREE.Vector3().copy(d);

		let dist_ver = a.distanceTo(b); // dl-->ul
		let dist_hor = b.distanceTo(c); // ul-->ur

		// window size_ver = size_hor = 0.1
		w_h = w_h == null ? flr * 0.2 : w_h;
		w_v = w_v == null ? flr * 0.5 : w_v;

		if (dist_hor < w_h || dist_ver < w_v) {
			return;
		} // window > wall --> exit.

		let n_ver_cols_f = dist_hor / (w_h * 2);
		let remainder = n_ver_cols_f % 1;
		let temp = n_ver_cols_f - remainder;

		let n_ver_cols = Math.floor(temp);
		let n_hor_cols = Math.floor(dist_ver / (flr * 1));

		let y_e = b.y + y_s; // roof floor

		if (n_ver_cols == 0 || n_hor_cols == 0) {
			return;
		}

		extrude = 0.1;
		vec3.set(0, 0, 0);
		outer_90(dir_hor, vec3, extrude);

		let line1 = new THREE.LineCurve3(a, d);
		let get_points = line1.getSpacedPoints(n_ver_cols * 2);

		// get_points.forEach(v=>{
		//     get_sphere(v.x,v.y,v.z,0xff0000,5)
		// })

		let y_down = new THREE.Vector3(0, start_lvl, 0);
		let y_up = new THREE.Vector3(0, y_e, 0);

		let left = new THREE.Vector3(a.x, 0, a.z);
		let right = new THREE.Vector3(d.x, 0, d.z);

		let temp_h = new THREE.Vector3(0, 0, 0).add(
			dir_hor.clone().multiplyScalar(w_h * 0.5)
		); //w_h*0.5
		let temp_half = temp_h.clone().divideScalar(2);
		let temp_v = new THREE.Vector3(0, 0, 0).add(
			dir_ver.clone().multiplyScalar(w_v * 0.5)
		); //w_v*0.5
		let temp_mh = new THREE.Vector3(0, 0, 0);

		let ht = y_e - y_s;
		let s1 = y_s + b.y / 2;

		let vc = v_dirlook.clone();
		if (fv) {
			vc.y = s1;
			main_plain.rotation.set(0, 0, 0);
			main_box.rotation.set(0, 0, 0);
			// get_sphere(v_dirlook.x,v_dirlook.y,v_dirlook.z,0xff0000,2)
			// console.log("ht=",ht)

			let vect = new THREE.Vector3();
			let dir1 = vec1
				.clone()
				.subVectors(get_points[1], get_points[0])
				.normalize()
				.multiplyScalar(w_h / 2);
			let dir2 = dir1.clone().multiplyScalar(-1);
			for (let j = 1; j < get_points.length - 1; j += 1) {
				if (j % 4 == 1) {
					//2

					vect.set(get_points[j].x, s1, get_points[j].z);

					main_plain.position.set(get_points[j].x, s1, get_points[j].z);
					main_plain.lookAt(vc);
					main_plain.rotateY(Math.PI / 2);

					main_plain.getWorldPosition(world_pos);
					world_pos.add(vec3); // extrude vec3

					main_plain.getWorldQuaternion(world_quat);

					mesh_containers["win"][0].push([
						"win",
						w_h,
						ht, //w_v,
						// w_h,w_v, //w_v,
						world_pos.x,
						world_pos.y,
						world_pos.z,
						world_quat.x,
						world_quat.y,
						world_quat.z,
						world_quat.w,
						0xffffff,
						1,
					]);

					main_plain.rotation.set(0, 0, 0);

					for (let z = 0; z < 2; z++) {
						let t1 = vect.clone().add(z == 0 ? dir1 : dir2);

						main_box.position.set(t1.x, t1.y, t1.z);
						main_box.lookAt(vc);
						main_box.rotateY(Math.PI / 2);

						main_box.getWorldPosition(world_pos);
						world_pos.add(vec3); // extrude vec3

						main_box.getWorldQuaternion(world_quat);

						add_container(
							main_box,
							"win_box",
							"win_box",
							0.05,
							ht,
							0.05,
							world_pos,
							world_quat,
							0x000000
						);

						// mesh_containers['box'][0].push([
						//     'box',
						//     0.05,ht,0.05, //w_v,
						//     // w_h,w_v, //w_v,
						//     world_pos.x,world_pos.y,world_pos.z,
						//     world_quat.x,
						//     world_quat.y,
						//     world_quat.z,
						//     world_quat.w,
						//     0x000000])

						main_box.rotation.set(0, 0, 0);
					}
				}
			}

			return;
		}

		w_v = fv ? w_v * 2 : w_v;
		w_h = fh ? w_h * 2 : w_h;

		let flag_large = fv || fh;

		for (let i = y_e - flr / 2; i > 0; i -= flr) {
			// by dist // each loop, go down from (up to down)

			if (i < y_s + flr / 2 || i < start_lvl + flr / 2) {
				break;
			}

			//&&&&
			for (let j = 1; j < get_points.length - 1; j += 1) {
				// if(Math.random()<0.1)continue

				let col =
					window_cols[Math.floor((window_cols.length - 0.01) * Math.random())];
				let mid = get_points[j];
				let prev = get_points[j - 1];

				// cols up down
				y_down.x = y_up.x = prev.x + w_h;
				y_down.z = y_up.z = prev.z;

				// cols left right
				left.y = right.y = i + flr / 2;

				if (fh && j % 2 == 0) {
					continue;
				}
				if (fv && i % 2 == 0) {
					continue;
				}

				let c = fv ? 0xffffff : col;

				v_dirlook.y = i;
				main_plain.position.set(mid.x, i, mid.z);
				main_plain.lookAt(v_dirlook);
				main_plain.rotateY(Math.PI / 2);

				temp_mh.set(mid.x, i, mid.z);

				main_plain.getWorldPosition(world_pos);
				world_pos.add(vec3); // extrude vec3

				main_plain.getWorldQuaternion(world_quat);

				let temp = 0;

				if ((!fv && j % 2 == 1) || (fv && j % 4 == 1)) {
					mesh_containers["win"][0].push([
						"win",
						w_h,
						w_v - temp, //w_v,
						// w_h,w_v, //w_v,
						world_pos.x,
						world_pos.y - temp / 2,
						world_pos.z,
						world_quat.x,
						world_quat.y,
						world_quat.z,
						world_quat.w,
						c,
						1,
					]);
				}

				main_plain.rotation.set(0, 0, 0);

				if (1) {
					if (!flag_large && j % 2 == 0) {
						continue;
					}
					if (fv && j % 2 == 0) {
						continue;
					}
					if (fh && i % 2 == 0) {
						continue;
					}

					let ll = new THREE.Vector3(
						temp_mh.x + temp_h.x,
						temp_mh.y + temp_h.y,
						temp_mh.z + temp_h.z
					).add(vec3);
					let uu = new THREE.Vector3(
						temp_mh.x + temp_v.x,
						temp_mh.y + temp_v.y,
						temp_mh.z + temp_v.z
					).add(vec3);
					let rr = new THREE.Vector3(
						temp_mh.x - temp_h.x,
						temp_mh.y - temp_h.y,
						temp_mh.z - temp_h.z
					).add(vec3);
					let dd = new THREE.Vector3(
						temp_mh.x - temp_v.x,
						temp_mh.y - temp_v.y,
						temp_mh.z - temp_v.z
					).add(vec3);

					let dl = new THREE.Vector3(
						temp_mh.x + temp_h.x,
						temp_mh.y - temp_h.y - temp_v.y,
						temp_mh.z + temp_h.z
					).add(vec3);
					let ul = new THREE.Vector3(
						temp_mh.x + temp_h.x,
						temp_mh.y + temp_h.y + temp_v.y,
						temp_mh.z + temp_h.z
					).add(vec3);
					let ur = new THREE.Vector3(
						temp_mh.x - temp_h.x,
						temp_mh.y + temp_h.y + temp_v.y,
						temp_mh.z - temp_h.z
					).add(vec3);
					let dr = new THREE.Vector3(
						temp_mh.x - temp_h.x,
						temp_mh.y - temp_h.y - temp_v.y,
						temp_mh.z - temp_h.z
					).add(vec3);

					let be = 0.0;
					if (!fh) {
						draw_tube2(dl, ul, w_v, ll, be);
						draw_tube2(ul, ur, w_h, uu, be);
						draw_tube2(ur, dr, w_v, rr, be);
						draw_tube2(dr, dl, w_h, dd, be);
					}

					//  if(fv && j%4==1){

					//                 draw_tube2(dl,ul,w_v,ll,be) //0.02
					//                 draw_tube2(ur,dr,w_v,rr,be)
					//             }

					if (fh) {
						draw_tube2(dl, ul, w_v, ll.be);
						draw_tube2(ul, ur, w_h, uu, be);
						draw_tube2(ur, dr, w_v, rr, be);
						draw_tube2(dr, dl, w_h, dd.be);

						// ll.sub(temp_half)
						// draw_tube2(rr,rr,w_h*1,ll)
					}
				}
			} // loop 2
		} // loop 1
	}
} // class

export { Building };

// ** repeating
//  FLAT SHAPE FOR TOP BUILDINGS
function custom(arr_vec, y, scene, mat = 0xffffff) {
	var coordinatesList = []; //shape 2d
	arr_vec.forEach((i) => {
		coordinatesList.push(new THREE.Vector2(i.x, i.z));
	});

	// shape
	var geomShape = new THREE.ShapeGeometry(new THREE.Shape(coordinatesList));
	var matShape = new main_matetrial({ color: mat, side: THREE.BackSide });

	var shape = new THREE.Mesh(geomShape, matShape);

	shape.receiveShadow = true;
	shape.castShadow = true;
	shape.geometry.computeVertexNormals();
	shape.rotation.x = Math.PI / 2;
	shape.position.y = y;

	scene.add(shape);
}

export { custom };

// y_temp add temp
// //v1,v2,d,vec_mid,0.00,
function draw_tube2(v1, v2, d = null, achor = null, b_noise = 0.1) {
	d = d === null ? v1.distanceTo(v2) : d;

	achor = achor == null ? new THREE.Vector3().lerpVectors(v1, v2, 0.5) : achor; //// cal twist *

	main_box.position.set(achor.x, achor.y, achor.z);
	main_box.lookAt(new THREE.Vector3(v1.x, v1.y, v1.z));

	let n = THREE.MathUtils.randFloat(-b_noise, b_noise);
	main_box.rotateY(-Math.PI / 2 + n); // THREE.MathUtils.randFloat(-0.2,0.2)) // + noise

	//main_box.rotateX(-Math.PI/2 + THREE.MathUtils.randFloat(-b_noise,b_noise) )// THREE.MathUtils.randFloat(-0.2,0.2)) // + noise

	add_container(
		main_box,
		"win_box",
		"win_box",
		d,
		0.05,
		0.05,
		world_pos,
		world_quat,
		0x000000
	);

	main_box.rotation.set(0, 0, 0);
}
