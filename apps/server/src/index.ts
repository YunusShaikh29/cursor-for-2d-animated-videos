
import express from "express";
import {prisma} from "database/index"
import { Jwt } from "jsonwebtoken";

const app = express()

app.get("/healthy-server", async(req, res) => {
    res.send("healthy server")

    
})

app.listen(8080, () => {
    console.log("server listening on port 8080")
})