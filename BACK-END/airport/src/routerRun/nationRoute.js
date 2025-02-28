const nationRoute = (req,res) =>{
    const {nation} = req.body;
    console.log(nation);
    const sql = require("../modules/dbModule")();
    sql.connect((err)=>{
        try {
            console.log(`DB CONNET SUCESS`);
        }catch(err) {
            console.log(`DB CONNET FAIL:${err}`);
        }
    });

    try{
        sql.query(`select * from dashboard_globe where destination="${nation}"`,(err,data)=>{
            if(err) throw err;
            res.send(data);
            console.log(`SEND DB DATA`);
        });
    }catch(err) {
        console.log(`GET DB DATA ERROR:${err}`);
    }
    sql.end();

}

module.exports = nationRoute;