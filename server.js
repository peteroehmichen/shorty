require("dotenv").config();

const express = require("express");
const { getAll, addCode, getURL } = require("./db");
const app = express();

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("./public"));

const sanitizeInput = function (req, res, next) {
    let string = req.body?.fullUrl || req.params?.code;
    if (string) {
        const condition = /[&<>'"`=]/g;
        req.body.sanitizedInput = string.replace(condition, "");
    }
    next();
};

app.get("/", async (req, res) => {
    res.render("overview", {
        layout: "main",
    });
});

app.post("/addCode", sanitizeInput, async (req, res) => {
    try {
        const code = await addCode(req.body.sanitizedInput);
        res.render("overview", {
            layout: "main",
            code,
        });
    } catch (error) {
        console.log("Error while adding Code: ", error);
        res.redirect("/");
    }
});

app.post("/unlock", async (req, res) => {
    try {
        let list;
        if (req.body.password == process.env.ADMIN) {
            const { rows } = await getAll();
            list = rows ? rows : [];
        }
        res.render("overview", {
            layout: "main",
            list,
        });
    } catch (error) {
        console.log("Error while unlocking:", error);
        res.redirect("/");
    }
});

app.get("/:code", sanitizeInput, async (req, res) => {
    try {
        const { rows } = await getURL(req.body.sanitizedInput);
        res.redirect(rows[0]?.original_url || "/");
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.listen(process.env.PORT, () => {
    console.log("URLShortener is running");
});
