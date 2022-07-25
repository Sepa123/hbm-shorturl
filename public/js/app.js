
document.addEventListener('click', e => {
    if(e.target.dataset.short){
        //console.log("Existe");
        //console.log(e.target.dataset.short)
        const url = `${window.location.origin}/${e.target.dataset.short}`

        navigator.clipboard
        .writeText(url)
        .then(() => {
            console.log("texto copiado en portapapeles");
        }).catch((err) => {
            console.log("algo sale mal", err)
        })
    }
})