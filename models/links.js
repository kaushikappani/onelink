const mongoose = require('mongoose')

const LinkSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },

})

module.exports = mongoose.model('Link', LinkSchema)