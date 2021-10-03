const express = require("express")
const app = express();



app.get('/', (req, res)=>{
    res.send("salve")
})


app.listen(3000, ()=>{
    console.log("a")
});