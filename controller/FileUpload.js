const express = require('express');
const multer = require('multer');

const fileStorageEngine = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null, './images')
    },
    filename :( )
})
const upload = multer({storage})
