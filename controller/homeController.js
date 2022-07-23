const Url = require("../models/urls");
const { nanoid } = require('nanoid');

const leerUrl = async(req, res) => {
    try {
        const urls = await Url.find({user: req.user.id}).lean()
        res.render("home",  { url:urls });
    } catch (error) {
        //console.log(error);
        //res.send("error");
        req.flash("mensajes",[{ msg: error.message }]);
        return res.redirect("/");
    }
};

const eliminarUrl = async(req,res) => {
    const {id} = req.params
    try {
        //await Url.findByIdAndDelete(id);
        const url = await Url.findById(id);
        if(!url.user.equals(req.user.id)) {
            throw new Error("No es tu Url")
        }

        await url.remove();
        req.flash("mensajes","Url eliminado");

        res.redirect("/");
        
    } catch (error) {
        req.flash("mensajes",[{ msg: error.message }]);
        return res.redirect("/");   
    }
}
const agregarUrl = async(req, res) => {

    const { origin } = req.body;
    var shortUrl = nanoid(10);
    try {
       
        const url = new Url({origin: origin, short: shortUrl, user: req.user.id })
        await url.save()
        req.flash("mensajes",[{ msg: "URL agregada" }]);
        res.redirect("/")
        
    } catch (error) {
        req.flash("mensajes",[{ msg: error.message }]);
        return res.redirect("/");
    }
};

const editarUrl = async(req,res) => {
    const {id} = req.params;
    const {origin} = req.body;
    try {
        const urle = await Url.findById(id);

       if(!urle.user.equals(req.user.id)) {
        throw new Error("No es tu url")
       }

       await urle.updateOne({origin});
       req.flash("mensajes",[{ msg: "Url editada" }]);


        // await Url.findByIdAndUpdate(id, {origin: origin}) 
       res.redirect("/");
    } catch (error) {
        req.flash("mensajes",[{ msg: error.message }]);
        return res.redirect("/");
    }

};

const editarUrlForm = async(req,res) => {
    const {id} = req.params;
    try {
       const urle = await Url.findById(id).lean();

       if(!urle.user.equals(req.user.id)) {
        throw new Error("No es tu url")
    }
       res.render("home", {urle});

    } catch (error) {
        req.flash("mensajes",[{ msg: error.message }]);
        return res.redirect("/");
    }

};

const redireccionamiento = async(req,res) => {
    const {shortURL} = req.params;
    console.log(shortURL);
    try {
        const urlDB = await Url.findOne({short: shortURL})
        res.redirect(urlDB.origin)
    } catch (error) {
        req.flash("mensajes","No existe esta url configurada");
        return res.redirect("/auth/login");
    }


}

module.exports = {
    leerUrl,
    agregarUrl,
    eliminarUrl,
    editarUrl,
    editarUrlForm,
    redireccionamiento
};