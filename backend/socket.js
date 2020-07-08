utils = require('./utils');

module.exports.init = (io, names, actionHistory, messageHistory, colors) => {
    const fakeMap = [
        {
            id: "0-0",
            color: "#343434",
        },
        {
            id: "1-3",
            color: "#343434",
        },
        {
            id: "4-2",
            color: "#343434",
        },
        {
            id: "5-2",
            color: "#343434",
        }

    ]

    const fakeHistory = [
        "Lance added rail 0-0",
        "Keith added rail 3-3",
        "Gene removed rail 3-3",
        "Lexi pressed Go!",
    ]

    io.on("connection", socket => {
        socket.on("disconnect", data => {
            message = `${names[socket.id]} has disconnected`
            socket.broadcast.emit("broadcast-message", message);
            messageHistory.push(message);
            console.log(message);
        });

        socket.on("rail-clicked", railID => {
            action = `${names[socket.id]} clicked rail ${railID}`;
            rail = {
                id: railID,
                color: colors[socket.id]
            }

            socket.broadcast.emit("new-rail", {
                rail: {
                    id: railID,
                    color: colors[socket.id]
                },
                newHistory: action
            });
            actionHistory.push(action);
            console.log(action);
        });

        socket.on("go-clicked", data => {
            console.log(data);
        });

        socket.on("train-stop", data => {
            console.log(data);
        });

        socket.on("send-name", name => {
            //names[socket.id] = name;
            //colors[socket.id] = utils.chooseRandomColor();

            message = `${names[socket.id]} ${utils.joinMessage()}`;
            socket.broadcast.emit("broadcast-message", message);
            messageHistory.push(message);
            console.log(message);
        });

        socket.on("send-message", data => {
            message = `${names[socket.id]}: ${data}`;
            socket.broadcast("broadcast-message", message);
            messageHistory.push(message);
            console.log(message);
        });
    });
}