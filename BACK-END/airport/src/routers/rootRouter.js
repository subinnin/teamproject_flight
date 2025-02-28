const rootRouter = require("../modules/routerModule")("rootRouter");

rootRouter.route("/").post((req,res)=>{
    const nationRoute = require("../routerRun/nationRoute");
    nationRoute(req,res);
});

module.exports = rootRouter;