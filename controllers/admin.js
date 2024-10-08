const ToDo = require("../model/Todo");
const userModel = require("../model/User");


const adminDashboard = async(req, res) => {
    try {
        const user = req.user._id
        const getAllUsers = await userModel.findById(user);
        if(!getAllUsers){
            return res.status(404).json({message : "User not found!"})
        }

        const getAllTodos = await ToDo.find({user:getAllUsers})

        return res.status(200).json({user:getAllUsers, allTodos:getAllTodos});

    } catch (error) {
        console.log(error.message)
    }
}


module.exports = adminDashboard