const stateDataRoute = require("./stateMap");

const constructorMethod = app => {
    // USE taskRoutes ROUTER FOR REQUESTS AT /api/tasks
    app.use("/data/state_national", stateDataRoute);

    app.use("*", (req, res) => {
        res.sendStatus(404);
    });
};

module.exports = constructorMethod;