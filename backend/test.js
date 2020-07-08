const obj = {
    func1: function(buttonID){
        return "your socket id is " + buttonID;
    },
    dummy: function(a){
        return a;
    }
}
module.exports.init = (io, actionHistory) => {
    io.on("connection", socket => {
        actionHistory.push(obj.dummy(socket.id));
        console.log("\n" + actionHistory);

        socket.emit("start-up", obj.func1(socket.id));

        socket.on("rail-clicked", railID => {
            io.sockets.emit("new-rail", data = {rail: {id: obj.dummy(actionHistory), color: obj.func1(socket.id)}});
        });
    });
}