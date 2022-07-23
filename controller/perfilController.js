const formidable = require( "formidable");
const Jimp =require("jimp");
const path = require("path");
const fs = require("fs");
const user = require("../models/user");


const perfilForm = async(req,res) =>{
    try {
        const usuario = await user.findById(req.user.id);
        res.render("perfil",{user: req.user, imagen: usuario.imagen});
    } catch (error) {
        req.flash("mensajes",[{ msg: "Error al leer el usuario" }]);   
    }   
};

const editarPerfil = async(req,res) =>{
    //return res.json({mensaje:"HOASSSSSSSSSSSS"})
    const form = new formidable.IncomingForm();
    form.maxFileSize = 50 * 1024 * 1024 //50mb

    form.parse(req, async(err, fields, files) =>{
        try {
            if(err){
                //console.log("PNo funcionas")
                throw new Error("No funciona formidable")
            }
            //console.log(fields);
            //console.log(files);

            const file = files.myFile;
            const imageTypes = ["image/jpeg","image/png"];

            if(file.originalFilename === ""){
                //console.log("Porfavor agrege una image")
                throw new Error("Por favor agrege una imagen");
            };
           // if(!(file.mimetype === "image/jpeg" || file.mimetype === "image/png")){
           //     throw new Error("Agrege una imagen .jpeg o .png");
           // };
           if(!imageTypes.includes(file.mimetype)){
            //console.log("Porfavor agrege una imagen jpg o png")
            throw new Error("Agrege una imagen .jpeg o .png");
           };

            if(file.size > 50 * 1024 * 1024){
                //console.log("La imagen excede el tamaño")
                throw new Error("La imagen excede el tamaño");
            };

            const extension = file.mimetype.split("/")[1];
            const dirr = path.join(
                __dirname,
                 `../public/img/perfiles/${req.user.id}.${extension}`);

            fs.renameSync(file.filepath, dirr);

            const image = await Jimp.read(dirr);
            image.resize(200,200).quality(80).writeAsync(dirr);

            const usuario = await user.findById(req.user.id);
            usuario.imagen = `${req.user.id}.${extension}`;
            await usuario.save();

            req.flash("mensajes",[{ msg: "La imagen se subio correctamente" }]);
            //console.log("La imagen se subio correctamente")
            return res.redirect("/perfil");

        } catch (error) {
            req.flash("mensajes",[{ msg: error.message }]);
            console.log(error.message)
            return res.redirect("/perfil");
            
        }
        
    });

};

module.exports = {
    perfilForm,
    editarPerfil
};