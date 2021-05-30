if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const { getAll, addCode, getURL } = require("./db");
const app = express();

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("./public"));

app.get("/", async (req, res) => {
    let list = [];
    try {
        const result = await getAll();
        list = result.rows;
    } catch (error) {
        console.log("uncaught error: ", error);
    }
    return res.render("overview", {
        layout: "main",
        list,
    });
});

app.post("/addCode", async (req, res) => {
    try {
        await addCode(req.body.fullUrl);
        res.redirect("/");
    } catch (error) {
        console.log("uncaught error: ", error);
        res.redirect("/");
    }
});

app.get("/:code", async (req, res) => {
    try {
        const { rows } = await getURL(req.params.code);
        res.redirect(rows[0].original_url);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
app.get("*", async (req, res) => {
    res.sendStatus(404);
});

app.listen(process.env.PORT, () => {
    console.log("Shorty is running");
});
