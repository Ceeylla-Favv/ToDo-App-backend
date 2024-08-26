const mongoose = require ('mongoose');
//const {Schema, model} = mongoose;

const todoSchema = new mongoose.Schema({
    title: { type: String, required: true},
    description: {type: String},
    status: {
        type: String, 
        enum: ['Progress', 'Hold','Completed'],
        default: "Progress"
    },
    date: {type: Date},
    user: { type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
},
    {timestamps: true,
})

const ToDo = mongoose.model('ToDo', todoSchema);

module.exports = ToDo;