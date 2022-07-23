const user = require("../models/user");
const {nanoid} =require("nanoid");
const { validationResult } = require('express-validator');
const nodemailer = require("nodemailer");
require("dotenv").config();

const registerForm = (req, res) => {
    res.render("register");

};

const loginForm = (req,res) => {
    res.render("login");

};

const registerUser = async(req,res) => {
    const errors = validationResult(req);
    console.log(errors)
    if(!errors.isEmpty()){
        req.flash("mensajes",errors.array());
        console.log("PASE PARA AVISAR WU no ESTOY BIEN")
        return res.redirect("/auth/register")
    }

    const {userName,email,password} = req.body;
    try {
        let usuario = await user.findOne({email: email});
        if(usuario) throw new Error ("Ya existe el usuario")

        usuario = new user({userName,email,password,tokenConfirm: nanoid()})
        console.log(usuario)
        await usuario.save();

        const transporter = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.userMail,
              pass: process.env.passMail
            }
          });

          await transporter.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: usuario.email, // list of receivers
            subject: "Verifica tu cuenta de correo", // Subject line
            html: `<a href="http://localhost:5000/auth/confirmar/${usuario.tokenConfirm}" >Verifica tu cuenta aqui</a>`, // html body
          });
        //res.json(usuario);

        console.log("PASE PARA AVISAR WU ESTOY BIEN")
        req.flash("mensajes",[{ msg: "Por favor verifique su correo para confirmar cuenta" }]);
        res.redirect("/auth/login");

    } catch (error) {
       // console.log(error);
        req.flash("mensajes",[{ msg: error.message }]);
        return res.redirect("/auth/register");
    }
};

const confirmarCuenta = async(req,res) => {

    console.log("HOLA PASE POR AQUI")
    const { token } = req.params;

    try {
        const users = await user.findOne({tokenConfirm: token});
        if(!users) throw new Error("No existe el usuario");

        console.log("okidoki")

        users.cuentaConfirmada = true;
        users.tokenConfirm = null;

        await users.save();

        req.flash("mensajes",[{ msg: "Cuenta verificada, puedes iniciar sesión."}]);

        res.redirect("/auth/login");
        
    } catch (error) {
        console.log("NO FUNCIONA QUE HACES QUI")
        req.flash("mensajes",[{ msg: error.message }]);
        return res.redirect("/auth/login");
    }
};


const loginUser = async(req, res)=> {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash("mensajes",errors.array());
        return res.redirect("/auth/login");
    }

    const {email, password} = req.body;
    try {
        const users = await user.findOne({email})
        if(!users) throw new Error("No existe este email");

        if(!users.cuentaConfirmada) throw new Error("Falta confirmar cuenta");

        if(!await users.comparePassword(password)) throw new Error("Contraseña incorrecta");

        console.log("EXITOOOOOOOOOOOOO")

        // esta creando la sesion del usuario
        req.login(users, function(err){
            if(err) throw new Error("No funciono passport")

            console.log("estoy aqu")
            res.redirect("/");
        })
        

    } catch (error) {
        req.flash("mensajes",[{ msg: error.message }]);
        return res.redirect("/auth/login");
    }

};

const cerrarSesion = (req,res) => {
    req.logout((err) =>{
        if(err) { return next(err);}
        console.log("Bye bebe")
        res.redirect("/auth/login");
    });
};



module.exports = {
    loginForm,
    registerForm,
    registerUser,
    confirmarCuenta,
    loginUser,
    cerrarSesion
}