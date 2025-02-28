const expressModule = (id, type) =>{
    class ExpressModule {
        constructor( id ) {
            this.id = id;
            this.express = require("express");
        }
        app() {
            return this.express();
        }
        express() {
            return this.express;
        }
    }
    const expressModule = new ExpressModule(id);
    switch(type) {
        case 'app': return expressModule.app(); break;
        case 'express': return expressModule.express(); break;
    }

}

module.exports = expressModule;