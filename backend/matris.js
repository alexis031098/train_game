class Node{
    constructor(){
        this.rails = {"n": "#FFFFFF", "e": "#FFFFFF", "s": "#FFFFFF", "w": "#FFFFFF"};
    }
}

class Rail{
    constructor(id, color){
        this.id = id;
        this.color = color;
    }
}

const railIDConv = {
    getDirection: function(buttonID){
        return directions[buttonID % 4];
    },
    getColumn: function(buttonID){
        return boxesToGridSize(parseInt(buttonID/4%gridWidth)); //change 3 to width
    },
    getRow: function(buttonID){
        return boxesToGridSize(parseInt(buttonID/4/gridWidth)); //change 3 to width
    },
    getEndpoints: function(buttonID){
        //returns endpoints of the button ID
        let d = this.getDirection(buttonID);
        let row1 = this.getRow(buttonID);
        let column1 = this.getColumn(buttonID);
        let row2 = row1 + locationDelta[d]["row"];
        let column2 = column1 + locationDelta[d]["column"];
        return [[column1, row1], [column2, row2]];
    },
    getID: function(row, column, directionID){
        //takes row and column of center nodes from the matrix/grid. adjust accordingly
        boxRow = (row - 1)/2;
        boxColumn = (column - 1)/2;

        return (boxRow*gridWidth+boxColumn)*4+directionID;
    }
}

var gridHeight = 3;
var gridWidth = 3; //temp variables
const directions = ["n", "e" , "s", "w"];
const directionsReversed = {"n": "s", "e": "w", "s": "n", "w": "e"};
const locationDelta = {"n": {"row": -1, "column": 0}, "e": {"row": 0, "column": 1}, "s": {"row": 1, "column": 0}, "w": {"row": 0, "column": -1}};

function boxesToGridSize(size){
    return 1 + 2*(size);
}

function newMap(grid){
    for(i=0;i<boxesToGridSize(gridHeight);i++){
        let row = [];
        for(j=0;j<boxesToGridSize(gridWidth);j++){
            if(i%2 == 0 && j%2 == 0) row.push("");
            else row.push(new Node());
        }
        grid.push(row);
    }
}

function getMap(grid){
    let modifiedRails = [];

    for(row = 1;row < grid.length;row+=2){
        for(column = 1;column < grid[row].length;column+=2){
            for(d = 0;d < directions.length;d++){
                let color = grid[row][column].rails[directions[d]];
                if(color != "#FFFFFF"){
                    let id = railIDConv.getID(row, column, d);
                    modifiedRails.push(new Rail(id, color));
                } 
            }
        }
    }

    return modifiedRails;
}

function updateMap(coordinatePair, color, grid){
    let railPair = [{row: coordinatePair[0][1], column: coordinatePair[0][0], railDirection: "e"}, {row: coordinatePair[1][1], column: coordinatePair[1][0], railDirection: "e"}];
    let delta = {"column": coordinatePair[0][0]-coordinatePair[1][0], "row": coordinatePair[0][1]-coordinatePair[1][1]};

    for(d in locationDelta){
        if(locationDelta[d]["row"] == delta["row"] && locationDelta[d]["column"] == delta["column"]){
            railPair[0].railDirection = directionsReversed[d];
            railPair[1].railDirection = d;
        }
    }

    let newColor = "#FFFFFF";
    if (grid[railPair[0].row][railPair[0].column].rails[railPair[0].railDirection] == "#FFFFFF") newColor = "#" + color;
    grid[railPair[0].row][railPair[0].column].rails[railPair[0].railDirection] = newColor;
    grid[railPair[1].row][railPair[1].column].rails[railPair[1].railDirection] = newColor;
    console.log(railPair);

    return newColor;
}

function pathfind(grid){
    let direction = "e";
    let route = [];
    let crossed = [];


    //train starts at 1,0
    let row = 1;
    let column = 0;
    let newRow = 1;
    let newColumn = 0;
    crossed.push(grid[row][column]);

    //find end of route
    for(i = true;i;){
        //find next coordinate
        console.log("x: " + column + " y:" + row);
        console.log("\tdirect rail: " + grid[row][column].rails[direction]);
        if(grid[row][column].rails[direction] != "#FFFFFF"){
            console.log("go next");

            newRow += locationDelta[direction]["row"];
            newColumn += locationDelta[direction]["column"];
            
            if(!crossed.includes[grid[newRow][newColumn]]){
                row += locationDelta[direction]["row"];
                column += locationDelta[direction]["column"];
            } else {
                for(d = 0; d < directions.length; d++){
                    if(grid[row][column].rails[directions[d]] != "#FFFFFF" && directionsReversed[directions[d]] != direction){
                        let newRow = row + locationDelta[direction]["row"];
                        let newColumn = column + locationDelta[direction]["column"];
            
                        if(!crossed.includes[grid[newRow][newColumn]]){
                            row = newRow;
                            column = newColumn;
                            direction = directions[d];
                            d = directions.length;
                        }
                    }
                }
            }
        }

        //if next coordinate has already been crossed, terminate loop (end of rail)
        if(grid[row][column].timesCrossed == 0){
            crossed.push(grid[row][column]);
            route.push(direction);
        } else {
            i = false;
        }
    }

    return route;
}


module.exports.init = (io, map, users, actionHistory) => {
    newMap(map);
    
    io.on("connection", socket => {
        console.log("good");

        users[socket.id] = {name: socket.id + "", color: "FF0000"};

        socket.emit("start-up", getMap(map));

        socket.on("rail-clicked", railID => {
            action = `${users[socket.id].name} clicked rail ${railID}`;
            let newColor = updateMap(railIDConv.getEndpoints(railID), users[socket.id].color, map);

            io.sockets.emit("new-rail", {
                rail: {
                    id: parseInt(railID),
                    color: newColor
                },
                newHistory: action
            });
            actionHistory.push(action);
            console.log(action);
        });

        socket.on("go-clicked", data => {
            let path = pathfind(map);
            console.log(path);
            io.sockets.emit("go-clicked", pathfind(map));
            //io.sockets.emit("go-clicked", "hi!");
        });
    });
};
