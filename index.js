const { urlencoded } = require("express");
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const user = require("./models/user");
const csrf = require("csurf");
const {create} = require("express-handlebars");
require('dotenv').config();
require('./database/db.js');

const app = express();

app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    name: "secret-name"

}));

app.use(flash());

// configuracion de sesion
app.use(passport.initialize());
app.use(passport.session());

const usuario = user;
passport.serializeUser((user, done) => done(null,{ id: user._id,userName: user.userName, }));

passport.deserializeUser(async(user, done) => {
    const userDB = await usuario.findById(user.id)

    return done(null, { id: userDB._id,userName: userDB.userName, })
})

///

app.get("/mensaje-flash", (req,res) =>{
    res.json(req.flash("mensaje"));
})

app.get("/crear-mensaje", (req,res) =>{
    req.flash("mensaje", "este mensaje es un error");
    res.redirect("/mensaje-flash")
})


const hbs = create({
    extname: ".hbs",
    partialsDir: ["views/components"]
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

// este middleware permite que solo se muestre lo que se encuentra en la ruta
//en este caso la carpeta public. Los middelware reciben la respuesta antes que el cliente
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended:true}));

app.use(csrf());
app.use((req,res,next) =>{
    res.locals.csrfToken = req.csrfToken();
    res.locals.mensajes = req.flash("mensajes");
    next();
});

app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log("Servidor corriendo " + PORT))

