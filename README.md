
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

By manipulating each geometry, by its size edges (relative scale), scale z,y,x axises, ,color and quaternion (x,y,z,w), we can generate millions of objects in real time using only 26 geometric instances.



SIMPLIFIED FLOW STAGES:

STAGE 1: GENERATE CITY MAP (GRAPH):
- there are multiple ways to generate a graph, one good algorithm is first we initiate a "moving particle" with certain properties (for example speed, chance of spliting into a new path...), the particle begins to "randomly walk" (with constrains and set of directions), which in the end creates organic city map.
basic example:

**** gif particle



- for this article, i use basic algorithm to create the graph - spliting lines in rectangle shape:
EX1:

![b2](https://user-images.githubusercontent.com/95120906/232340980-f7e387b6-9e65-46ba-a8b3-e2dcc6d59bd1.png)


- each intersection of lines, is a node in the graph == road intersection. 
  * each intersection can be 1 of the 3 types: T intersection, roundabout or open intersection (traingle).
  
- lines between each node are the edges of the graph == road.
  

STAGE 2: FIND POLYGONS CREATED BY ROAD EDGES, AND THE INTERSECTIONS:
EX2: (RED == SIDEWALK + AREA WHICH BUILDING WILL BE CONSTRAINED)

![BL](https://user-images.githubusercontent.com/95120906/232341769-fa966188-c93a-4522-86c5-1e57afe4b59a.png)


STAGE 3: OFFSET INSIDE TO CREATE SIDEWALK (BLUE), OFFSET AGAIN TO CREATE BULDING AREA (RED):

![BL2](https://user-images.githubusercontent.com/95120906/232342102-7e5c54d6-f6a6-4970-bdc6-7fe3ad92a987.png)


STAGE 4: GENERATE BUILDINGS.
each building is a graph by its own. we can manipulating the shape of the graph to give it any shape. 
- spliting the builing area into parts, by lines. each polygon we create has its own features:
1. height, type of windows, height of floors, number of floors and so on... for example if we split the given area:


![bl3](https://user-images.githubusercontent.com/95120906/232342513-6409dfbd-cc57-4274-9c27-74717bdb27a6.png)

each polygon created inside the red area, is part of a building or ground (we can recursivly split it again and again).

STAGE 5: GENERATING ROADS AND TRAFFIC:
- each road has number of lanes, between 4 - 16.
- half of the traffic goes in 1 direction, and the another half vice verse.
-  


















