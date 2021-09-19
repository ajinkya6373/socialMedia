const mongooose = require("mongoose")

const postSchema = new mongooose.Schema({

    userId: {
        type: String,
        require: true
    },
    img: {
        type: String
    },
    desc: {
        type: String,
        max: 500,
    },
    likes: {
        type: Array,
        default: [],
    },
}, {timestamps: true}

)

module.exports=mongooose.model("Posts",postSchema)