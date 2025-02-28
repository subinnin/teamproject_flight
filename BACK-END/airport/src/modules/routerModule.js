const routerModule = (id) =>{
    class RouterModule {
        constructor( id ) {
            this.id = id;
            this.express = require("express");
        }
        createRouter() {
            return this.express.Router();
        }
    }
    const routerModule = new RouterModule(id);
    return routerModule.createRouter();
}

module.exports = routerModule;