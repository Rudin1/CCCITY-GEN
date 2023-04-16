import * as THREE from 'three';
// import * as THREE from "https://cdn.skypack.dev/three@0.136.0";


import { get_color_b, mesh_containers, Precision,chance_car,pul,pur,pdl,pdr, h_n,s_v,e_v,s_h,e_h, outer_90} from './a_tools.js'

import {main_matetrial,car_nums,d3_shape,defualt_y,SimplexNoise,scl_cars,random_pick,y_objs,add_container} from './a_tools.js';
import { c_building, c_cars1 ,c_ground,c_sd2,g_cars1} from './color_art.js';
import {calculateIntersection, is_point_in_poly} from './graph.js'

import {get_tree} from './a_objs.js'
const toIndex = (x, y, xMax = 100) =>  Precision(x + y * xMax);

let scene = null;
let c_car = null;
let alpha = null;



// car nums
let nums = [0,1,2,3,4,5,6]

let main_mat = new THREE.MeshBasicMaterial({color:0xffffff})
let main_truck = new THREE.Mesh(new THREE.CylinderGeometry(2,2,2,8,2), main_mat) ; 



/// SET SAME OBJ
let plain_g = new THREE.PlaneGeometry(1,1) // TEMP FOR ALL PLANES
let main_plain = new THREE.Mesh( plain_g, main_mat ) ;

let tempg = new THREE.BoxGeometry(1,1,1) // TEMP FOR ALL BOX
let main_box = new THREE.Mesh( tempg, main_mat ) ;


let tempg2 = new THREE.SphereGeometry(1,1,1)
let main_sphere = new THREE.Mesh( tempg2, main_mat ) ;


let line = new THREE.LineCurve3()
// p3:{
//     con:[[3,2,'half_last'],[1,3,'half_last'],[1,2,'half_last_1']], //[3,2,'half_last'],[1,3,'half_last']
//     cw:[0]// only main (a)
// },

// p4:{// same as p3, flip
//     con:[[1,0,'half_last']], //,[3,2,'half_last_2'] , 3,1,'half_last']
//     cw:[0]// only main (a)
// },






let sig_c = {
    kind:'ls', // large,small.

    p1:{
        con:[],
    },

    p2:{// only c.w, 3 directions
        con:[[2,1,'half_last']],
    },


    p3:{// only c.w, 3 directions
        con:[[2,1,'half_last'],[0,2,'all']],
    },

    p4:{// only c.w, 3 directions
        con:[[0,2,'all']],
    },

    ra:{// only c.w, 3 directions
        con:[[2,1,'half_last'],[3,2,'half_last'],[0,3,'half_last'],[1,0,'half_last']],
    },
   
    

    p5:{
        con:[[3,2,'half_last'],[1,3,'half_last'],[1,2,'half_last_1']], 
    },


    p6:{
        con:[[0,1,'half_last']]
    } ,

    p7: // edge, sml connct
    {con:[[1,2,'half_last'],[3,0,'half_last']],
    },



    p8: // edge, lrg connct
    {con:[[2,1,'half_last'],[0,3,'half_last']],} 

}


// p3:{
//     con:[[3,2,'half_last'],[1,3,'half_last'],[1,2,'half_last_1']], //[3,2,'half_last'],[1,3,'half_last']
//     cw:[0]// only main (a)
// },



/// *** reuse vectors ***
let world_pos = new THREE.Vector3()
let world_quat = new THREE.Quaternion()




let vec1 = new THREE.Vector3()
let vec2 = new THREE.Vector3()






function update_s(s){
    scene = s
}

export {update_s}

// arr of all car versions *
// temporary items
let main_cars = [0,1,2,3,4,5,6]
class overcross{


    /// --- types:


    //// add intersection non-middle directions
  
    constructor(middle,radius,arr_roads,scene_t,class_car,method = 'edge_vcir'){
        
        this.middle = middle;
        this.middle_v2 = new THREE.Vector2(middle.x,-middle.z);
        
        this.out_radius = null; // largest radius
        this.radius = radius;
        this.arr_roads = arr_roads;//// roads == [V_OUTS , wid,n_lanes,**connected**,v_circle,direction to middle,[l,r]] (with adding)  /// [l,r] == all lanes 0,1....n of road
        this.connected_roads = [] // item == [t1,t2,res_l,res_r] (res == intersections) // connect 2 lanes inside roads
        this.connected_edge_roads = [] /// connect 2 roads edges
        this.memo = [] //// circle packing vectors radious area 
        scene = scene_t;
        c_car = class_car;

        

        this.method = method;
        this.adj_polys = new Set() // update when create polys
       
        this.ra = false; /// ra 
    
        ///// find enterence points (v_circles)
        arr_roads.forEach(road => {

                let v_out = road[0]
                let wid = road[1]
                let n_lanes = road[2]
           
                
                //// get v_circles
                let dist = middle.distanceTo(v_out)
                let v = new THREE.Vector3().lerpVectors(middle,v_out,radius/dist);

                road.push(v) // v_circles

              


                ////**** n lane correct */
                let lane = n_lanes;
            
                /// *ROAD
                // // create road connection


      
                /// direction v --> middle
                var dir = new THREE.Vector3();
                dir.subVectors( middle, v_out ).normalize() 

                road.push(dir) //// add to road info

    

                // rotate 90 degrees of direction of middle point, for moving coloumns little bit. ( == normal to wall)
                var mx = new THREE.Matrix4().lookAt(dir,new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0));
                var qt = new THREE.Quaternion().setFromRotationMatrix(mx);


                /// create arr lanes, left to right
                let n = 1*lane*2;
            
               
                let arr_lanes = new Array(n)
                let mid = Math.floor(n/2);

                for(let i = 0;i<=n/2;i++){

                    let ww = wid*i*2

                    let vector_l = new THREE.Vector3( 1, 0, 0 );
                    vector_l.applyQuaternion( qt );
                    vector_l.multiplyScalar( ww/2)
    
               
    
                    let vector_r = new THREE.Vector3( 1, 0, 0 );
                    vector_r.applyQuaternion( qt );
                    vector_r.multiplyScalar( -ww/2)
    

                    if(i==0){
                        arr_lanes[mid] = new THREE.Vector3(v.x + vector_l.x,v.y + vector_l.y,v.z + vector_l.z)
                    }else{
                        arr_lanes[mid-i] = new THREE.Vector3(v.x + vector_l.x,v.y + vector_l.y,v.z + vector_l.z)
                        arr_lanes[mid+i] = new THREE.Vector3(v.x + vector_r.x,v.y + vector_r.y,v.z + vector_r.z)
                    }
                    

                }

    
                
                // add lane middles
                ///(even == no cars, odd==cars ) convention 
              
                road.push(arr_lanes) 
        });



   
  

       
    }


    /// get 4 lane edges + 2 index roads, find intersection.
    straight2(lanes,r1,r2,flag_edge = false, return_flag = false,parallel_lanes = false){ 
        let arr = this.arr_roads
        
        let info;
       
      
                    //// get edges of roads to be connected
                    let r1_l = arr[r1][arr[r1].length-1][lanes[0]] // l of lane r1
                    let r1_r = arr[r1][arr[r1].length-1][lanes[1]]// r of lane r1

                    let r2_l = arr[r2][arr[r2].length-1][lanes[2]] // l of lane r2
                    let r2_r = arr[r2][arr[r2].length-1][lanes[3]] // r of lane r2

            if(!parallel_lanes){
                
             

                    //// get line of edge point and new point in same direction with 2*raduios (both)
                    

                    let dir_r1 = arr[r1][5]
                    let dir_r2 = arr[r2][5]

                    let len_arrow = this.radius*2 //1.5






                    let v_1l = new THREE.Vector3().copy(dir_r1).multiplyScalar(len_arrow).add(r1_l)
                    let v_1r = new THREE.Vector3().copy(dir_r1).multiplyScalar(len_arrow).add(r1_r)
                    let v_2l = new THREE.Vector3().copy(dir_r2).multiplyScalar(len_arrow).add(r2_l)
                    let v_2r = new THREE.Vector3().copy(dir_r2).multiplyScalar(len_arrow).add(r2_r)

                    //// d2 convertion // road 1 l
                    let d2_v_1l = new THREE.Vector2(v_1l.x,-v_1l.z)
                    let d2_r1_l = new THREE.Vector2(r1_l.x,-r1_l.z)

                    //// d2 convertion // road 1 r
                    let d2_v_1r = new THREE.Vector2(v_1r.x,-v_1r.z)
                    let d2_r1_r = new THREE.Vector2(r1_r.x,-r1_r.z)


                    //// d2 convertion // road 2 l
                    let d2_v_2l = new THREE.Vector2(v_2l.x,-v_2l.z)
                    let d2_r2_l = new THREE.Vector2(r2_l.x,-r2_l.z)

                    //// d2 convertion // road 2 r
                    let d2_v_2r = new THREE.Vector2(v_2r.x,-v_2r.z)
                    let d2_r2_r = new THREE.Vector2(r2_r.x,-r2_r.z)
                    

                    let res_l = calculateIntersection(d2_r1_l,d2_v_1l, d2_v_2r, d2_r2_r) // 2d res
                    let res_r = calculateIntersection(d2_r2_l,d2_v_2l, d2_v_1r, d2_r1_r) // 2d res


            


                    if(res_l==null){ 


                        res_l = new THREE.Vector2().lerpVectors(d2_r2_r,d2_r1_l,0.5)

                    }


                    if(res_r==null){ 
    
                        res_r = new THREE.Vector2().lerpVectors(d2_r2_l,d2_r1_r,0.5)


                    }


    
                    res_l = new THREE.Vector3(res_l.x,0,-res_l.y)
                    res_r= new THREE.Vector3(res_r.x,0,-res_r.y)
                    info = [r1,r2,res_l,res_r,...lanes]
            }
            else{ //  r1_l,r1_r,r2_l,r2_r
        
                let ml = new THREE.Vector3().lerpVectors(r1_r,r2_r,0.5)
                let mr = new THREE.Vector3().lerpVectors(r1_l,r2_l,0.5)

    
                info = [r1,r2,ml,mr,...lanes]
              
            }

         

            /// road1, road2, intersect left + right, lanes: r1 left right, r2 left right
            if(!flag_edge){
                this.connected_roads.push(info)
            }else{
                this.connected_edge_roads.push(info)
            }

            if(return_flag){
                return info;
            }

    }


    co_connect(graph,ra_e,ra_in,flag_switch,edge_mon,in_mon){


        let tk1 = 0
        let arr = this.arr_roads;
        

        if(arr.length<4)return; // useless*

   
        // get_sphere(this.middle.x,this.middle.y,this.middle.z,0xff0000,3)
        // pick from 2 grps: 
        // 1. all,half. // sig_a // 0
        // 2. 4 phrases // sig_b // 1
        let op = Math.random()>0.5 ? 0 : 1;
        let type_traffic,type_kind,phase;



        let p = this.middle; 

        let l = Math.abs(p.x - s_h)<1  
        let r = Math.abs(p.x - e_h)<1  
        let u = Math.abs(p.z - s_v)<1   
        let d = Math.abs(p.z - e_v)<1   

        let res = l+r+u+d;
        // console.log("sum=======",l+r+u+d)


        // if(res==0  ){
        //     // throw "error not on park edges"
        //     console.log("not on park edges")
        //     get_sphere(this.middle.x,this.middle.y,this.middle.z,0xffff00,3)
        //     return;
        // }


        let f_op = false 
        let center;
        let rad = this.radius*1
        if(res==2){ // edge park
            center = this.middle;
            // get_sphere(this.middle.x,this.middle.y,this.middle.z,0xff0000,3)
            // rad*=0.95
        }



        // line park u d l r
        let tvec = new THREE.Vector3()
        if(res==1){
           
           l &&  (tvec.set(-1,0,0)) 
           r && (tvec.set(1,0,0))
           u && (tvec.set(0,0,-1))
           d &&  (tvec.set(0,0,1))

           tvec.multiplyScalar(this.radius).add(this.middle)

           rad = tvec.distanceTo(this.middle)*1
           tvec.lerpVectors(tvec,this.middle,0.65)
        //    get_sphere(tvec.x,tvec.y,tvec.z,0x0000ff,1)

           center = tvec
           
        }


        // check z axis test *
        // if not on park edges poly
        if(p.x-2 > e_h || p.x+2 < s_h || p.z + 2 < s_v || p.z - 2 > e_v){
            // get_sphere(p.x,p.y,p.z,0xffffff,3)
            center = p
            // rad*=0.95
            res = 0
        }

   


    

      
      
        let sides = 50
        let y_s = 0
        
	
           
        
        // console.log("rad=",rad)
        
        if(this.method === 'edge_vcir'){ //10

            if(flag_switch){ 
                op = Math.random()<0.5 ? 1 :0; 
            
            }else{
                op = 0
                
            }

            if(op==0){
                rad = res==2 || res == 0 ? rad*=0.7 : rad*=0.5
            }
    
   

            
        }else{
            op = 1
        }

    
        if((res==2 && !ra_e) || (res==1 && !ra_in)){ op = 1}

        type_traffic = sig_c;
        type_kind = sig_c.kind;


        if(op == 1){ // STR/CVIR
            let ch = Math.random();
            phase = ch<0.1 ? type_traffic.p1 : random_pick([type_traffic.p2,type_traffic.p3,type_traffic.p4,type_traffic.p6])
        }

        else{ // R.A
            

   


            let cur = 0.1
            let step = cur
            // rad*=0.5
            let rt = rad; 

            for(let j=0;j<3;j++){

                    const curve = new THREE.EllipseCurve(
                        center.x,-center.z,
                        rt, rt,           
                        0,  2 * Math.PI,  
                        false,            
                        0                 
                    );
                    

               

                    let len = curve.getLength()
                    let strip_len = 1*2

                    const points_strips = curve.getPoints( Math.floor(len/(strip_len)) );
                    
                    const points = curve.getPoints( sides );
                
                
                    const geometry = new THREE.BufferGeometry().setFromPoints( points );
                    const geometry2 = new THREE.BufferGeometry().setFromPoints( points_strips );


                    const m2 = new THREE.LineBasicMaterial( { color: 0xff0000} );
                    
                    //////Create the final object to add to the scene
                    const ellipse = new THREE.Line( geometry, m2 );
                    ellipse.rotateX(-Math.PI/2)

                    const strips = new THREE.Line( geometry2, m2 );
                    strips.rotateX(-Math.PI/2)
            
                    ellipse.position.y=y_s
                    // scene.add(ellipse) //  -- check circle path floors


                    rt = rad*(1-cur)
                    cur+=step


                    ellipse.updateMatrixWorld()
                    strips.updateMatrixWorld()
                    let pos = ellipse.geometry.attributes.position.array;
                    let pos2 = strips.geometry.attributes.position.array;

                    //UPDATE WORLD POS + 3D VECTORS
                    let arr = []
                    let arr2 = []
                    for(let i =0;i<pos.length;i+=3){
                        let v1 = new THREE.Vector3(pos[i],pos[i+1],pos[i+2]);
                        let v2 = new THREE.Vector3(pos2[i],pos2[i+1],pos2[i+2]);

                        ellipse.localToWorld(v1);
                        strips.localToWorld(v2);
                   
                
                        arr.push(v1)
                        arr2.push(v2)
                    }

//let wid_strip = alpha*0.5;
                    for(let i=0;i<arr2.length;i++){
             
                        let next = i == arr2.length-1 ? 0 : i+1 
                        main_plain.rotation.set(0,0,0)
                        main_plain.position.copy(arr2[i])
                        let dir = new THREE.Vector3().subVectors(center,arr2[i]).normalize()
                        let t = arr2[i].clone()

                        outer_90(dir,t,4)


                        main_plain.lookAt(t)
                        main_plain.rotateX(-Math.PI/2)
                        let w = 0.03
                        let h = 1
                     
                        // wid_strip, alpha*4 
                        // wid_strip*2,alpha*4*7, 
                        add_container(main_plain,'plane','plane',w,h,0,world_pos,world_quat,0xffffff,1)

                    }
                    arr2.forEach(v=>{
                        // get_sphere(v.x,v.y,v.z,0x00ff00)
                    })



                    // cars
                    get_cars_road_memo(arr,this.memo,true,c_cars1,true,1,true)
                    
   


            }


     
            let ch = Math.random();
            //phase = random_pick([type_traffic.p2,type_traffic.p3,type_traffic.p4])

            phase = type_traffic.ra

            //%%%%
            // middle objects
            main_truck.position.copy(center)
            // console.log("c=",main_truck)
            let r = rt
            let h = 0.2 // 1
          

            // cylinder sub name doesnt exist*
            add_container(main_truck,'cylinder','tree',r,h,0,world_pos,world_quat,c_sd2) 

            // cylinder sub name doesnt exist*
            add_container(main_truck,'cylinder','tree',r*0.9,h*1.1,0,world_pos,world_quat,c_ground) 

    //   
        //    
// roughness:0
      
        // const geometry = new THREE.TorusKnotGeometry( rad*0.2, 0.5, 33, 4 );
        // const material = new main_matetrial( { color:get_color_b(c_cars1)} );
        // const torusKnot = new THREE.Mesh( geometry, material );
        // torusKnot.position.copy(center)
        // torusKnot.position.y=2
        // scene.add( torusKnot );


        let a1 = Math.random()<0.5;

        let rt2 = rt*0.8
        let col = get_color_b(c_building)
        let col1 = get_color_b(c_building)
        let col2 = get_color_b(c_building)
        let col3 = get_color_b(c_building)
        let col4 = get_color_b(c_building)




        
        let sml = 1
        let lrg = 15
    for(let i=0;i<170;i++){
        let v = center.clone()


        const r2 = Math.sqrt(2*THREE.MathUtils.randFloat(0, 0.5*rt2*rt2));
        const th2 = THREE.MathUtils.randFloat(0, Math.PI*2);
        const dx = r2*Math.sin(th2);
        const dz = r2*Math.cos(th2);


        v.x +=dx
        v.z +=dz
        v.y+=0.2
        let col = 
        dx > 0 && dz > 0 ? col1 :
        dx > 0 && dz < 0 ? col2 :
        dx < 0 && dz < 0 ? col3 :
        col4;

        get_tree(v,col,0,[sml,sml],70,0)
    }



//edge_mon,in_mon
// options 0,1,2,3
// tree,mons,combined,nothing
/// mons :

let c2 = get_color_b(c_building)


let option = res==2 ? edge_mon : in_mon// 

let op1 = 
option == 2 ? random_pick([0,1,2,3]) :  // pick tree or mons
option == 1 ? random_pick([1,2,3]) : // mon
option == 0 ? 0 :  // tree
1000; // nothing.




// let large_tree = 0
if(op1==0){
    get_tree(center,col,0,[rad*1.5,rad*1.5],200,random_pick([0,1]))

}







if(op1==1){


    // boxes
    for(let j=0;j<4;j++){
        let th = 0
        main_box.rotation.set(0,0,0)


        c2 = get_color_b(c_building)
        const r2 = Math.sqrt(2*THREE.MathUtils.randFloat(0, 0.5*rt2*rt2))*0.4;
        const th2 = THREE.MathUtils.randFloat(0, Math.PI*2);
        const dx = r2*Math.sin(th2);
        const dz = r2*Math.cos(th2);



            let w = rad*THREE.MathUtils.randFloat(0.05,0.1); // 0.1
            let de = rad*THREE.MathUtils.randFloat(0.05,0.1); //0.1
            let  h = j==0 ? rad* THREE.MathUtils.randFloat(0.7,1)  : rad*0.5


            main_box.position.copy(center)
    

            if(j!=0 ){


                main_box.position.x+=dx
                main_box.position.z+=dz
                main_box.position.y+=rad* THREE.MathUtils.randFloat(0.2,0.8)
                main_box.rotateX(Math.random()*Math.PI*2)
                main_box.rotateY(Math.random()*Math.PI*2)
                main_box.rotateZ(Math.random()*Math.PI*2)


            }
            else{
              
                th = h/2
            }
//w, h,de
            add_container(main_box,'box','box',de,h,w,world_pos,world_quat,c2,1,th) 
            
    }



        
    //spheres
    for(let j=0;j<4;j++){
    
    
        main_sphere.rotation.set(0,0,0)

        c2 = get_color_b(c_building)
        const r2 = Math.sqrt(2*THREE.MathUtils.randFloat(0, 0.5*rt2*rt2))*0.4;
        const th2 = THREE.MathUtils.randFloat(0, Math.PI*2);
        const dx = r2*Math.sin(th2);
        const dz = r2*Math.cos(th2);



            let r = rad* 0.1

     
          

            main_sphere.position.copy(center)
            main_sphere.position.x+=dx
            main_sphere.position.z+=dz

            main_sphere.position.y+=rad* THREE.MathUtils.randFloat(0.2,0.8)

            main_sphere.rotateX(Math.random()*Math.PI*2)
            main_sphere.rotateY(Math.random()*Math.PI*2)
            main_sphere.rotateZ(Math.random()*Math.PI*2)
            
            
            add_container(main_sphere,'sphere','sphere',1,1,r,world_pos,world_quat,c2) 



  
    }



}




 // // ///// knot
if(op1==2){
    let th = 0
    c2 = get_color_b(c_building)
      
        let p = THREE.MathUtils.randInt(1,6)
        let q = THREE.MathUtils.randInt(1,6)

        let al = 1
        const geometry = new THREE.TorusKnotGeometry( 2*al, 0.2*al, 21, 4, p,q);
        const m = new THREE.MeshPhongMaterial( { color: c2 } );
        const torusKnot = new THREE.Mesh( geometry, m );
        torusKnot.castShadow=true;
        torusKnot.receiveShadow = true;
        torusKnot.position.copy(center)
        torusKnot.position.y = 3*al
        scene.add( torusKnot );


        c2 = get_color_b(c_building)


        ////////// 1 col
        let w = 1*al
        let de = w*al
        let h2 = 5*al //3

        main_box.position.copy(center)
        main_box.position.x += 0
        main_box.position.y+=h2/2

        add_container(main_box,'box','box',de,h2,w,world_pos,world_quat,c2,1,th) 


        // rand rect
        c2 = get_color_b(c_building)
         w = 1
         de = 1
  
        h = THREE.MathUtils.randFloat(1,4)

        main_box.position.copy(center)
        main_box.position.x += 0
        main_box.position.y+=h2/2
        main_box.rotateX(Math.random()*Math.PI*2)
        main_box.rotateY(Math.random()*Math.PI*2)
        main_box.rotateZ(Math.random()*Math.PI*2)

        add_container(main_box,'box','box',de,h,w,world_pos,world_quat,c2,1,th) 


        main_box.rotation.set(0,0,0)

  



    } 

//// sqrs
if(op1==3){

        main_box.rotation.set(0,0,0)
        let zx = [1,-1]
        let w = rt* 0.25
        let r = rt*0.15
        let de = w;
        let temp_pos =  new THREE.Vector3()
        for(let j=0;j<4;j++){
                
                    c2 = get_color_b(c_building)

                        // let w = 1
                        // let de = 1
                

                        h = THREE.MathUtils.randFloat(rt*0.5,rt*1.3)

                        main_box.position.copy(center)
                        if(j<2){
                            main_box.position.x+= zx[j%2]
                        }else{
                            main_box.position.z+= zx[j%2]
                        }

                        
                        main_box.position.y+=h/2
                        add_container(main_box,'box','box',de,h,w,world_pos,world_quat,c2,1) 
                        main_box.rotation.set(0,0,0)


                        temp_pos.copy(main_box.position)

                        c2 = get_color_b(c_building)

                    
                        if(Math.random()<0.5){ 
                            c2 = get_color_b(c_building)
                            if(Math.random()<0.5){
                                main_sphere.position.copy(temp_pos)
                                main_sphere.position.y = h + r
                                add_container(main_sphere,'sphere','sphere',1,1,r,world_pos,world_quat,c2) 
                            }

                            else{
                                main_box.position.copy(temp_pos)
                                main_box.position.y = h + r
                                main_box.rotateY(Math.random()*Math.PI*2)
                                main_box.rotateZ(Math.PI*0.25)
                                main_box.rotateX(Math.PI*0.25)
                                add_container(main_box,'box','box',w,w,w,world_pos,world_quat,c2,1) 
                                main_box.rotation.set(0,0,0)
                            }
                        }
                }


}





        this.ra = true

            
        }



        
    
           
        let addition = THREE.MathUtils.randInt(0,3); // rotates a,b,c,d

        /// r.a 
        // edges // loop all side roads + connect
        if(res==2 && op==0){
            for(let p=0;p<phase.con.length;p++){
                let t1 = (phase.con[p][0] )%arr.length
                let t2 = (phase.con[p][1] )%arr.length
                this.last_half(arr,t1,t2)
            }
            


            return;
        }


      
        if(res==2 && op==1 && Math.random()<0.3){

          
            phase =     random_pick([type_traffic.p8,type_traffic.p7])  

            let addition = THREE.MathUtils.randInt(0,3)
            for(let p=0;p<phase.con.length;p++){
                let t1 = (phase.con[p][0] + addition )%arr.length
                let t2 = (phase.con[p][1] + addition)%arr.length
                this.last_half(arr,t2,t1)
            }
            


            return;
        }





        // both str + evir 
        // for ra inside, only connects outside roads without str.
        // add str after if ra.
        for(let p=0;p<phase.con.length;p++){ // check usless*
    

            let t1 = (phase.con[p][0] + addition)%arr.length
            let t2 = (phase.con[p][1] + addition)%arr.length

    
            let vout1 = arr[t1][0]
            let vout2 = arr[t2][0]

            let cnt = 5
            while(//*** */
            (cnt!==0) &&
                (is_point_in_poly(graph.park_poly,vout1) || // check carsinto park*
                is_point_in_poly(graph.park_poly,vout2))
             ){

                // get_sphere(vout1.x,vout1.y,vout1.z,0x00ff00,1)
                // get_sphere(vout2.x,vout2.y,vout2.z,0xff0000,1)

                addition+=1
                 t1 = (phase.con[p][0] + addition)%arr.length
                 t2 = (phase.con[p][1] + addition)%arr.length
                 vout1 = arr[t1][0]
                 vout2 = arr[t2][0]
                 cnt--
             }

             if(cnt==0){
          
                break;} // return

       

            let x1 = vout2.x - this.middle.x
            // let y = v1.y - v2.y
            let z1 = vout2.z - this.middle.z
            let ang1 = Math.atan2(x1,z1) // ang between v1,v2
        

            let x2 = this.middle.x - vout1.x
            // let y = v1.y - v2.y
            let z2 = this.middle.z - vout1.z
            let ang2 = Math.atan2(x2,z2) // ang between v1,v2

            let flag_parallels = false;
            if(Math.abs(ang2-ang1)<0.1){ // connect by lanes striaght.
                flag_parallels = true;
            }


  

            if(type_kind==='ls'){// large,small junction, 
                   
         
                let n_l,n_s,half_small;

                ///l, from last to mid.
                if(phase.con[p][2]=='half_first'){ 
                  
                    let flag_ls = true; // l-->
                    if(arr[t1][6].length > arr[t2][6].length ){ // l --> s
                        n_l =  arr[t1][6].length  //large
                        n_s =  arr[t2][6].length  // small
           
                    }else{
                        n_l =  arr[t2][6].length  //large
                        n_s =  arr[t1][6].length  // small
                        flag_ls = false;
                    }
                    
              

                    half_small = Math.floor(n_s/2);
                    let half_large = Math.floor(n_l/2);
                    let forward = true;
                    for(let i=1  + tk1;i<half_small - tk1;i+=2){
                       
                            if(flag_ls){
                                // throw "s"
                                this.quad(i+n_l - half_small -1, half_small - i,t1,t2,i,flag_parallels,forward,this.radius) // 2,1
                            }
                            else{//s-->l
                                
                                this.quad(half_small-i,half_large+i,t1,t2,i,flag_parallels,forward,this.radius) // 2,1
                            }

                    }
            }


                if(phase.con[p][2]=='half_last'){ 
                  
                        let flag_ls = true; // l-->
                        if(arr[t1][6].length > arr[t2][6].length ){ // l --> s
                            n_l =  arr[t1][6].length  //large
                            n_s =  arr[t2][6].length  // small
                 
                        }else{
                            n_l =  arr[t2][6].length  //large
                            n_s =  arr[t1][6].length  // small
                            flag_ls = false;
                        }
                        
            

                        half_small = Math.floor(n_s/2);
                        let forward = true;
                        for(let i=1 + tk1;i<half_small - tk1;i+=2){

                                if(flag_ls){
                                    this.quad(i+n_l - half_small -1, half_small - i,t1,t2,i,flag_parallels,forward,rad) // 2,1
                                }
                                else{//s-->l
                                    this.quad(n_s-i-1,i,t1,t2,i,flag_parallels,forward,rad) // 2,1
                                }

                        }
                }



                if(phase.con[p][2]=='half_last_1'){ 
                  
                    let flag_ls = true; // l-->
                    if(arr[t1][6].length > arr[t2][6].length ){ // l --> s
                        n_l =  arr[t1][6].length  //large
                        n_s =  arr[t2][6].length  // small
            
                    }else{
                        n_l =  arr[t2][6].length  //large
                        n_s =  arr[t1][6].length  // small
                        flag_ls = false;
                    }
          

                    half_small = Math.floor(n_s/2);
                    let half_large = Math.floor(n_l/2);
                    let forward = true;
                    for(let i=1 + tk1;i<half_small - tk1;i+=2){

                            if(flag_ls){
                                // throw "s"
                                this.quad(i+n_l - half_small -1, half_small - i,t1,t2,i,flag_parallels,forward) // 2,1
                            }
                            else{//s-->l
                                
                                this.quad(half_small+i,half_large-i,t1,t2,i,flag_parallels,forward) // 2,1
                            }

                    }
            }

         



                if(phase.con[p][2]=='all'){ // L --> L
                  
                    let n =  arr[t1][6].length  //large
                    for(let i=1 + tk1;i<n - tk1;i+=2){
                        this.quad(i,n-i,t1,t2,i,flag_parallels)
                    }


                  
    
            }




           
            }


        }


        // connect str for ra insides
        if(this.ra){
            // find inside park vout

            let ind = null;
          
            let col = 0x00ff00

            for(let i=0;i<4;i++){
                let vout1 = arr[i][0]
                
                
                if(is_point_in_poly(graph.park_poly,vout1)){
                    // col = 0xff0000
                    ind = i
                   
                }
    
                // get_sphere(vout1.x,vout1.y,vout1.z,col,2)
            

            }

            if(ind===null)return;


            let prev = ind == 0 ? 3 : ind-1
            let next = ind == 3 ? 0 : ind+1


            let v1 = arr[prev][0]
            let v2 = arr[next][0]

            // get_sphere(v1.x,v1.y,v1.z,col,2)
            // get_sphere(v2.x,v2.y,v2.z,col,2)


            this.first_half(arr,prev,next,false)
                // (is_point_in_poly(graph.park_poly,vout1) || // check carsinto park*
                // is_point_in_poly(graph.park_poly,vout2))
             

        }


    }



    first_half(arr,t1,t2,forward = true){
    
        let n_l,n_s;
        let flag_ls = true; // l-->
        if(arr[t1][6].length > arr[t2][6].length ){ // l --> s
            n_l =  arr[t1][6].length  //large
            n_s =  arr[t2][6].length  // small

        }else{
            n_l =  arr[t2][6].length  //large
            n_s =  arr[t1][6].length  // small
            flag_ls = false;
        }
        
  

        let half_small = Math.floor(n_s/2);
        let half_large = Math.floor(n_l/2);
    
        for(let i=1  ;i<half_small ;i+=2){
           
                if(flag_ls){
                    // throw "s"
                    this.quad(i+n_l - half_small -1, half_small - i,t1,t2,i,true,forward) // 2,1
                }
                else{//s-->l
                    
                    this.quad(half_small-i,half_large+i,t1,t2,i,true,forward) // 2,1
                }

        }
    }


    last_half(arr,t1,t2,){
            let flag_ls = true; // l-->
            let n_l,n_s;
            if(arr[t1][6].length > arr[t2][6].length ){ // l --> s
                n_l =  arr[t1][6].length  //large
                n_s =  arr[t2][6].length  // small

            }else{
                n_l =  arr[t2][6].length  //large
                n_s =  arr[t1][6].length  // small
                flag_ls = false;
            }
            


            let half_small = Math.floor(n_s/2);
            let forward = true;
            for(let i=1 ;i<half_small ;i+=2){

                    if(flag_ls){
                        this.quad(i+n_l - half_small -1, half_small - i,t1,t2,i,false,forward,this.radius) // 2,1
                    }
                    else{//s-->l
                        this.quad(n_s-i-1,i,t1,t2,i,false,forward,this.radius) // 2,1
                    }

            }

    }



    quad(n1,n2,r1,r2,i,par = false,forward = null,rad = 1){ // n's == lanes of lane cars


        


     
        let arr = this.arr_roads
        let curve;
       
            //// get lanes to be connected
            /// * % by len if lanes outliers

        
            let r1_v = arr[r1][arr[r1].length-1][n1%(arr[r1][arr[r1].length-1].length)] // l of lane r1
            let r2_v = arr[r2][arr[r2].length-1][n2%(arr[r2][arr[r2].length-1].length)]// r of lane r1
            let dir_r1 = arr[r1][5]
            let dir_r2 = arr[r2][5]   


    
       
        if(!par){

           



            let len_arrow = 20; //4

            // try all cubic
            // 'edge_vcir' : 'edge_roads'
           // if(this.method==='edge_roads' || this.ra == true){ // no intersetions
                let len_p = this.method === 'edge_vcir' ? 0.7 : 0.9; 
                len_p = this.ra ?  0.3 : len_p

                // len_p = 0.9
                // console.log("=len_p=",len_p)
                
                let p1 = r1_v.clone().add(dir_r1.clone().multiplyScalar(rad*len_p))
                let p2 = r2_v.clone().add(dir_r2.clone().multiplyScalar(rad*len_p))

                curve = new THREE.CubicBezierCurve3(
                    r1_v,p1,p2,r2_v
                );


          //  }
           // else{ //edge_vcir


           // }

            // const hex = 0xffff00;

            // const arrowHelper1 = new THREE.ArrowHelper( dir_r1, r1_v, len_arrow, hex );
            // scene.add( arrowHelper1 );

          

            // const arrowHelper2 = new THREE.ArrowHelper( dir_r2, r2_v, len_arrow, hex );
            // scene.add( arrowHelper2 );


            // let len_p = 0.3 
            // let p1 = r1_v.clone().add(dir_r1.clone().multiplyScalar(rad*len_p))
            // let p2 = r2_v.clone().add(dir_r2.clone().multiplyScalar(rad*len_p))

        
            // get_sphere(p1.x,p1.y,p1.z,0xff0000,0.5)
            // get_sphere(p2.x,p2.y,p2.z,0xffff00,0.5)

            // // find intersection straight
            // let v_1 = new THREE.Vector3().copy(dir_r1).multiplyScalar(len_arrow).add(r1_v)
            // let v_2 = new THREE.Vector3().copy(dir_r2).multiplyScalar(len_arrow).add(r2_v)



            //     //// d2 convertion // normals
            //     let d2_v_1 = new THREE.Vector2(v_1.x,-v_1.z)
            //     let d2_v_2 = new THREE.Vector2(v_2.x,-v_2.z)

            //     // stars
            //     let d2_v1 = new THREE.Vector2(r1_v.x,-r1_v.z)
            //     let d2_v2 = new THREE.Vector2(r2_v.x,-r2_v.z)

            //     let temp = calculateIntersection(d2_v_1,d2_v1, d2_v_2, d2_v2) // 2d res

            //     if(temp==null){
            //         return;
            //     }

            //     let res = new THREE.Vector3(temp.x,0,-temp.y)
                
                
            //     get_sphere(res.x,res.y,res.z,0xff0000,0.2)

            //     curve = new THREE.QuadraticBezierCurve3(
            //         r1_v,res,r2_v
            //     );

            // curve = new THREE.CubicBezierCurve3(
            //         r1_v,p1,p2,r2_v
            //     );




        }
        else{//par
            curve = new THREE.LineCurve3(
                r1_v,r2_v
            );
        }

 

       
        

        
      
        const points = curve.getPoints( 33 );


        let half1 = arr[r1][arr[r1].length-1].length/2;
        // ///----- place cars + use memo 
        forward = forward !== null ? forward : half1 > i  ? false : true;
        get_cars_road_memo(points,this.memo,forward,c_cars1,g_cars1,null,true) // * combine with _test latter *
    


    }



    
    quad2(n1,n2,r1,r2,i,par = false,forward = null){ // n's == lanes of lane cars


        


     
        let arr = this.arr_roads
        let curve;
       
            //// get lanes to be connected
            /// * % by len if lanes outliers

        
            let r1_v = arr[r1][arr[r1].length-1][n1%(arr[r1][arr[r1].length-1].length)] // l of lane r1
            let r2_v = arr[r2][arr[r2].length-1][n2%(arr[r2][arr[r2].length-1].length)]// r of lane r1
            let dir_r1 = arr[r1][5]
            let dir_r2 = arr[r2][5]   


    
       
        if(!par){

           



            let len_arrow = 20; //4



            const hex = 0xffff00;

            const arrowHelper1 = new THREE.ArrowHelper( dir_r1, r1_v, len_arrow, hex );
            scene.add( arrowHelper1 );

          

            const arrowHelper2 = new THREE.ArrowHelper( dir_r2, r2_v, len_arrow, hex );
            scene.add( arrowHelper2 );



        


            // find intersection straight
            let v_1 = new THREE.Vector3().copy(dir_r1).multiplyScalar(len_arrow).add(r1_v)
            let v_2 = new THREE.Vector3().copy(dir_r2).multiplyScalar(len_arrow).add(r2_v)



                //// d2 convertion // normals
                let d2_v_1 = new THREE.Vector2(v_1.x,-v_1.z)
                let d2_v_2 = new THREE.Vector2(v_2.x,-v_2.z)

                // stars
                let d2_v1 = new THREE.Vector2(r1_v.x,-r1_v.z)
                let d2_v2 = new THREE.Vector2(r2_v.x,-r2_v.z)

                let temp = calculateIntersection(d2_v_1,d2_v1, d2_v_2, d2_v2) // 2d res

                if(temp==null){
                    return;
                }

                let res = new THREE.Vector3(temp.x,0,-temp.y)
                
                
                get_sphere(res.x,res.y,res.z,0xff0000,0.2)

                curve = new THREE.QuadraticBezierCurve3(
                    r1_v,res,r2_v
                );
        }
        else{//par
            curve = new THREE.LineCurve3(
                r1_v,r2_v
            );
        }

 

       
        

        
      
        const points = curve.getPoints( 33 );


        let half1 = arr[r1][arr[r1].length-1].length/2;
        // ///----- place cars + use memo 
        forward = forward !== null ? forward : half1 > i  ? false : true;
        get_cars_road_memo(points,this.memo,forward,c_cars1,g_cars1) // * combine with _test latter *
    


    }









}/// class


export {overcross}




function get_sphere(x,y,z,col = 0x000000, rad = 0.1){
    let shpere_g = new THREE.SphereGeometry(rad,11,11) //(0.3,33,33)
    let shpere_m = 	new THREE.MeshBasicMaterial( { color: col,  wireframe: false } )
    let sphere = new THREE.Mesh(shpere_g,shpere_m)
    sphere.position.set(x,y,z)


    scene.add(sphere)
   
}



function get_road(middle_points,num_lanes,al,minus_y = 0,col = 0xffffff,n_segments = 55,scene = null,create = false){


    let alpha_width = al*2; 
    var ls = n_segments; 
    var ws = num_lanes*2; 
    
    var lss = ls + 1;
    var wss = ws + 1;


    
    var faceCount = ls * ws * 2;
    var vertexCount = lss * wss;
    
    var g = new THREE.BufferGeometry( );
    
    g.faceIndices = new Uint32Array( faceCount * 3 );
    g.vertices = new Float32Array( vertexCount * 3 );  
    g.normals = new Float32Array( vertexCount * 3 ); 
    
    g.setIndex( new THREE.BufferAttribute( g.faceIndices, 1 ) );	


    g.setAttribute( 'position', new THREE.BufferAttribute( g.vertices, 3 ))
    g.setAttribute( 'normal', new THREE.BufferAttribute( g.normals, 3 ))
    
    
    var idxCount = 0;
    
    for ( var j = 0; j < ls; j ++ ) {
            
        for ( var i = 0; i < ws; i ++ ) {
            
            // 2 faces / segment,  3 vertex indices
            let a =  wss * j + i;
    
            let b1 = wss * ( j + 1 ) + i;		// right-bottom
            let c1 = wss * ( j + 1 ) + 1 + i;
    
            let b2 = wss * ( j + 1 ) + 1 + i;	// left-top
            let c2 = wss * j + 1 + i;
            
            g.faceIndices[ idxCount     ] = a; // right-bottom
            g.faceIndices[ idxCount + 1 ] = b1;
            g.faceIndices[ idxCount + 2 ] = c1; 
            
            g.faceIndices[ idxCount + 3 ] = a; // left-top
            g.faceIndices[ idxCount + 4 ] = b2,
            g.faceIndices[ idxCount + 5 ] = c2; 
            
            g.addGroup( idxCount, 6, i ); // write groups for multi material
            
            idxCount += 6;
                    
        }
            
    }
    
    var curve = new THREE.CatmullRomCurve3( middle_points);
    
    
 
    var points = curve.getPoints( ls ); 
 

    
    
    var tangent;
    var normal = new THREE.Vector3( 0, 0, 0 );
    var binormal = new THREE.Vector3( 0, 1, 0 );
    
    var x, y, z;
    var vIdx = 0; 
    var posIdx; 
  
    for ( var j = 0; j < lss; j ++ ) {  // length
            
        for ( var i = 0; i < wss; i ++ ) { // width
            
       
            
            tangent = curve.getTangent( j / ls ); //  .. / length segments	
        
  
            
            
            normal.crossVectors( tangent, binormal );
            binormal.crossVectors( normal, tangent ); // new binormal
    
            normal.normalize().multiplyScalar( 0.25 ); // normalization...
        
      
            x = points[ j ].x + ( i - ws / 2 ) * normal.x*alpha_width;
            y = points[ j ].y;
            z = points[ j ].z + ( i - ws / 2 ) * normal.z*alpha_width;
        

        

            xyzSet();
      
            vIdx ++;
            
          
        }
        
    }
  

    g.attributes.position.needsUpdate = true;
    g.attributes.normal.needsUpdate = true;
   
    

    
        // set vertex position
function xyzSet() {
    
    posIdx = vIdx * 3;
    

    g.vertices[ posIdx ]  = x;
    g.vertices[ posIdx + 1 ]  = y;
    g.vertices[ posIdx + 2 ]  = z;

   
    g.normals[ posIdx ]  = 0;
    g.normals[ posIdx + 1 ]  = 1;
    g.normals[ posIdx + 2 ]  = 0;  
    

}



g.n_segments = n_segments;
g.t_curve = curve;


return g;
}

 






        


export {get_road}

let grid = null;

function update_class(c,g,s,al){
   
    c_car = c;
    grid = g;
    scene = s
    alpha = al*scl_cars;


    //// --- loop all over cars and create main car versions for each

    let color = 0xffffff;


//^^INIT
    for(let type=0;type<main_cars.length;type++){



        if(type == 2){
            main_cars[type] = c_car.get_vehicle(type,color)
        
            // l
            const g1 = new THREE.PlaneGeometry(  );
            const plane = new THREE.Mesh( g1, main_matetrial );
            plane.position.y+=0.27 *2
            plane.position.x+=0.203*2
            plane.position.z+=-0.095
            plane.rotateY(Math.PI/2)
            plane.scale.set(1.5*2,0.15*2,1)
            main_cars[type].add(plane)


            // r
            let p2 = plane.clone()
            p2.rotateY(Math.PI)
            p2.position.x+=-0.203*4
            main_cars[type].add(p2)
         



            // f
            let p3 = plane.clone()
            p3.position.set(0,0,0)
            p3.rotation.set(0,0,0)
            p3.position.y+=0.27*2
            p3.position.z+=1.41
            main_cars[type].add(p3)


            // b
            let p4 = p3.clone()
            p4.position.set(0,0.61,-1.81)
            p4.rotateY(Math.PI)
            main_cars[type].add(p4)


            // door
            let p5 = p2.clone()
            p5.position.z = 1.25
            p5.position.y -=0.1
            main_cars[type].add(p5)


        }

        else{
            main_cars[type] = c_car.get_vehicle(type,color)
            let grid = d3_shape(2,2,2)[0]
            let mesh = c_car.get_top2(grid,type,color)
        
            main_cars[type].add(mesh[0])
            // main_cars[type].add(mesh[1])


            
        if(type == 3){ // PICKUP
         
            
            // l
            let g1 = new THREE.PlaneGeometry(  );
            let  p1  = new THREE.Mesh( g1, main_matetrial );
            p1.position.y =0.263
            p1.position.x = 0.2*1
            p1.position.z =-0.30
            p1.rotateY(Math.PI/2)
            main_cars[type].add(p1)


            let p2 = p1.clone()
            p2.position.x = -0.2*1
            p2.rotateY(Math.PI)
            main_cars[type].add(p2)

            let p3 = p2.clone()
            p3.rotateY(Math.PI/2)
            p3.position.set(0,0.263,-0.6)
          
            main_cars[type].add(p3)
        }

        }

    let abc = scl_cars //type == 5 ? 3 : scl_cars;
	main_cars[type].scale.set(al*abc,al*abc,al*abc)
  



    }

   



}

export {update_class}





function get_cars_road_test(g,n_road,forward = true, texture = null ,memo = null,grp = true,q1 = false,cars1 = false){

  
    
 //^^
    let prev_kind = null
  
    let r =  random_pick(nums)


    let sum_limit = 0;

    let wss = (g.vertices.length/3)/(g.n_segments+1)
    

    let cur_dist = 1000

    let c = 3

    let aa = 5

    // choose lane
    vec1.set(g.vertices[n_road*c*aa+0],g.vertices[n_road*c*aa+1],g.vertices[n_road*c*aa+2])
    vec2.set(g.vertices[n_road*c*aa+wss*c+0],g.vertices[n_road*c*aa+wss*c+1],g.vertices[n_road*c*aa+wss*c+2])
    var dir = new THREE.Vector3();


    let get_wly = c_car.get_wly;


    let t1 = q1 ? wss*c*9 : 0
    let t2 = q1 ? wss*c*2: 0

    let vec3 = new THREE.Vector3()
    vec3.set(g.vertices[n_road*c+0],g.vertices[n_road*c+1],g.vertices[n_road*c+2])

    // loop over selected road, put on front if no intersection
    for(let s = n_road*c + t1 ;s<g.vertices.length -t2;s+=wss*c){ ///*** */ optimize latter === add noise sides + front
    
   
        let vec1 = new THREE.Vector3()
        let vec2 = new THREE.Vector3()
        vec1.set(g.vertices[s+0],g.vertices[s+1],g.vertices[s+2])
        vec2.set(g.vertices[s+wss*c+0],g.vertices[s+wss*c+1],g.vertices[s+wss*c+2])

    

   
      
        dir.subVectors( vec1, vec2 ).normalize() 

       



       
       
        let qq = Math.random() > chance_car;
  
      
        if(
            (qq) &&
            (cur_dist > sum_limit) ){
                
                
                
                let res = memo === null ? true : check_collision(vec1,c_car,r,dir,memo)
                if(res!==null){
        
                
                        // console.log("res",res)

                       
                 


                        /// car direction movement
                        let car_dir =  vec2 


                    
                
                        // pos,look direction,kind
                        get_car(vec1,car_dir,c_car,r,texture,grp,forward,cars1) // place car


                        /////////memo update
                        if(memo!==null)
                        memo.push(...res)



                        // update
                        cur_dist = 0
                        // prev_kind = kind;
                        prev_kind = r;
                        
                        r = random_pick(nums)
                
                        sum_limit = (get_wly[prev_kind][1]*0.58 + get_wly[r][1]*0.58 )*alpha ////  scale of car // 0.5
                    }
            }//if




            cur_dist+=vec1.distanceTo(vec2)
      

           
    }



}




export {get_cars_road_test}



function get_car(pos,next_v,class_car,type,mat = null,grp = true,forward = true,cars1 = false){ // pos,width,height,kind 

 

	
    // type = random_pick(nums)

    // if(type!=6)return;
   



    let car_group = main_cars[type]; 


    
    let col1,col2,col3,col4;
 
    
    if(grp){

        if(mat===null){mat = 27}
        
        col1 = get_color_b(mat) //  change latter
        col2 = get_color_b(mat) //  change latter
        col3 = get_color_b(mat) //  change latter
        col4 = get_color_b(mat)
       
    }


    else{ 
         col1 = col2 = col3 = mat 
    }
	car_group.position.set(
		pos.x,
		pos.y,
		pos.z

	)






    
    car_group.lookAt(next_v)

   car_group.position.y+= + y_objs + (cars1 ? -0.18:0)


   if(!forward){
    car_group.rotateY(Math.PI)
   }




   let sub_name = 
   type == 2 ? 'bus': 
   type == 5 ? 'micro':
   'car'

  
        // /////wheels === //pos,quad,color
        for(let i=0;i<4;i++){ 
            
            // console.log("")

            car_group.children[i].getWorldPosition(world_pos)
            car_group.children[i].getWorldQuaternion(world_quat)

            //pos,quad,color
            mesh_containers['wheel'][0].push([
                sub_name,
                world_pos.x,world_pos.y,world_pos.z,
                world_quat.x,
                world_quat.y,
                world_quat.z,
                world_quat.w,
                col1
            ]) 
            // rest // update in a.js == aplha,parameters...
    
        }
    

        // update first
        car_group.children[4].getWorldPosition(world_pos)
        car_group.children[4].getWorldQuaternion(world_quat)


        // console.log("car_nums.get(type)",car_nums.get(type))

        // --body
        mesh_containers[car_nums.get(type)[1]][0].push([
            sub_name,
            world_pos.x,world_pos.y,world_pos.z,
                world_quat.x,
                world_quat.y,
                world_quat.z,
                world_quat.w,
            col2
        ]) 






        if(type!=2){
                // update first
                car_group.children[5].getWorldPosition(world_pos)
                car_group.children[5].getWorldQuaternion(world_quat)

                mesh_containers[car_nums.get(type)[0]][0].push([
                    sub_name,
                    world_pos.x,world_pos.y,world_pos.z,
                        world_quat.x,
                        world_quat.y,
                        world_quat.z,
                        world_quat.w,
                    col3
                ]) 
         }


         //^^
         if(type==2){
           let m =  car_group.children
        //    scene.add(m)
        //    console.log("car_group.children==",car_group.children)


        while(grp && col4 === col2){
            col4 = get_color_b(mat)
        }

        add_container(m[5],'win','win',2.39,0.3,0,world_pos,world_quat,col4,1)
        add_container(m[6],'win','win',2.39,0.3,0,world_pos,world_quat,col4,1)
        add_container(m[7],'win','win',0.6,0.3,0,world_pos,world_quat,col4,1)
        add_container(m[8],'win','win',0.6,0.2,0,world_pos,world_quat,col4,1)
        add_container(m[9],'win','win',0.2,0.4,0,world_pos,world_quat,col4,1)

         }


        //^^
        if(type==3){
        let m =  car_group.children
        //    scene.add(m)
        //    console.log("car_group.children==",car_group.children)
        //
      
        //m[5].rotateY(-Math.PI/2)
        add_container(m[6],'dbl_pln','dbl_pln',0.48,0.1,0,world_pos,world_quat,col4,1)
        add_container(m[7],'dbl_pln','dbl_pln',0.48,0.1,0,world_pos,world_quat,col4,1)
        add_container(m[8],'dbl_pln','dbl_pln',0.315,0.1,0,world_pos,world_quat,col4,1)

     

        }




    

}




// * REPLACE BY LINE VECTORES
// STRIPS + LINES
export {get_car}

function get_cars_road2(g,n_road = 1 , n_lane = null){ 

	
    let prev_kind = null
    // let kind = random_pick(type_cars);
    let sum_limit = 0;

    let wss = (g.vertices.length/3)/(g.n_segments+1)
    

    let cur_dist = 1000

    let n1 = n_lane!==null ? n_lane[0]:null
    let n2 = n_lane!==null ? n_lane[1]:null
    let n_percetage = n_lane!==null ? n_lane[2]:null
    let lane_arr = n_lane!==null ? [] :null

    // GET POINTS OF SELECTED ROAD, CONVERT TO RUM3 AND USE (GetPoints/At ) functions 
    let arr_curve = []
    for(let s = n_road*3, n1_s = n1*3,n2_s = n2*3 ;s<g.vertices.length-1;s+=wss*3,n1_s+=wss*3,n2_s+=wss*3){ ///*** */ optimize latter === add noise sides + front

        let v1 = new THREE.Vector3(g.vertices[s+0],g.vertices[s+1],g.vertices[s+2])
        arr_curve.push(v1)


        // lane_arr = [n1<-%->n2], take % between both. create new arr curve
        if(n_lane!==null){ 
        
            let new_n = new THREE.Vector3(0,0,0)
            let n_v1 = new THREE.Vector3(g.vertices[n1_s+0],g.vertices[n1_s+1],g.vertices[n1_s+2])
            let n_v2 = new THREE.Vector3(g.vertices[n2_s+0],g.vertices[n2_s+1],g.vertices[n2_s+2])

            new_n.lerpVectors(n_v1,n_v2,n_percetage)
            new_n.y+=0.02
            lane_arr.push(new_n)
       
        }


    }

    

    // CREATE CURVE FOR STRIPES

    if(n_lane===null){
      
    let curve = new THREE.CatmullRomCurve3(arr_curve);
     let len_strip = 0.2*alpha;
    
 
    // curve.getSpacedPoints(curve.getLength()/len_strip)); // div raod into equal strip lens (empty,s(x)s,empty,...)
    

    let mat_strip = new THREE.MeshBasicMaterial({color:0xff0000 , side: THREE.DoubleSide })
    let arr_points = curve.getSpacedPoints(curve.getLength()/len_strip);
    for(let s = 1 ;s+4 <arr_points.length;s+=3){ 
        get_box_along_2vectors(arr_points[s+1],arr_points[s+2],-0.5,mat_strip,true)
     
      
    }
    
}


    // CREATE CURVE FOR LINE LANE 
    if(n_lane!==null){ 

        var tg1 = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(lane_arr),
            lane_arr.length,// path segments
            0.1*alpha,// THICKNESS
            8, //Roundness of Tube
            false //closed
          );

    
    // var g1 = new THREE.BufferGeometry().setFromPoints( lane_arr );
    let m1 = new THREE.LineBasicMaterial( { color: 0xffff00 } );
    // let lane = new THREE.Line( g1, m1 );	
    let line1 = new THREE.Line(tg1, m1);
    // scene.add(line1);

    // scene.add(lane)
    
    }



}


// basic strips
// * correct same places as sides lanes
function get_road_strips(g,n_road,num_lanes,alpha,shape){
    let dist = shape[0].distanceTo(shape[1])

    let arr_curve = []
    let wss = num_lanes*2 + 1
    for(let s = n_road*3 ;s<g.vertices.length-1;s+=wss*3){ 
        let v1 = new THREE.Vector3(g.vertices[s+0],g.vertices[s+1],g.vertices[s+2])
        arr_curve.push(v1)
    }


    let curve = new THREE.CatmullRomCurve3(arr_curve);
    let wid_strip = alpha*0.5;

   
    let arr_points = curve.getSpacedPoints(curve.getLength()/(wid_strip*5));
    let step = 3*15








    // ///???????????? *
    for(let s = step ;s+3 <arr_points.length - step;s+=step){ 
        
      

        main_plain.position.set(arr_points[s+2].x,arr_points[s+2].y,arr_points[s+2].z) // middle of 2 vectors, add epsilote to avoid flickerring
        main_plain.lookAt(arr_points[s+3])
        
        main_plain.position.y+=y_objs - 0.19

        main_plain.rotateX(-Math.PI/2)


        add_container(main_plain,'win','win',     wid_strip*2,alpha*4*7,0,world_pos,world_quat,0xffffff,1)


  
      

    }


    /// crossing people
    let pos = [0,arr_points.length-5]
    if(arr_points.length-5>0){
        for(let i=0;i<2;i++){

            main_plain.position.set(arr_points[pos[i]+2].x,arr_points[pos[i]+2].y,arr_points[pos[i]+2].z) // middle of 2 vectors, add epsilote to avoid flickerring
            main_plain.lookAt(arr_points[pos[i]+3])    
            main_plain.position.y+=y_objs
            main_plain.rotateX(-Math.PI/2)
           
    

            add_container(main_plain,'win','win',     wid_strip*2*3,alpha*4*7*3,0,world_pos,world_quat,0xffffff,1, -0.19)

   

        }

    }else{
    
    }
}


export {get_cars_road2,get_road_strips}






function get_cars_road_memo(arr, memo = null,forward = true , texture = null, col_grp = true, chance = null , cars1 = false){

    
    chance = chance == null ? chance_car : chance;
    let prev_kind = null
   
    let r =  random_pick(nums)
    

    let sum_limit = 0;

    

    let cur_dist = 1000

    // let c = 3



    
    let get_wly = c_car.get_wly;
    let res;
    // loop over selected road, put on front if no intersection
    for(let s = 1;s<arr.length-1;s+=1){ 
    
        
        let v1 = arr[s]// 
        let v2 = arr[s+1] //

        var dir = new THREE.Vector3();
        dir.subVectors( v1, v2 ).normalize() 

        

        res = check_collision(v1,c_car,r,dir,memo)
        

        
        // let p = 0
        if(res===null){
            // p = 1
      
          
            continue}


   

   
        // if free space front + if(memo --> no collision in memo )
        if(Math.random()>chance_car){ 

            
            
          
            /// car direction movement
            let car_dir = v2

            // pos,look direction,kind
            get_car(v1,car_dir,c_car,r,texture,col_grp,forward,cars1) // place car

     
            /////////memo update
            memo.push(...res)
       
            // update
            cur_dist = 0
            prev_kind = r;
          
            r = random_pick(nums)
       
            sum_limit = (get_wly[prev_kind][1]/2 + get_wly[r][1]/2 )*alpha ////  scale of car
      
        
            } 

            cur_dist+=v1.distanceTo(v2) // move to the next vertex
    }

}


export {get_cars_road_memo}

/// check points of car with memo if there collision
function check_collision(v,c_car,type,dir,memo){

    let points = get_area_points(type,v,dir,c_car)

    let radious = c_car.get_wly[type][0]*1.6 //1.6

    
    // console.log('radious=',radious,type)

    for(let i = 0;i<memo.length;i++){
    //radious*1*alpha
        for(let j = 0;j<points.length;j++){
            if(memo[i].distanceTo(points[j])<=radious*1*alpha){ // 2 bcz 2 raduis of 2 circles dist
                return null;
            }
        
        }

    }


    // points.forEach(v=>{
    //     get_sphere(v.x,v.y +0.2,v.z,0xff0000,radious*alpha)
    // })

    return points;

}


function get_area_points(type,v,dir,c_car){

	let l = c_car.get_wly[type][1]*alpha*1 //0.9
	let w = c_car.get_wly[type][0]*alpha*1


    

	// let temp = new THREE.Vector3().copy(dir).multiplyScalar(l/2)

	// let f =  new THREE.Vector3().copy(v).add(temp)
	// temp = new THREE.Vector3().copy(dir).multiplyScalar(-l/2)
	// let b =  new THREE.Vector3().copy(v).add(temp)

    //^^
    let v1,v2,n;
    if(type ==2){
        v1 = 0.55
        v2 = 0.4
        n = 4
    }

    if(type == 3){
        v1 = 0.3
        v2 = 0.4
        n = 2

    }   

    if(type != 3 && type != 2){
        v1 = 0.4
        v2 = 0.4
        n = 2
    }

    line.v1 = v.clone().add(dir.clone().multiplyScalar(l*v1))
	line.v2 = v.clone().add(dir.clone().multiplyScalar(-l*v2))

    let points = line.getPoints( n )


  

   
    return points
    // return [v,f,b] // f,b,middle, * change for larger 


}



