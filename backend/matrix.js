//node class containing variable for available rails
//if variable has a non-empty string value, then the corresponding direction can be traversed
class Node{
    constructor(){
        this.rails = {"north": "", "east": "", "south": "", "west": ""};
        this.timesCrossed = 0; //tracks the number of times a node has been crossed by the train; for algo purposes
    }
}


class Rail{
    constructor(id, color){
        this.id = id;
        this.color = color;
    }
}


const idConv = {
    getDirection: function(buttonID){
        return directionPriority[buttonID % 4];
    },
    getColumn: function(buttonID){
        return buttonID/4%3; //change 3 to width
    },
    getRow: function(buttonID){
        return buttonID/4/3; //change 3 to width
    },
    getEndpoints: function(buttonID){
        //returns endpoints of the button ID
        d = this.getDirection(buttonID);
        row1 = this.getRow(buttonID);
        column1 = this.getColumn(buttonID);
        row2 = row1 + locationDelta[d]["row"];
        row2 = row1 + locationDelta[d]["column"];
        return [[column1, row1], [column2, row2]];
    },
    getID: function(row, column, directionID){
        //takes row and column of center nodes from the matrix/grid. adjust accordingly
        boxRow = (row - 1)/2;
        boxColumn = (column - 1)/2;
        width = 3;//temp

        return (bowRow*width+boxCol)*4+directionID;
    }
}

var boxSize = 3;
var gridSize = ( 3 + ( 2*(boxSize - 1) ) );
var direction = "east"; //N E W S; defaults to East
const directionPriority = ["north", "east", "south", "west"];
const directionReverse = {"north": "south", "east": "west", "south": "north", "west": "east"};
const locationDelta = {"north": {"row": -1, "column": 0}, "east": {"row": 0, "column": 1}, "south": {"row": 1, "column": 0}, "west": {"row": 0, "column": -1}};
const endpointsToRailid = {};


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

function getMap(){
    //wip
    var modifiedRails = [];

    for(row = 1;row < grid.length;row+=2){
        for(column = 1;column < grid[i].length;column+=2){
            for(d = 0;d < directionPriority.length;d++){
                let color = grid[row][column].rails[directionPriority[d]];
                if(color != "#FFFFFF"){
                    let id = idConv.getID(row, column, d);
                    modifiedRails.append(new Rail(id, color));
                } 
            }
        }
    }

    return modifiedRails;
}

function updateRails(coordinatePair, socketid){
    //  !  might need to be updated to work with buttonIDs instead of coordinatePairs

    var railPair = [{row = coordinatePair[0][1], column = coordinatePair[0][0], railDirection = "east"}, {row = coordinatePair[0][1], column = coordinatePair[0][0], railDirection = "east"}];
    var delta = {"column": coordinatePair[0][0]-coordinatePair[1][0], "row": coordinatePair[0][1]-coordinatePair[1][1]};

    for (d in locationDelta){
        if(locationDelta[d][row] == delta[row] && locationDelta[d][column] == delta[column]){
            railPair[0].railDirection = d;
            railPair[1].railDirection = directionReverse[d];
        }
    }

    //update matrix to dis/connect rails
    let newRail = ""
    if (grid[railPair[0].row][railPair[0].column].rails[railPair[railDirection]] == "") newRail = users[socketid]["color"];
    grid[railPair[0].row][railPair[0].column].rails[railPair[railDirection]] = newRail;
    grid[railPair[1].row][railPair[1].column].rails[railPair[railDirection]] = newRail;
}

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