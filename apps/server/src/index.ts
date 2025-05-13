
import express from "express";

const app = express()

app.get("/healthy-server", (req, res) => {
    res.send("healthy server")
})

app.listen(8080, () => {
    console.log("server listening on port 8080")
})