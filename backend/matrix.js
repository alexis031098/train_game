//node class containing variable for available rails
//if variable has a non-empty string value, then the corresponding direction can be traversed
class Node{
    constructor(){
        this.rails = {"north": "", "east": "", "south": "", "west": ""};
        this.timesCrossed = 0; //tracks the number of times a node has been crossed by the train; for algo purposes
    }
}

var boxSize = 3;
var gridSize = ( 3 + ( 2*(boxSize - 1) ) );
var direction = "east"; //N E W S; defaults to East;
const directionPriority = ["east", "south", "west", "north"];
const directionReverse = {"north": "south", "east": "west", "south": "north", "west": "east"};
const locationDelta = {"north": {"row": -1, "column": 0}, "east": {"row": 0, "column": 1}, "south": {"row": 1, "column": 0}, "west": {"row": 0, "column": -1}};

var users = {userID: {"name": "", "color": ""}}; //dictionary containing all users and their corresponding usernames and colors
var history = ["username added rail on box#-rail#"]; //string list of all actions previously made
    

var grid = [];
for(i = 0; i < gridSize; i++){
    var row = [];
    for(j = 0; j < gridSize; j++){
        if(i%2 == 0 && j%2 == 0){} //ignore corners to optimize space?
        else row.push(new Node());
    }
    grid.push(row);
}
    //2d array representing the map
    //the row/column of each element also corresponds to its respective coordinate in the map


/*
    pathfind function used to find the route of the train given the activated rails
    tracks directions moved at every step in route array. return array for front-end animation
    
    consider creating a separate 2d array for timesCrossed
        - so multiple synchronous function calls do not conflict with each other??? (modifying the same memory space)
*/
function pathfind(){
    var route = [];

    //train starts at 1,0
    grid[1][0].timesCrossed = 1;
    var row = 1;
    var column = 0;

    //find end of route
    for(i = true;i;){

        //find next coordinate
        if(grid[row][column].rails[direction] != ""){
            newRow += locationDelta[direction]["row"];
            newColumn += locationDelta[direction]["column"];
            
            if(grid[newRow][newColumn].timesCrossed == 0){
                row = newRow;
                column = newColumn;
                route.append(direction);
            } else {
                for(d = 0; d < directionPriority.length; d++){
                    if(grid[row][column].rails[directionPriority[d]] != "" && directionReverse[directionPriority[d]] != direction){
                        newRow += locationDelta[direction]["row"];
                        newColumn += locationDelta[direction]["column"];
            
                        if(grid[newRow][newColumn].timesCrossed == 0){
                            row = newRow;
                            column = newColumn;
                            direction = directionPriority[d];
                            route.append(direction);
                            d = directionPriority.length;
                        }
                    }
                }
            }
        }

        //if next coordinate has already been crossed, terminate loop (end of rail)
        if(grid[row][column].timesCrossed == 0){
            grid[row][column].timesCrossed++;
        } else {
            i = false;
        }
    }

    //reset values can be optimizes using route array to reset specific nodes
    for(i = 0; i < boxSize; i++){
        for(j = 0; j < boxSize; j++){
            grid[i][j].timesCrossed = 0;
        }
    }

    return route;
}