
*** LICENSE: CC BY-NC-ND 

# ALGORITHMIC-CITY-GENERATION


- This is sub project of a larger project of city generation , which generates:

1. city parks
2. buildings
3. traffic & vehciles
4. related objects



## SIMPLIFIED FLOW CHART OF CITY GENERATION

![CHART](https://user-images.githubusercontent.com/95120906/232509199-4397ef32-4ea0-4129-9dfc-46c1cb36bd59.png)



# OVERVIEW:

## 1. INSTANCING
*** everything in the scene is composed of one of the building blocks geometries:

let arr_names= [
	'plane','box','cylinder','cone','cone_r','vent_hole','wheel',
	'top0','body0','top1','body1',
	'top2','body2','top3','body3',
	'top4','body4','top5','body5',
	'sphere','win','win_box','dbl_pln','cone_scat',	'top6','body6',
]		

By manipulating each geometry, by its size edges (relative scale), scale z,y,x axises, ,color and quaternion (x,y,z,w), we can generate millions of objects in real time using only 26 geometric instances.



# FLOW CHART DECONSTRUCTION:

## level 1: GRAPH MAP GENERATION:
 
 ### 1) GENERATE MAP:
- there are multiple ways to generate a graph, one good algorithm is first we initiate a "moving particle" with certain properties (for example speed, chance of spliting into a new paths...), the particle begins to "randomly walk" (with constrains and set of directions), which in the end creates organic city map.
basic example of the idea:

**** gif particle



## for this article, i use basic algorithm to create the graph - spliting lines in rectangle shape:
EX1:

![b2](https://user-images.githubusercontent.com/95120906/232340980-f7e387b6-9e65-46ba-a8b3-e2dcc6d59bd1.png)


 2) FIND INTERSECTIONS AND CREATE GRAPH REPRESENTATION:
- each intersection == graph node == road intersection. 
  * each intersection can be 1 of the 3 types: T intersection, roundabout or open intersection (traingle).
  
- lines between each node are  == edges of the graph == roads.
  
3) FIND POLYGONS INSIDE GRAPH:

EX2: (RED == SIDEWALK + AREA WHICH BUILDING WILL BE CONSTRAINED)

![BL](https://user-images.githubusercontent.com/95120906/232341769-fa966188-c93a-4522-86c5-1e57afe4b59a.png)







## level 2.1: GENERATE ROADS,BRIDGES, TRAFFIC & VEHICLES:

From graph edges --> generate roads.
1. each size road can be differ, namely number of lanes.
2. each intersection of roads, must be connected according to their number of lanes.
3. generate diffrent types of vehciles.
4. vehciles must not overlap (space).
5. vehicles must follow traffic rules and direction.
7. there are traffic phases
6. generate street objects.

 
 
## level 2.2: GENERATE ROAD INTERSECTIONS:
1.there are 3 types: 
- roundabout
- open intersection (traingle)
- T intersection.

2.generate monuments,trees and other objects.


SIMLPLE EXAMPLES TO CLARIFY: 

# EXAMPLE TYPE INTERSECTIONS

![TYPES](https://user-images.githubusercontent.com/95120906/232514595-235a08fd-46fd-4727-8d69-538c6c2757fe.png)




### TRAFFIC CONNECTIONS (RED):

![RA2](https://user-images.githubusercontent.com/95120906/232491760-e224dcfb-4cb4-43d6-9543-f7688e77c09c.png)


###CONNECT DIFFRENT ROAD SIZES (LANES):

![connect_dif_lanes](https://user-images.githubusercontent.com/95120906/232492045-67ffcbea-6724-4f36-8c1f-900371e4beb0.png)


### TRAFFIC PHASES:

![t_pases](https://user-images.githubusercontent.com/95120906/232492207-ed3f68ae-64a3-4d69-b268-d9eb984cbb4d.png)




## level 3: GENERATE NEW AREAS:
1. find intersections of edges of roads and road intersections
2. generate new polygon areas

EX: BASIS MAP:

![BASE](https://user-images.githubusercontent.com/95120906/232516903-2fedbb67-5ed6-4710-a78f-24f59f889e82.jpg)



## level 4: OFFSET AREA, SIDEWALK:
1. offset inwards
2. generate sidewalks
3. generate pedestrains & objects.




## level 5: OFFSET AREA, GENERATE BUILDINGS/PUBLIC SPACES:
1. offset inwards from area level 4.
2. create new areas
3. generate buildings/ public spaces
4. can be recursively reiteriated from stage 2 --> 4 + offseting.


### EX LEVELS 4 & 5: OFFSET INSIDE TO CREATE SIDEWALK (BLUE), OFFSET AGAIN TO CREATE BULDING AREA (RED):

![BL2](https://user-images.githubusercontent.com/95120906/232342102-7e5c54d6-f6a6-4970-bdc6-7fe3ad92a987.png)



### - BUILDINGS.
each building is a graph by its own. we can manipulating the shape of the graph to give it any shape. 
- spliting the builing area into parts, by lines. each polygon we create has its own features:
1. height, type of windows, height of floors, number of floors and so on... for example if we split the given area:


![bl3](https://user-images.githubusercontent.com/95120906/232342513-6409dfbd-cc57-4274-9c27-74717bdb27a6.png)

each polygon created inside the red area, is part of a building or ground (we can recursivly split it again and again).

### - PUBLIC SPACES
1. split area into parts.
2. generate roads/trails.
3. manipulate each part by specific rules
4. generate vehicles,pedestrians, monuments, trees and related object for each part.


### FINALE RESULT:

![F](https://user-images.githubusercontent.com/95120906/232517658-d068aa54-77c2-450a-b92a-245800495cc5.jpg)



### IMPORTANT ALGORITHMS TO MENTION USED IN THE CODE:

1. PERLIN NOISE (https://en.wikipedia.org/wiki/Perlin_noise)
2. SIMPLFY GRAPH (USUALLY USED TO TWIST BUILINGS WALLS AND CORRECT VERY CLOSED/OVERLAPPING ROADS)

EX:
![SIMPLEGRAPH](https://user-images.githubusercontent.com/95120906/232521446-4de5f507-516c-4143-946e-5bddcb7be7a1.png)

3. BUILDING BLOCK INSTANCE, TO GENERATE ANY OBJECT (EACH OBJECT COMPOSED OF MULTIPLE PARTS OF INSTANCES) 
EX:
VEHCILE TYPE OF 'PICKUP' HAS INSTANCE PARTS:
1. 4 WHEELS 
2. BOTTOM BODY
3. TOP BODY
4. WINDOWS
5. ADDITIONS

4. FIND INTERSESCTION:
 - FINDING INTERSETIONS OF 2 LINES.

5. FINDING POLYGONS (OR AREAS) IN UNDIRECTED GRAPH:
- WITH DFS VARIATION:
	1) PICK UNVISITED NODE IN GRAPH
	
	WHILE NODE HAS UNVISITED ADJACENT:
		2) GET UNVISITED ADJACENT NODE WITH THE SMALLEST ANGLE TO THE RIGHT.
		3) REPEAT STEPS 1,2 UNTIL WE REACH VISITED NODE OR REACH NO PATH.
		4) RETURN ON THE PATH, IF WE REACHED VISITED NODE, DELETED THE DIRECTION OF PATH WHILE GOING BACK (DELETING CURRENT ADJACENT NODE ALONG THE PATH)
	
	REPEATE UNTIL WE CANNOT LOOP FURTHER
	
EX:


6.
	
	














