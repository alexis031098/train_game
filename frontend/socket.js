const socket = io();
// import {rail_paths} from 'rail_paths.js'

const Socket = {
    sendRail: function(railID) {
        socket.emit("rail-clicked", railID);

        if (railID == 0){
            socket.emit("go-clicked");
        }
    }
}

socket.on("start-up", map => {
    username = prompt("Enter a username");
    for(let i=0;i<map.length;i++){
        console.log("NEW MAP:");
        console.log("\t" + map[i].id + " " + map[i].color);
    socket.emit("send-name", username);
    }
});

socket.on("go-clicked", data => {
    console.log(data);
});

socket.on("new-rail", data => {
    console.log(data.rail.id + "->" + data.rail.color);
});

socket.on("broadcast-message", message => {
    console.log(message);
});