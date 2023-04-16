


import * as THREE from 'three';
// import * as THREE from "https://cdn.skypack.dev/three@0.136.0";


import {VehicleGenerator} from './a_vehicles2.js'
import {overcross,get_road,update_class,
	get_cars_road_test,get_road_strips} from './a_roads.js'

import {flag_cars,d3_shape,defualt_y,main_matetrial,draw_line,get_polygon_centroid,
	SimplexNoise,outer_90 ,OffsetContour, get_color_b, n_lines, alp_lines,get_noise_memo,toIndex,
s_v,e_v,s_h,e_h,get_trail_noise2,
pul,pur,pdl,pdr,rad_edges,flag_create,split_vertecs,add_y,add_container,amt_tree} from './a_tools.js'

import {get_water_con,get_vent,objs_scene,
	get_rect,
	get_tree,} from './a_objs.js'

	import {custom} from './a_buildings.js'


	import {	
	
		c_sd1	// F/P
	  
		,c_cars1// F/P
		,c_sd2	// F
		,c_ground // F
	
		,c_cars2 // F
		,c_trails_cars
		,c_trails_p// FP
		
		,
		mc_arr,
		flag_memories,
		arr_colors,
		g_trails_cars,
		g_trails_p,
		dis_kind,
		func_kind,
		g_cars1,
		
		lake_col,
		
		

} from './color_art.js'


let poly_nodes;
let max_val = 100
let scene = null;


let pos_vec = new THREE.Vector3()
let al_car = null; 

let class_car = null
let main_plain = null

let world_pos = new THREE.Vector3();
let world_quat = new THREE.Quaternion();
let park_vertecs = null;


export {class_car}

class G{

	constructor(arr = null,alpha_car = 0.2,arr_lanes = null){


		park_vertecs = [pul,pur,pdl,pdr]
		this.arr = arr
		this.arr_lanes = arr_lanes == null ? new Array(arr.length).fill(0) : arr_lanes; // num lanes of each line
		this.nodes = new Map();
		this.ind_to_vec = new Map();
		this.line_lanes = new Map();
		this.id_parks = new Map()
		this.park_map = {
			ids : new Set(), // 0,1,2,3....
			id_parks_edges:new Map(), // edges of park // update in connecting roads
			props_map:[] // maybe change to map *

		} // park id --> edges
		this.polygons = []

		this.nodes_info = new Map();
		this.co_info = new Map(); // includes nodes_info in arr_roads , // (index --> c.o)
		this.sidewalk_h = alpha_car*0.1

		
	
		this.park_poly = null;
 		

		this.poly_graph = null; 
		this.edge_graph = null; 


		// edge new areas 4 points 
		this.e_lines1 = []
		this.e_lines2 = []

	}

	
////// add park to map

//^^park
 get_parks(){
	// noise
	let simplex = new SimplexNoise()
	let props_map = this.park_map.props_map;

	let np = 33  //44
	let na = 6  //6

	let mid = new THREE.Vector3()
	let w_h,w_v,sign,t1;
	w_v = 0.05




	let all_trails = [] // cars


			let ang1 = Math.PI
			let ang2 = 0

	
			props_map.forEach(park=>{

				// find corners:    
				let xmax = -100000
				let zmax = -100000
				let xmin = 100000
				let zmin = 100000
		
		
				let park_edges = this.park_map.id_parks_edges.get(park[5])
				
	

				park_edges.forEach(e=>{

	
					let adj_polys = this.edge_graph.get(e).adj_polys;

					for(let ad = 0;ad<adj_polys.length;ad++){
						let item = this.poly_graph.get(adj_polys[ad])
					

						if(item.kind===1){
							// console.log("item.new_area===",item.new_area)
							item.new_area.forEach(temp=>{
								
								
								xmax = Math.max(xmax,temp.x)
								zmax = Math.max(zmax,temp.z)
								xmin = Math.min(xmin,temp.x)
								zmin = Math.min(zmin,temp.z)

				
								

							

							})

						}
					}

		

				})
		

			
				let rect_arr = [
					xmax, 
					zmax,
					xmin,
					zmin 
				]





	



	
				let dir = new THREE.Vector3().subVectors(park[1],park[0]).normalize()
				let wid = park[3]*0.5
				let col = 0xffffff

	
				let memo = []
				let memo_cars = []
		


				let rect_arr_poly = [
					new THREE.Vector3(xmin,0,zmin), 
					new THREE.Vector3(xmin,0,zmax), 
					new THREE.Vector3(xmax,0,zmax), 
					new THREE.Vector3(xmax,0,zmin), 
				]


				// rect_arr_poly.forEach(v=>{
				// 	get_sphere(v.x*0.93,v.y,v.z*0.93,0x00ff00,2)
				// })

				this.park_poly = rect_arr_poly

				let points_temp = []






				// 2 ordered + random
						//^^POINTS
						let div_x = 6 // 6
						let div_z = 2 //2
						 np = 55  //44
						 na = 6  //6

						 let amt_p  = 30 //30
						 let amt_car = 14 // 14

						let step_q = (xmax-xmin)/div_x
						let step_z = (zmax-zmin)/div_z

					
					
						/// ----- ordered disterbution points
						for(let q=xmin+step_q/2;q<xmax-1;q+=step_q){
							
						
							for(let z=zmin+step_z/2;z<zmax-1;z+=step_z){
								if(Math.random()<0.1)continue;
								
							
								points_temp.push(new THREE.Vector3(q,0,z))
								// get_sphere(q,0,z,0x00ff00,1)
							}
							
						}

					

						let pt1 = park[0].clone()
						let pt2 = park[1].clone()

						pt1.x*=0.90
						pt2.x*=0.90

						// get_sphere(pt1.x,pt1.y,pt1.z,0x00ff00,1)
						// get_sphere(pt2.x,pt2.y,pt2.z,0x00ff00,1)
						/// random disterbution points
						// ---- loop trails/roads
						for(let i=0;i<amt_car;i++){ //14 
							sign = i<amt_car/2 ? 1:-1; 
							t1 = new THREE.Vector3().lerpVectors(pt1,pt2,Math.random()) 
						
						   outer_90(dir,t1,wid*sign*Math.random())
				

						   points_temp.push(t1)
						//    get_sphere(t1.x,t1.y,t1.z,0x00ff00,1)
					   }


				// console.log("rect_arr_poly===",rect_arr_poly)
		

				let arr_border = []
				for(let q = 0;q<rect_arr_poly.length;q++){
		
					let v1 = rect_arr_poly[q]
					let v2 = rect_arr_poly[(q+1)%rect_arr_poly.length]
				
					let temp = new THREE.LineCurve3(v1,v2).getSpacedPoints(300) //200
		
					arr_border.push(...temp)
			
				}

				memo.push(...arr_border)
				all_trails.push(...arr_border)

		
				// arr_border.forEach(v=>{
				// 	get_sphere(v.x,v.y,v.z,0xff0000,0.5)
				// })


				
				let edges_newa = []
				for(let w=0;w<4;w++){
				
					
					if(this.e_lines1[w].distanceTo(this.e_lines2[w])>2){
						let temp = new THREE.LineCurve3(this.e_lines1[w],this.e_lines2[w]).getSpacedPoints(15)
						edges_newa.push(...temp)
						// // console.log("temp=",temp)
						// temp.forEach(v=>{
						// 	get_sphere(v.x,v.y,v.z,0xff0000,0.3)
						// })
					}
				}

			

				all_trails.push(...edges_newa)
				memo.push(...edges_newa)


				arr_border.push(...edges_newa) // *


				let y_t = 0.1 //0.01



				////////////////////////

				
				//^^loop
				/////// POELPE TRAILS
				// let memo2 = [...arr_border]


				for(let i=0;i<amt_p;i++){

					sign = Math.random()<0.5 ? 1:-1;	
				

					t1 = new THREE.Vector3().lerpVectors(park[0],park[1],Math.random()) //Math.random()
				   outer_90(dir,t1,wid*sign*Math.random()) //(i/32)*1

					let t2 = t1.clone()

				
					let res = get_trail_noise2(scene,t1,t2,ang1,ang2,arr_border,simplex,np,na) // 55,7




					// result = get_noise_memo(t1,ang1,memo2,simplex,scene,55,7,true)
					// result2 = get_noise_memo(t2,ang2,memo2,simplex,scene,55,7)

					// memo.push(...result)
					// memo.push(...result2)

									// road or trails
				
				// for(let k=0;k<2;k++){
					// let res = k==0 ? result : result2;

					
					if(res.length==0){continue;} 
					// let y_t2 = THREE.MathUtils.randFloat(0.01,0.03)
				for(let k=0;k<res.length-1;k++){
						col = g_trails_p ?  get_color_b(c_trails_p) : c_trails_p
						w_h = res[k+1].distanceTo(res[k])
						mid.lerpVectors(res[k+1],res[k],0.5)
						main_plain.position.set(mid.x,mid.y,mid.z)
						main_plain.lookAt(res[k+1])
					
						main_plain.rotateY(Math.PI/2)
						main_plain.rotateX(-Math.PI/2)

		
							
					
						add_container(main_plain,'plane','plane',     w_h*1,w_v*10,0,world_pos,world_quat,col,1,y_t)

			
						


					}
			// }
			y_t+=0.003
		}




		// console.log("y_t= poeple == ",y_t) // 0.5




				/////////////////
				points_temp.forEach(vec=>{
					
				
					
					let t1 = vec.clone()
					

					let t2 = t1.clone()
				

					let res1


					res1 = get_trail_noise2(scene,t1,t2,ang1,ang2,arr_border,simplex,np,na) // remove helper scene latter *
					 all_trails.push(...res1)
					 memo.push(...res1)
					
		
		

					let color = THREE.MathUtils.randInt(9,9)
					
					let amt = 1 
				
					
					let c10 = new THREE.Color()
					for(let k=0;k<amt;k++){
						let res = res1 
					
						
						if(res.length==0){continue;} 




						let trail_cars = 1
						let num_lanes = THREE.MathUtils.randInt(1,5)
				
						if(trail_cars){

					
							let segs =  55 
							let len = res.length 

							segs = Math.floor(len/1)
							let g = get_road(res,num_lanes,0.2,0.01,0x000000,111,scene) // 
	
						
						
							// //^^carcol
							for(let num=1;num<num_lanes*2;num+=2){
							
							
								get_cars_road_test(g,num,true,c_cars2,memo_cars,true,) // with memo
							}
	
	
						}

						


						///^^trails
						
							// check if g_trails_cars always true*
							let col = g_trails_cars ? get_color_b(c_trails_cars) : c_trails_cars

							if(g_trails_cars && col === c_ground){

						
								c10.set( col );

								c10.r = THREE.MathUtils.clamp(c10.r + THREE.MathUtils.randFloat(-0.1,0.1),0,1)
								c10.g = THREE.MathUtils.clamp(c10.g + THREE.MathUtils.randFloat(-0.1,0.1),0,1)
								c10.b = THREE.MathUtils.clamp(c10.b + THREE.MathUtils.randFloat(-0.1,0.1),0,1)
								col = c10
							
							}
							for(let k=0;k<res.length-1;k++){ 


										
											w_h = res[k+1].distanceTo(res[k])
											mid.lerpVectors(res[k+1],res[k],0.5)
											main_plain.position.set(mid.x,mid.y,mid.z)
											main_plain.lookAt(res[k+1])
											main_plain.position.y+=0.02 
											main_plain.rotateY(Math.PI/2)
											main_plain.rotateX(-Math.PI/2)
						

											add_container(main_plain,'plane','plane',     w_h*1,w_v*num_lanes*10,0,world_pos,world_quat,col,1,y_t)





		

								}
			

								y_t+=0.003
					}

	
				})
				// }// ---- loop trails end

				// console.log("y_t= roadd == ",y_t)


		

		

		








		


	

				///////// ------- lake end


				/// treesss
				if(flag_create){

							
							/////// TESTS SHAPES
							

							// /// ^^trees
							///---- place all park area
							
						

								
							let type = 22;
							if(type==0){
								rectRec(xmax,zmax,xmax,zmin,xmin,zmin,xmin,zmax,scene,true,true,memo)

							}

			

							//// GROUP AREAS SEPERATED BY ROADS (ADD TRAILS * TYPE) 
							let w = 1 // radious

							// grid park
							let grid = []
						

							let nCols = Math.floor((xmax-xmin)/w);
							let nRows = Math.floor((zmax-zmin)/w);

		
							for (let i = 0; i < nRows+1; i++) {
								let newRow = [];
								for (let j = 0; j < nCols+1; j++) {
							
								newRow.push(undefined);
								}
								grid.push(newRow);
							}

					


							let dirs = [[1,0],[-1,0],[0,-1],[0,1]]
							
							all_trails.forEach(v=>{
								let j = Math.floor(v.x/w )+Math.floor(nCols/2)
							
								let i = Math.floor(-v.z/w)+Math.floor(nRows/2)

								if((j > -1 && j<nCols+1) && (i > -1 && i<nRows+1)){
										// console.log(i,j)
										grid[i][j] = 0; /// 0 === borders + trails


										// test around
										// ===== test around
										dirs.forEach(d=>{
											let y = d[0] + i
											let x = d[1] + j
		
									
		
											if(x>=0 && x<=nCols && y>=0 && y<=nRows){
								
												grid[y][x] = 0
										}
		
										})


								}

	

							})


							for (let i = 0; i < nRows+1; i++) {
								for (let j = 0; j < nCols+1; j++) {
									if(i==0 || i== nRows || j == nCols || j ==0){
										grid[i][j] = 0;
									}
								}
							}

							for (let i = 0; i < nRows+1; i++) {
								for (let j = 0; j < nCols+1; j++) {
									if(grid[i][j] == 0){
										// get_sphere(j-Math.floor(nCols/2) ,0.01,-i +Math.floor(nRows/2),0xff0000,0.5)
									}
								}
							}
							

							let map_grps = new Map()
							

						
						

							let cnt = 1 // 1 ==> up == groups

							/// loop grid, if empty, color area
							for (let i = 4; i < nRows-4; i++) {
								for (let j = 4; j < nCols-4; j++) {

									if(grid[i][j]===undefined){

										grid[i][j] = cnt

										let lvl = [[i,j]]
										let col =  Math.random()*0xffffff
										while(lvl.length!=0){
											let res = []
											while(lvl.length!=0){
											

												let item = lvl.pop()
										
												// check 4 directions
												dirs.forEach(d=>{
													let y = d[0] + item[0]
													let x = d[1] + item[1]

											

													if(x>=0 && x<=nCols && y>=0 && y<=nRows && grid[y][x]===undefined){
										
														grid[y][x] = cnt
												

														res.push([y,x])
													}
												})
								
											}
										
											lvl = res

										
											
											
										}

										// throw "s"
										cnt++; // update
									}

								}
							}






						


						

							// map == grp name --> posotions
							// set color grps
						
							let col_map = new Map(); // 1 color
							let noise_col_map = new Map();

							let size_map = new Map();

				
							let al = 0.9 
					

							for (let i = 0; i < grid.length; i++) {
								for (let j = 0; j < grid[0].length; j++) {
									if(grid[i][j]!==undefined && grid[i][j]>=1){ //i!==undefined &&

										let temp = flag_memories ? THREE.MathUtils.randInt(0,mc_arr.length-1) : 0 /// * change latter

									
										if(!map_grps.has( grid[i][j])){
											map_grps.set(grid[i][j],[])
											let r = Math.random()
											let size = 
											// r<0.1 ? [5,5] : [10,10]
										
											// r<0.4 ? [5,5,0] : [15,15,1];

											r<0.2 ? [3,7,0] : 
											r<0.4 ? [5,10,0] : [10,15,1]
											// r<0.6 ? [10,15,1]:
											// [15,20,1] ;
											
											
											
											size[0]*=al
											size[1]*=al
											let c1 =mc_arr[temp][Math.floor((mc_arr[temp].length-0.01)	*Math.random()	)]
									
											col_map.set(grid[i][j],c1)
									
											noise_col_map.set(grid[i][j],temp)
								
											size_map.set(grid[i][j],size)
										}

								
										
										map_grps.get(grid[i][j]).push([i,j])
									




									}
								}
							}

					

					

							




  






							// console.log("map_grps=",map_grps)

							// find max area of spesisfic grp.
							let cnt_max = 0
							let cnt_i = 0
							map_grps.forEach((arr,key)=>{
						
								if(arr.length > cnt_max){
									cnt_max = arr.length
									cnt_i = key;
								}
							})
							


	




				let map_lakes = new Map()
					/// if in same grid area == same col
				//^^lake
				let is_lake = 1
				let lake_arr = []
				for(let q = 0;q<10;q++){
					//let lake_part = []
						if(is_lake){
								let area = get_pos(all_trails,simplex,8,20,np,na)

								if(area===null){
									console.log("area null===",null)
									continue}
								//let lake_arr = []
								let lake_arr_2d = []
								// console.log("area=",area)
								let temp_area = []
								area.forEach(v=>{
									lake_arr_2d.push(new THREE.Vector2(v[0].x,-v[0].z))
									// lake_arr.push(v[0])
									temp_area.push(v[0])
									// get_sphere(v[0].x,v[0].y,v[0].z,0xff0000,2)
								})

								lake_arr.push(temp_area)
								


								// GET AREA GRID
								let vec2 = get_polygon_centroid(lake_arr_2d,false)
								let vec = new THREE.Vector3(vec2.x,0,-vec2.y)
								let x = Math.floor(vec.x)+Math.floor(nCols/2)
								let y = Math.floor(-vec.z)+Math.floor(nRows/2)

								//console.log("grid=",grid)
								if(x<0 || x>=grid[0].length || y<0 || y>=grid.length){continue}
								let temp = grid[y][x];

								let c = get_color_b(lake_col)

								

								if(map_lakes.has(temp)){
									c = map_lakes.get(temp);

									
								}else{
									map_lakes.set(temp,c)
								}


					

								const curve = new THREE.SplineCurve( lake_arr_2d);
					
								const points = curve.getPoints( 155 );
					
								const lake1_shape = new THREE.Shape(points);



							
								const props = {
									steps: 0,
									depth: 0.1, // car side width
									bevelEnabled: false,
								};
						
								let q = new THREE.ExtrudeGeometry( lake1_shape, props );
						
							
						
								
								let m = new main_matetrial( { color: c ,roughness:0,metalness:0} );
								let mesh = new THREE.Mesh( q, m ) ;
								mesh.rotateX(-Math.PI/2) 
								mesh.position.y+=0.25
								mesh.receiveShadow = true
								scene.add(mesh)
					}

		}











				
					

							
							type=1


							//^^start

							if(type==1){
								
								for(let i=0;i<amt_tree;i++){ // treeloop //7000
						
	
	
									//pos_vec
									let tx = THREE.MathUtils.randFloat(rect_arr[2],rect_arr[0])
									let tz = THREE.MathUtils.randFloat(rect_arr[3],rect_arr[1])
									pos_vec.set(tx,0,tz)
	
							
									
									// // while not in large poly or in mon area
									
									let cnt = 0
									let fc = false
								
											while(!(is_point_in_poly(park_edges,pos_vec,true,true,this))){ 
												let tx = THREE.MathUtils.randFloat(rect_arr[2],rect_arr[0])
												let tz = THREE.MathUtils.randFloat(rect_arr[3],rect_arr[1])
												pos_vec.set(tx,0,tz)
											}

											//^^cur
											if(!is_lake){break;}
							
											lake_arr.forEach(arr => {
												if(is_point_in_poly(arr,pos_vec)){
													// get_sphere(pos_vec.x,pos_vec.y,pos_vec.z,0xff0000,2)
													fc = true
												}
											});

								
											let edge_flag = false
											park_vertecs.forEach(v=>{
												if(v.distanceTo(pos_vec)<rad_edges){
													edge_flag = true
													// get_sphere(pos_vec.x,pos_vec.y,pos_vec.z,0xff0000,2)
												}
											})
											
											
											if(fc || edge_flag)continue;

							
									let col = Math.abs(tz-zmax) > Math.abs(tz-zmin) ? 0 : 1
	
								



										
										let x = Math.floor(pos_vec.x)+Math.floor(nCols/2)
										let y = Math.floor(-pos_vec.z)+Math.floor(nRows/2)
										if(x<0 || x>=grid[0].length || y<0 || y>=grid.length){continue}
										let temp = grid[y][x];


										if(temp===0 || temp===undefined){continue}
										let colors = flag_memories ?  mc_arr[noise_col_map.get(temp)] : arr_colors[noise_col_map.get(temp)]	//['#dfd8cf','#1c1c1c'] //['#654d49','#d5ccc3','#9f948c','#c29487','#9c635b','#292423','#b8acac','#601616','#837c7c','#d1b49c']
									
										/// colorsss
										let q1 = (simplex.noise(pos_vec.x / np, -pos_vec.z / np) )* na; // Flow Field
										let w = Math.floor(Math.abs(q1))%colors.length
										
										col = colors[w]//colors[Math.abs(w)];

  										let size_m = size_map.get(temp)
										let s = [size_m[0],size_m[1]]
										//^^kind
										if(func_kind(dis_kind,temp,map_grps)){ 

									/////////=====	==================== topo
							
											let f = true
											for(let a = 0;a<all_trails.length;a++){
													let v = all_trails[a]
													if(v.distanceTo(pos_vec)<1){
														f = false
														// get_sphere(pos_vec.x,pos_vec.y,pos_vec.z,0x00ff00,2)
														break
													}
												}

												if(f){
										

														
														get_tree(pos_vec,col,false,s,85,size_m[2],null,this.e_lines1,this.e_lines2) // 65
													
											
												}
											

										}
										else{

									
							
													let c = col_map.get(temp);
									
													get_tree(pos_vec,c,false,s,85,size_m[2],null,this.e_lines1,this.e_lines2)
												}
												

				
										

								
									}
							
								}

							
				



			}

			

			 

				
	
			})
	

			
		



	
}






// middle points/line of offcounter road - building 
get_sidewalk2(){


	//// 1 perimeter
	this.poly_graph.forEach(info_poly=>{

	
	
		let sidewalk = OffsetContour(info_poly.alpha_off/2,info_poly.new_area,true) ///oof//2


	

		let building_area = OffsetContour(info_poly.alpha_off,info_poly.new_area,true)
	
	
		
		//	--- sidewalk pavement  
		// 0) first middle planes


		let line1 = new THREE.Line3()
		let prev90 = new THREE.Vector3()
		let next90 = new THREE.Vector3()
	

		// !TEMP VALS
		// road line
		let curve_r = new THREE.LineCurve3(
			new THREE.Vector3(0,0,0),
			new THREE.Vector3(0,0,0)
		)



		// // swcolor
		// let col1 = 0xffffff//get_color_b(3)
		// let col2 = 0xffffff // get_color_b(1)

		let col1 = c_sd1 //get_color_b(c_sd1)
		let col2 = c_sd1 //get_color_b(c_sd1)















		// 0)
		// built by plane each v1 v2, new_area border<---(x)--->building area border
		let wid = Math.abs(info_poly.alpha_off)
		for(let i=0;i<building_area.length;i++){
			// throw "shit"

		

		





			/// continue, edges inside park
			if(info_poly.kind===1){ // by poly * change by edge
				let flag_inside = false
				for(let p = 0;p<info_poly.edges.length;p++){
					// console.log("op===",info_poly.edges)
					let e = info_poly.edges[p]

					if(this.edge_graph.get(e).inside_park){
						flag_inside = true
						break;
					}
				} 

				if(flag_inside){continue;}
			}




			let v1 = building_area[i]
			let v2 = building_area[(i+1)%building_area.length]


			let r1 = info_poly.new_area[i]
			let r2 = info_poly.new_area[(i+1)%info_poly.new_area.length]

			let m1 = sidewalk[i]
			let m2 = sidewalk[(i+1)%sidewalk.length]


			let dist = v1.distanceTo(v2)
			let mid = new THREE.Vector3().lerpVectors(m1,m2,0.5)
			
		

		
			
		
			main_plain.position.set(mid.x,mid.y,mid.z)
			main_plain.lookAt(sidewalk[(i+1)%sidewalk.length])
			main_plain.rotateX(-Math.PI/2)

			add_container(main_plain,'plane','plane',    wid,dist,0,world_pos,world_quat,col1,1,0.095)



					
			main_plain.quaternion.set(0,0,0,0)

		


			//// fill holes by triagnles
			line1.start = r1
			line1.end = r2

			// prev
			let point_b1= building_area[i]

			
			line1.closestPointToPoint(point_b1,true,prev90)


			let a1 = point_b1	//inner
			let b1 = line1.start //outer
			let c1 = prev90


			// next
			let point_b2 = building_area[(i+1)%info_poly.new_area.length]
			line1.start = info_poly.new_area[i]
			line1.end = info_poly.new_area[(i+1)%info_poly.new_area.length]
			line1.closestPointToPoint(point_b2,true,next90)

			
			let aa1 = point_b2	//inner // 1--- 3
			let bb1 = line1.end //outer // 2-- 1
			let cc1 = next90 /// 3 -- 2



			// /// *** convert to extrude instances right triangles latter
			custom([a1,b1,c1],0.096,scene,col2)
			custom([aa1,bb1,cc1],0.096,scene,col2)





		} // loop area_b




	
	




	})



}



	// save info graph
	get_verteces(){


					// temp memo n lanes for each vertex for each road
					// (vertex--> vertex --> n lanes == map-->map-->lanes)
				
					// optimizeee
					/// each vertex name (map)--> adj name (map) --> arr info
					let arr = this.nodes_info;

					this.nodes.forEach((adj,key)=>{

							arr.set(key,new Map())

	
						// temp info
						adj.forEach(name=>{

							let v1 = this.ind_to_vec.get(key);
							let v2 = this.ind_to_vec.get(name);

							let v11 = new THREE.Vector2(v1.x,-v1.z);
							let v22 = new THREE.Vector2(v2.x,-v2.z);

							let mid = new THREE.Vector2().lerpVectors(v11,v22,0.5);
							let mid_name = toIndex(mid.x,mid.y);
							let n2 = this.line_lanes.get(mid_name)
					
							
							arr.get(key).set(name,[al_car*1.5,n2]) // info = [wid of lane,num of lanes] // get lines 

					
						})


					})




			
					let temp_arr  = new Map();
					/// create c.o's
					arr.forEach((adj,node)=>{
						
						let roads = []

						let wid_temp = 0
						adj.forEach((info,key)=>{
							
						


							// from vertex, current vertex, info, connected
							roads.push( [this.ind_to_vec.get(key),...info,false] ) // connected = false
							
							if(info[1]>wid_temp){
								wid_temp = info[1]
							}

						})

						
						temp_arr.set(node,roads)
						
						let method;



						// sort by ang 
						let v_mid = this.ind_to_vec.get(node);


	
						method = Math.random()>0.5
						? 'edge_vcir' : 'edge_roads' // ?? 


		
						let radius = 5 //temp
					




						// method = 'edge_vcir'
						let dist = 100

						// if only on park lines rect, apply radius info, else defualt
						if( 
							(v_mid.x>=s_h-2 && v_mid.x<=e_h +2 && v_mid.z>=s_v - 2 && v_mid.z<=e_v +2) &&

							((Math.abs(v_mid.x-s_h) <  2 || Math.abs(v_mid.x-e_h)  <  2 ) ||
							(Math.abs(v_mid.z-s_v) <  2 || Math.abs(v_mid.z-e_v)  <  2 ) )){
							split_vertecs.forEach(temp=>{

								
								let t = temp[0].distanceTo(v_mid)
								if(t < dist){
									dist = t
									radius = temp[1]
									method = temp[2]
								}
							})
							
						}



						//// check **
						radius = THREE.MathUtils.clamp(radius,wid_temp*0.6,16)


						

						//radius = Math.max(radius,wid_temp*0.6,26*0.5) // 5 == defualt minimum 

						if(method == 'edge_roads'){ // reduce size to avoid car overlapping area
							radius = wid_temp*0.55 //0.26
						}
						// radius = wid_temp*0.5 //0.26
			

						let edge_flag = false
						park_vertecs.forEach(v=>{
							if(v.distanceTo(v_mid)<3){
								// method = edge_method;
								edge_flag = true
							}
						})
						

						// radius = 25*0.5
						// method = 'edge_vcir'

						// method = 'edge_roads'
						roads.sort(function(a, b) {
							// get ang relative to mid
							let v_cur1 = a[0]
							let x1 = v_mid.x - v_cur1.x
							let z1 = v_mid.z - v_cur1.z
							let ang1 = Math.atan2(x1,z1) // ang between v1,v2

							let v_cur2 = b[0]
							let x2 = v_mid.x - v_cur2.x
							let z2 = v_mid.z - v_cur2.z
							let ang2 = Math.atan2(x2,z2) // ang between v1,v2

							return ((ang1 < ang2) ? 1 : ((ang1 > ang2) ? -1 : 0));
						});


					

				
					
			
						/// not nessecary / for safety defualt
						// if not a number, set as number
						if(isNaN(radius)){
							radius = wid_temp*0.55 
						}
					
							let co = new overcross(
								this.ind_to_vec.get(node), // vertex position a
								radius, 
								roads,
								scene,
								class_car,
								method
								)
								
								this.co_info.set(node,co) // name --> c.o
				


		
						
					})

					this.nodes_info = temp_arr;



	}
	

	// loop all nodes, if connected==false--> connect
	connect_roads(){

		
		
		this.nodes_info.forEach((v,k)=>{
			
			// get vec name
			let node_vec  = this.ind_to_vec.get(k)



			v.forEach((info,key)=>{

			
		
				//--- connect
				if(info[3]==false){ // dont repeate twice



				
				
					let lane = info[2];
					let wid = info[1];
					let v_cir = info[4];

					let connecTo = info[0]

					
				


					let connecTo_ind = toIndex(connecTo.x,-connecTo.z,max_val)
					let info_out = this.nodes_info.get(connecTo_ind)
		
					let v_out = null;
					///// optimize **loop all roads in c.o to find 1
					
					for(let i=0;i<info_out.length;i++){
					
						if(node_vec.x === info_out[i][0].x && node_vec.z === info_out[i][0].z){
							v_out = i //info_out[i][4]
							break;
						}
					}

			

					if(v_out===null){
						throw "v-out not found"
					}


				
					///// 	for finding edges (poly edges)
					let mid_b2 = new THREE.Vector3().lerpVectors(node_vec,connecTo,0.5) // mid point == edge 
					let edge = toIndex(mid_b2.x,-mid_b2.z) // hash to get name edge




					
									
								// // road shape = first arr
								let shape = [v_cir,info_out[v_out][4]]; // for roads connections ( new area edges)
				

			
					if(this.edge_graph.get(edge)!==undefined){
				
					let adj_polys = this.edge_graph.get(edge).adj_polys
				
					let is_park = false;
					let is_edge = false;

					if(adj_polys.length==1){
						is_edge = true
					}
					
					let poly1 = this.poly_graph.get(adj_polys[0])
					let poly2 = this.poly_graph.get(adj_polys[1])
					
		
		


					// shote code latter **
						//^^
					if(poly1!==undefined && poly2!==undefined){
						
						if(poly1.kind==1 && poly2.kind==1){ // between 2 parks == no road
							is_park = true;					
						}

						
						else{
							
							
							if(poly1.kind==1 || poly2.kind==1){ // 1 of them is park == edge park --> save edge in park id 
							let ch = poly1.kind==1 ? poly1 : poly2
							let ch_id = ch.id_park 


					
							this.park_map.id_parks_edges.get(ch_id).add(edge) // id--> edge names
							// let vecs = this.edge_graph.get(edge).edge_vecs;
							// draw_line(scene,vecs[0],vecs[1],true,0x0000ff)

					
							
							

							
						}
						}
												
					}

		




					if(!is_park && !is_edge){

			
				
						let g = get_road(	shape,	lane,wid*2,0,0x000000,44,scene,false) //true
						

	

						if(flag_cars){ // *testing

								// ////strips
								for(let i=2;i<lane*2-1;i+=2){
									get_road_strips(g,i,lane,al_car*0.2,shape)
								}


								for(let c = 1; c<lane*2;c+=2){ //// +2 ++ /// (1 / -0)
									let forward = c>lane ? true : false; // car direction
									get_cars_road_test(g,c,forward,c_cars1,null,g_cars1,true,true); /// last pram ==  no cars edges road
				
								}
						}
					}

				}//if edge undefiende
						////--- update on both c.o to connected roads
						info[3] = true;
						info_out[v_out][3] = true;

			

				}


				

			})


	

		})

		pos_vec.set(0,0,0)
		let poly_edges = [null,null,null,null]
		let save_avgs = [pos_vec.clone(),pos_vec.clone(),pos_vec.clone(),pos_vec.clone()] // 


		this.poly_graph.forEach((info,name)=>{

		


			// update poly park corners
			if(info.kind ==1 ){
				info.poly.forEach(v=>{
					if(park_vertecs[1].distanceTo(v) < park_vertecs[1].distanceTo(save_avgs[1])){poly_edges[1]=info; save_avgs[1] = v} // ul
					if(park_vertecs[0].distanceTo(v)< park_vertecs[0].distanceTo(save_avgs[0])){poly_edges[0]=info; save_avgs[0] = v} // ur
					if(park_vertecs[2].distanceTo(v)< park_vertecs[2].distanceTo(save_avgs[2])){poly_edges[2]=info; save_avgs[2] = v}// dr
					if(park_vertecs[3].distanceTo(v)< park_vertecs[3].distanceTo(save_avgs[3])){poly_edges[3]=info; save_avgs[3] = v} // dl
				})
			}
		})






		

		let newas = []
		let blds = []
	

		poly_edges.forEach(p=>{
			let b = OffsetContour(p.alpha_off,p.new_area,true)
			// outline(p.new_area,0xff0000)
			// outline(b,0x00ff00)

		
			custom(p.new_area,0.01 + 0.09,scene,c_sd2)
			custom(b,0.02 + 0.09,scene,c_ground)

			newas.push([...p.new_area])
			blds.push([...b])
		})



		function s1(arr,al,op = 0){ // op 0 =x,1 = z
			if(op==0){ 
				return (arr).slice().sort(function(a, b) {return ((a.x < b.x) ? -1*al : ((a.x > b.x) ? 1*al : 0))}) // x
			}

			return (arr).slice().sort(function(a, b) {return ((a.z < b.z) ? -1*al : ((a.z > b.z) ? 1*al : 0));}) // z
		}

	
	
		//////////////////// loop ver -- hor
		//ur,ul,dr,dl
		// poly_edges

let vec_maxs = [] // u,d,r,l // z,x,z,x
let e_lines1 = this.e_lines1 // ul,ur,dr,dl
let e_lines2 = this.e_lines2 // ul,ur,dr,dl

		/////// * merge loops latter -------
	for(let k=0;k<2;k++){
		
			let col = k==0 ? c_sd2 : c_ground // sd,park //0x333333 //0x221111
		let arr_temp =  k==0 ? newas : blds
		let yt = k==0 ? 0.01+ 0.09 : 0.02+ 0.09
		yt+=add_y
		{
		//--  ul
		let al = 1
		let t1 = s1(arr_temp[1],al,1).slice(0,2)
		let v1 = s1(t1,1)[0]

		


	
		// -- ur
		let t2 = s1(arr_temp[0],al,1).slice(0,2)
		al = -1
		let v2 = s1(t2,al)[0]

		// get_sphere(v2.x,v2.y,v2.z,0xff0000,1)


		al = -1
		// -- dl
		let t44 = s1(arr_temp[2],al,1).slice(0,2)
		let v4 = s1(t44,al)[0]
// get_sphere(v4.x,v4.y,v4.z,0xff0000,1)

		
		// -- dr
		let t3 = s1(arr_temp[3],al,1).slice(0,2)
		al = 1
		let v3 = s1(t3,al)[0]

// get_sphere(v3.x,v3.y,v3.z,0xff0000,1)
		if(k==1){
			e_lines1.push(v1.clone()) // u
			e_lines1.push(v2.clone()) // u
			e_lines1.push(v3.clone()) // d
			e_lines1.push(v4.clone()) //d
		}

		let cen1 = new THREE.Vector3().lerpVectors(v3,v4,0.5)
		let cen2 = new THREE.Vector3().lerpVectors(v1,v2,0.5)

		cen1.z+=-(Math.abs(v3.z))/2
		cen2.z+=+(Math.abs(v3.z))/2

		// get_sphere(cen1.x,cen1.y,cen1.z,0xffff00,1)


		main_plain.rotation.set(0,0,0)
						main_plain.position.set(cen1.x,cen1.y + yt,cen1.z)
						main_plain.rotateX(-Math.PI/2)


						add_container(main_plain,'plane','plane',  v4.x-v3.x,v3.z,0,world_pos,world_quat,col,1)

		

						// console.log("aaaaaaaaaaa=",world_pos)

				main_plain.rotation.set(0,0,0)
				main_plain.position.set(cen2.x,cen2.y + yt,cen2.z)
				main_plain.rotateX(-Math.PI/2)

	
				add_container(main_plain,'plane','plane',  v2.x-v1.x,Math.abs(v1.z),0,world_pos,world_quat,col,1)



	}

}// loop an b




///////// hor



for(let k=0;k<2;k++){
				
			let col = k==0 ? c_sd2 : c_ground // sd,park //0x333333 //0x221111
		let arr_temp =  k==0 ? newas : blds
		let yt = k==0 ? 0.01+ 0.09 : 0.02+ 0.09

		{


		{///// CORRECT LATTER * LOOP

				//--  ul
				let al = 1
				let t1 = s1(arr_temp[1],al,0).slice(0,2)
				let v1 = s1(t1,al,1)[0]

				// get_sphere(v1.x,v1.y,v1.z,0xff0000,1)
				// -- ur
				al = -1
				let t2 = s1(arr_temp[0],al,0).slice(0,2)
				al = 1
				let v2 = s1(t2,al,1)[0]

				// get_sphere(v2.x,v2.y,v2.z,0x00ff00,1)

				al = -1
				// -- dl
				let t44 = s1(arr_temp[2],al,0).slice(0,2)
				let v4 = s1(t44,al,1)[0]


				
				// -- dr
				al = 1
				let t3 = s1(arr_temp[3],al,0).slice(0,2)
				al = -1
				let v3 = s1(t3,al,1)[0]

				
				if(k==1){
					e_lines2.push(v1.clone()) // l
					e_lines2.push(v2.clone()) // r
					e_lines2.push(v3.clone())
					e_lines2.push(v4.clone())
				}


				let cen1 = new THREE.Vector3().lerpVectors(v3,v1,0.5)
				let cen2 = new THREE.Vector3().lerpVectors(v4,v2,0.5)

				cen1.x+=+(Math.abs(v3.x))/2
				cen2.x+=-(Math.abs(v4.x))/2

	
				
				main_plain.rotation.set(0,0,0)
								main_plain.position.set(cen1.x,cen1.y + yt,cen1.z)
								main_plain.rotateX(-Math.PI/2)


								v2.x-v1.x,Math.abs(v1.z)

								add_container(main_plain,'plane','plane',  Math.abs(v3.x),v3.z-v1.z,0,world_pos,world_quat,col,1)


				


						main_plain.rotation.set(0,0,0)
						main_plain.position.set(cen2.x,cen2.y+ yt,cen2.z)
						main_plain.rotateX(-Math.PI/2)


						add_container(main_plain,'plane','plane',  Math.abs(v2.x),v4.z-v2.z,0,world_pos,world_quat,col,1)







		} 

	}

}// loop hor






// // for(let w=0;w<4;w++){
// 	let col = Math.random()*0xffffff
// 	get_sphere(e_lines1[w].x,e_lines1[w].y,e_lines1[w].z,col,1)
// 	get_sphere(e_lines2[w].x,e_lines2[w].y,e_lines2[w].z,col,1)
// // }



}



	get_lines(return_line = false,draw = false,color = 0xff0000,merge_d = 0.5){
	
		// merge_d = 2

		let arr = this.arr;
		let map1 =  new Map(); /// intersections of lines


		if(draw){
			arr.forEach(i=>{
				draw_line(scene,i[0],i[1],true,color)
			})
		}
	
	
		
	
		///  i == line, indexes == num lanes
		/// save by 2 vecs hash new map
		for(let i=0;i<arr.length;i++){
			for(let j=0;j<arr.length;j++){

				if(j==i)continue

				//// d2 convertion // road 2 l
				let t1 = new THREE.Vector2(arr[i][0].x,-arr[i][0].z)
				let t2 = new THREE.Vector2(arr[i][1].x,-arr[i][1].z)
				let t3 = new THREE.Vector2(arr[j][0].x,-arr[j][0].z)
				let t4 = new THREE.Vector2(arr[j][1].x,-arr[j][1].z)
				
				let res = calculateIntersection(t1,t2,t3,t4,false)
				if(res!=null){ 
					let c = Math.random()*0xffffff

					if(draw){
					get_sphere(res.x,0,-res.y,c,0.5)

				
					}

				
					if(!map1.has(i)){
						map1.set(i,[])
					}

		

					//	 *** if  not res inter in map in range 't' --> add new intersection point.
					///  else create new one 
					map1.get(i).push(res)

				}


			}

			if(map1.has(i)){
			

				// no vertical x ********** add y outline
				map1.get(i).sort(function(a, b) {
					var t2 = a.x; var t1 = b.x;
					return ((t1 < t2) ? -1 : ((t1 > t2) ? 1 : 0));
				});



			
		}
	
	
	}
	


	if(return_line){ return map1}

	let mid_lanes = new Map() // save the 2 vectors of mid lanes


	map1.forEach((val,key)=>{/// intersections
		let nodes = this.nodes;
		let lanes = this.line_lanes;
		let ind_to_vec = this.ind_to_vec;
		let temp;



		let num_lanes = this.arr_lanes[key];

		let mid;

		// loop over line intersections in over
		for(let i = 0;i<val.length;i++){
			
			let ind = toIndex(val[i].x,val[i].y,max_val)



			// add all vertexes to nodes graph (names only)
			// 'set' should not add same names
			if(!nodes.has(ind)){
				nodes.set(ind,new Set())
			
			}


			if(i-1>=0){
				temp = toIndex(val[i-1].x,val[i-1].y,max_val)
				nodes.get(ind).add(temp)

				// road, add to map lanes num, by middle hash
				mid = new THREE.Vector2().lerpVectors(val[i],val[i-1],0.5)

			
				mid = toIndex(mid.x,mid.y)
				
					lanes.set(mid,num_lanes)
					mid_lanes.set(mid,[val[i],val[i-1]]) // for new lanes
				

			}

			if(i+1<val.length){
				temp = toIndex(val[i+1].x,val[i+1].y,max_val)
				nodes.get(ind).add(temp)

			}

			// if vec name not exist, create
			if(!ind_to_vec.has(ind)){
				
				ind_to_vec.set(ind,new THREE.Vector3(val[i].x,defualt_y,-val[i].y))
			}

		}


	})


	/// make dist very small to avoid group range with non adjs in original graph 
	//( if there one, now graph arent.)

	
	let nodes = this.nodes; /// intersections --> adjs (vertexes graph)
	let map_inrange = new Map()
	let non_repeate = new Set()
	let node_to_range = new Map()

	for (const [node, adj] of nodes.entries()) {
		let node_vec = this.ind_to_vec.get(node);

		let flag = true
		for (const [range, adj] of map_inrange.entries()) {
			let inrange_vec = this.ind_to_vec.get(range);

			if(inrange_vec.distanceTo(node_vec) < merge_d && !non_repeate.has(node)){ 
				flag = false
				map_inrange.get(range).add(node)
				non_repeate.add(node)
				non_repeate.add(range)

				node_to_range.set(node,range) // for lanes
			}
		}

		if(flag){
			map_inrange.set(node,new Set([node]))
			non_repeate.add(node)

			node_to_range.set(node,node) // for lanes
		}

		

	}


	let cnt = 0

	

	let new_map = new Map()
	for (const [node1, adj1] of map_inrange.entries()) {
		new_map.set(node1,new Set())

		
		
	}




	// loop all nodes of each range over each range, if exist connect in sets, connect inranges
	for (const [node1, adj1] of map_inrange.entries()) {
			for (const [node2, adj2] of map_inrange.entries()) {
						// console.log(node2, adj2)
						if(node1===node2 ){continue;}


						if(new_map.get(node1).has(node2)){continue;} // dont repeate twice


						let flag_connect = false; // connect
						for (const a1 of adj1) {
							let s1 = nodes.get(a1)

							let intersect1 = new Set([...s1].filter(i => adj2.has(i)));
							if(intersect1.size>0){
								flag_connect = true
								break;}
						}

						if(!flag_connect){
								for (const a2 of adj2) {
									let s2 = nodes.get(a2)
									let intersect2 = new Set([...s2].filter(i => adj1.has(i)));
									if(intersect2.size>0){
										flag_connect = true
										break;}
								}
						}


						if(flag_connect){
							new_map.get(node1).add(node2)
							new_map.get(node2).add(node1)
						}
				

				}
			}


	let new_lanes = new Map()
	let temp_cc = new Map() 
	for (const [mid, vectors] of mid_lanes.entries()) {
		
		let r1 = node_to_range.get(toIndex(vectors[0].x,vectors[0].y)  )
		let r2 = node_to_range.get(toIndex(vectors[1].x,vectors[1].y) )

	
		if(r1===r2)continue;

		let t_r1 = this.ind_to_vec.get(r1)
		let t_r2 = this.ind_to_vec.get(r2)

		let v2_r1 = new THREE.Vector2(t_r1.x,-t_r1.z)
		let v2_r2 = new THREE.Vector2(t_r2.x,-t_r2.z)

		let lane_num = this.line_lanes.get(mid)


		let new_mid = new THREE.Vector2().lerpVectors(v2_r1,v2_r2,0.5)
		let name_mid = toIndex(new_mid.x,new_mid.y)

		if(!temp_cc.has(name_mid)){
			temp_cc.set(name_mid,[0])
		}

		temp_cc.get(name_mid)[0]+=1
		if(new_lanes.has(name_mid)){
			new_lanes.set(name_mid,Math.max(lane_num,new_lanes.get(name_mid)))
		}else{
			new_lanes.set(name_mid,lane_num)
		}

	}
	



	this.nodes = new_map;
	this.line_lanes = new_lanes;


	this.polygon_finder()



	let arr2 = []
	// need to convert names to vectors3

	this.polygons.forEach(a=>{
		arr2.push([])
		a.forEach(i=>{

			let v = this.ind_to_vec.get(i);
			arr2[arr2.length-1].push(new	THREE.Vector3(v.x,defualt_y,v.z)) /// minus z only when converting to vec2/toindex
		})
	})



return arr2


}	





polygon_finder(){
	 poly_nodes = structuredClone(this.nodes);


	
	for (const [node, adj] of poly_nodes.entries()) {



		// loop over adj of current node
		for (const nextNode of adj) {
	

			const polygon = this.recusive([node, nextNode]);

		
			if (polygon !== null){ 
				this.remove_polygon_adjacencies(polygon);
				this.polygons.push(polygon);
			}
		}
	}



}

// remove adj of (v1) --> v2 direction == remove v2 from v1 adjs
remove_polygon_adjacencies(polygon){
	for (let i = 0; i < polygon.length; i++) {
		const current = polygon[i];
		const next = polygon[(i + 1) % polygon.length];

		let adj_cur = poly_nodes.get(current)

		////----- set
		const index = adj_cur.has(next);
		if (index >= 0) {
		
			adj_cur.delete(next)
	
		
		} else {
			log.error("PolygonFinder - node not in adj");
		}


	}


}




// can be add max path
recusive(visited){
	const nextNode = this.get_right(visited[visited.length - 2], visited[visited.length - 1]);

        if (nextNode === null) {
            return null;  // dead end inside
        }


		// if index in visited --> cycle
        const visitedIndex = visited.indexOf(nextNode);
        if (visitedIndex >= 0) {
			return visited.slice();

        } else {
            visited.push(nextNode);
            return this.recusive(visited);
        }

}


// gets edge direction (1-->2)
get_right(t1,t2){


			let adj_next = poly_nodes.get(t2)
			
			// will reach 0 while removing adjs in direction
			// after finding polygon shape.
			if(adj_next.size===0){return null;}
			
			
			let vec_t1 = this.ind_to_vec.get(t1)
			let vec_t2 = this.ind_to_vec.get(t2)


			
			
			// ang direction of 2 points 
		
			var origin_ang = Math.atan2(-vec_t1.z - (-vec_t2.z),vec_t1.x - vec_t2.x);
			let save_right = null;
			let right_ang = Math.PI * 2;



		
			// loop over all adj of t2, get rightmost.
			for (const n of adj_next) {
				if (n !== t1) { // dont take origin as adj

					let vec_n = this.ind_to_vec.get(n) // vec of n


					var temp_ang = Math.atan2((-vec_n.z) - (-vec_t2.z),vec_n.x - vec_t2.x) - origin_ang;

					if (temp_ang < 0) {// corrent minus
						temp_ang += Math.PI * 2;
					}

					// update rightest
					if (temp_ang < right_ang) {
						right_ang = temp_ang;
						save_right = n;
					}
				}
			}


			return save_right; // return index


}


}
export {G};




function is_point_in_poly(poly,point,d3 = true,park_edges = false,gr = null){

	
	let p = d3 ? new THREE.Vector2(point.x,-point.z) : point; // covert to d2 //  reuse vector #
	let p2 = new THREE.Vector2(1000,1000) //  reuse vector #

	


let v1 = new THREE.Vector2()
let v2 =  new THREE.Vector2()
let cnt = 0
	// park edges
	if(park_edges){

		poly.forEach(e=>{
			let edge = gr.edge_graph.get(e).edge_vecs;

			v1.x = edge[0].x
			v1.y = -edge[0].z
			v2.x = edge[1].x
			v2.y = -edge[1].z
			let res = calculateIntersection(p,p2,v1,v2)
		
			if(res!==null){cnt++}

			
		})

	}

	else{

		// regualr poly
		
		for(let i =0;i<poly.length;i++){
		
			v1.x = poly[i].x
			v1.y = -poly[i].z
			v2.x = poly[(i+1)%poly.length].x
			v2.y = -poly[(i+1)%poly.length].z
			let res = calculateIntersection(p,p2,v1,v2)
		
			if(res!==null){cnt++}
		}
	}


	
		return cnt%2==1 ? true : false;

	
}


export {is_point_in_poly}





function get_sphere(x,y,z,col = 0xffffff, rad = 0.3, flag_return = false){
	let shpere_g = new THREE.SphereGeometry(rad,11,11) //(0.3,33,33)
	let shpere_m = 	new THREE.MeshBasicMaterial( { color: col,  wireframe: false } )
	let sphere = new THREE.Mesh(shpere_g,shpere_m)
	sphere.position.set(x,y,z)

	if(flag_return){return sphere}

	scene.add(sphere)
}


export {get_sphere}


function calculateIntersection(p1,p2,p3,p4) {
	
	let x1 = p1.x
	let y1 = p1.y

	let x2 = p2.x
	let y2 = p2.y

	let x3 = p3.x
	let y3 = p3.y

	let x4 = p4.x
	let y4 = p4.y


	// Check if none of the lines are of length 0
	  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
		  return null //false
	  }
  
	  let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  
	// Lines are parallel
	  if (denominator === 0) {
		  return null //false
	  }
  
	  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
	  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  
	// is the intersection along the segments
	  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		  return null //false
	  }
  
	// Return a object with the x and y coordinates of the intersection
	  let x = x1 + ua * (x2 - x1)
	  let y = y1 + ua * (y2 - y1)
	  
	  let v = new THREE.Vector2(x,y);

	 
	  return v;

	
  }







export {calculateIntersection}











function outline(arr,col = 0xffffff , d3 = true){
	if(arr===undefined)return;
	// console.log("arr=",arr)


	const path = new THREE.Path();

	if(d3){
		path.moveTo( arr[0].x,-arr[0].z );
		for(let i=0;i<arr.length;i++){
			path.lineTo( arr[i].x,-arr[i].z );	
		}
		path.lineTo( arr[0].x,-arr[0].z );
	}

	else{
		path.moveTo( arr[0].x,arr[0].y );
		for(let i=0;i<arr.length;i++){
			path.lineTo( arr[i].x,arr[i].y );	
		}
		path.lineTo( arr[0].x,arr[0].y );
	}

	const points = path.getPoints();

	const geometry = new THREE.BufferGeometry().setFromPoints( points );
	const material = new THREE.LineBasicMaterial( { color: col } );

	const line = new THREE.Line( geometry, material );
	line.rotateX(-Math.PI/2)
	line.position.y+=0.05
	scene.add( line ); // 

	

}







function init_graph(s,alpha_car){

	scene = s;
	al_car = alpha_car

	let grid = d3_shape(2,2,2)[0]


	class_car  = new VehicleGenerator(0.2,true,scene,0xff0000)/// dont change 0.2, scale only in road
	
	update_class(class_car,grid,scene,al_car)
	

	let main_mat = new THREE.MeshBasicMaterial({color:0xffffff})
	/// SET SAME OBJ
	let plain_g = new THREE.PlaneGeometry(1,1) // TEMP FOR ALL PLANES
	main_plain = new THREE.Mesh( plain_g, main_mat ) ;



}


export {init_graph}

/// non intersecting option
function place_objs_inarea(arr,y_s,enlarge = 1){ // arr y == 0
	objs_scene(scene)
	
	let arr2 = []

	arr.forEach(v=>{
		arr2.push(new THREE.Vector2(v.x,-v.z))
	})
	
	let center = get_polygon_centroid(arr2)
	let centriod = new THREE.Vector3(center.x,0,-center.y) /// only x,z change, y == y_s below
	
	let scl = al_car * enlarge; // if not edge, enlarge
	let pos = centriod


		
	
		
		let p = Math.random();
		let op =  p<0.33 ? 1 : p<0.63  ? 2 : 3;
		

	
		 
	
	//^^roof
		
		if (op == 1){ // info

		
		
			let look = null
		
			get_vent(centriod,y_s,scl,look) // * correct inside color
			
		
		}



		// water container
		if (op == 2){ //INFO

			// temps
			let look = arr[arr.length-1]
			
			scl = THREE.MathUtils.randFloat(0.05,0.3)
			get_water_con(pos,y_s,scl,look) // * correct inside color
	
		}


		
		// rect shape
		if (op == 3){

			// temps
		
			let look = arr[arr.length-1]
			let t = arr[0].clone()

	
			let s1 = enlarge!=1 ?  THREE.MathUtils.randInt(1,2) : 1
			let s2 = enlarge!=1 ?  THREE.MathUtils.randInt(1,2) : 1
			let s3 = THREE.MathUtils.randInt(1,3) 

			let w = s1*al_car
			let h = s3*al_car
			let d = s2*al_car

			get_rect(centriod,y_s,w,h,d) // * correct inside color
			
	
			
		}
		



				




	

}

	




export {place_objs_inarea}


// get area expand
function get_pos(trails,simplex = null, r_t = 5,len = 20,np,na){


	
		let point = new THREE.Vector3() 
		let vec = new THREE.Vector3() 
		let flag = true
		let r = r_t;
		let cnt = 100;
		let n= n_lines*alp_lines

	
		// find free space for minimum circle
		while(flag && cnt!=0){
		
			point.x = THREE.MathUtils.randFloat(s_h,e_h)
			point.z =  THREE.MathUtils.randFloat(s_v,e_v)



				flag = false
				for(let i=0;i<trails.length;i++){
				vec.x = trails[i].x
				vec.z = trails[i].z
				
					if(vec.distanceTo(point)<r){
					flag = true;
					break;
					}
				}
			cnt--
		}
		
		if(cnt==0){
			console.log("NOT FOUND LAKEE")
			return null;} // * correct
		

		let angle = 0;
		let parts = 15
		let step  = (Math.PI*2)/parts; //i
		
		
		
		let arr_points = []
		let arr_points2 = []
		let r2 = r/2
		
		/// --- get points on circle 
		for(let i=0;i<parts;i++){
		
				var x = r2 * Math.sin(step*i);
				var z = r2 * Math.cos(step*i);
			

				let v2 = new THREE.Vector3(x,0,z).add(point)
				let d = v2.clone()
				let dir = d.sub(point).normalize()

		
				arr_points.push([v2,dir])
				arr_points2.push([v2.clone(),dir])
		}
		
		
			/// expand points until collides with occupied place
			let t_noise = 0.01


	
		for(let q = 0;q<arr_points.length -1;q++){


					let v = arr_points[(q%arr_points.length)]


					let vec = v[0]
					let flag_max = false

					let dir_step = new THREE.Vector3(v[1].x,v[1].y,v[1].z)

					let cnt = 
					simplex!= null ? 
					Math.floor(len + simplex.noise(t_noise,t_noise)*THREE.MathUtils.randInt(15,17) ) :
					THREE.MathUtils.randInt(11,22);

					let val = 1
					dir_step.multiplyScalar(val);
					let temp_step = dir_step.clone()
					let prev_dist = 0
					let cnt2 = 0

					
					let t = new THREE.Vector3()
			
					// while not collide or not reached max area --> expand
					let collide = false;
					let r2 = 3

					let prev_cnt = 0
					while(!flag_max && cnt!=0 ){
						
						vec.add(dir_step)
		

						
				
						for(let i=0;i<trails.length;i++){
							t.x = trails[i].x
							t.z = trails[i].z
							
								if(t.distanceTo(vec)<r2){
									collide = true;
								
								break;
								}
							}


						if(collide){
							flag_max = true;
							break;
						}
				
				cnt--
					}

					t_noise+=0.01

		

		}


		for(let i=0;i<arr_points2.length+1;i++){
			let dc = arr_points2[i%arr_points2.length][0].distanceTo(arr_points[i%arr_points2.length][0]) // dist c
			let dn = arr_points2[(i+1)%arr_points2.length][0].distanceTo(arr_points[(i+1)%arr_points.length][0]) // dsit n

	

			
			if(dn*0.2>dc){

	

				let vec = new THREE.Vector3().lerpVectors(
						arr_points2[(i+1)%arr_points2.length][0],
						arr_points[(i+1)%arr_points.length][0],
						0.5
					)
					arr_points[(i+1)%arr_points.length][0].x = vec.x
					arr_points[(i+1)%arr_points.length][0].y = vec.y
					arr_points[(i+1)%arr_points.length][0].z = vec.z

		
					
				
			}
		}

	// }


	for(let i=arr_points2.length-1;i>0;i--){
		let dc = arr_points2[i%arr_points2.length][0].distanceTo(arr_points[i%arr_points2.length][0]) // dist c
		let dn = arr_points2[(i-1)%arr_points2.length][0].distanceTo(arr_points[(i-1)%arr_points.length][0]) // dsit n

	


		
		if(dn*0.2>dc){

	

			let vec = new THREE.Vector3().lerpVectors(
					arr_points2[(i-1)%arr_points2.length][0],
					arr_points[(i-1)%arr_points.length][0],
					0.5
				)
				arr_points[(i-1)%arr_points.length][0].copy(vec)

				// get_sphere(
				// 	vec.x,
				// 	vec.y,
				// 	vec.z,
				// 	0x00ff00,1
				// )

				
			
		}
	}




	return arr_points

}


