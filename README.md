
*** LICENSE: CC BY-NC-ND 

# ALGORITHMIC-CITY-PARK-GENERATION

- This is sub project of a larger project of city generation (not finished yet), which generates:

1. city parks
2. buildings
3. traffic & vehciles
4. related objects


* this code is dynamic in real time, and not static. 

This version doesnt include (removed in this version for simplification):
1. pedestrians 
2. bridges
3. sea
4. small objects (for example street objcets)
5. shaders
6. curved roads (outside park)
7. rivers
8. graph generation based on generating on randome lines instead of particles




DETAILS AND OVERVIEW OF THE PROJECT:

1. INSTANCING
*** everything in the scene is composed of one of the building blocks geometries:

let arr_names= [
	'plane','box','cylinder','cone','cone_r','vent_hole','wheel',
	'top0','body0','top1','body1',
	'top2','body2','top3','body3',
	'top4','body4','top5','body5',
	'sphere','win','win_box','dbl_pln','cone_scat',	'top6','body6',
]		

By manipulating each geometry, by its size edges (relative scale), scale z,y,x axises, ,color and quaternion (x,y,z,w), we can generate millions of objects in real time.



SIMPLIFIED FLOW STAGES:

1. GENERATE LINES OR CURVES:
there are multiple options, 2 of them:

- using particles

- using 



















