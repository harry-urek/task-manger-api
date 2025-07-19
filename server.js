const app = require("./app");
const { ConnectDB } = require("./db/mongoose");
const port = process.env.PORT || 3000;

ConnectDB();

app.listen(port, (err) => {
    if (err) {
        return console.log("Server encountered an Error :", err);
    }
    console.log(`Server is listening on localhost:${port}`);
});