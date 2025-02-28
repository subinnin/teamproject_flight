class AirPortService {
    constructor( id ) {
        this.id = id;
        this.app = require("../modules/expressModule")("app","app");
        this.portConfig = require("../config/portConfig");
        this.cors = require("cors");
        this.bodyparser = require("body-parser");
    }
    writeJson() {
        const writejson = require("../writeJson/writeJson");
        writejson();
    }
    serviceReady() {
        this.app.use(this.cors());
        this.app.use(this.bodyparser.json());
        this.app.use(this.bodyparser.urlencoded({extended: true}));
        this.app.set('port',process.env.PORT || this.portConfig.port);
        this.app.listen(this.app.get('port'),()=>{
            console.log(`PORT:${this.app.get('port')} BACK-END Service Start`);
        });
    }
    routerReady() {
        this.app.use("/nation/",require("../routers/rootRouter"));
    }
    run() {
        this.writeJson();
        this.serviceReady();
        this.routerReady();
    }
}

const airPortService = new AirPortService("airPortService");
module.exports = airPortService;