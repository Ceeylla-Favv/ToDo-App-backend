const ToDo = require("../model/Todo");
const userModel = require("../model/User");

// Create ToDo
const createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required!", success: false });
    }
    const newTodo = new ToDo({
      user: req.user._id,
      title,
      description,
    });
    await newTodo.save();
    return res
      .status(201)
      .json({ message: "ToDo created successfully", newTodo, success: true});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get single ToDo
const getSingleToDo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await ToDo.findById({ _id: id, user: req.user._id });

    if (!todo) {
      return res
        .status(404)
        .json({
          error: "ToDo not found or you're not authorized to view this",
        });
    }

    return res.status(200).json(todo);
  } catch (error) {
    console.error("Error retrieving todo:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all ToDos for a specific user
const getAllTodo = async (req, res) => {
  try {
    const todos = await ToDo.find({ user: req.user._id });
    if(!todos){
      return res.status(404).json({error: "You've not created any todos", success: false})
    }
    res.status(200).send(todos);
  } catch (error) {
    console.error("Error getting all todo", error);
    res.status(500).send(error);
  }
};

// Update a ToDo
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await ToDo.findById({ _id: id, user: req.user._id });

    if (!todo) {
      return res
        .status(404)
        .json({
          error: "ToDo not found or you're not authorized to update this",
        });
    }

    const updatedTodo = await ToDo.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).send(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).send("Internal server error");
  }
};

// Delete a ToDo
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await ToDo.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!todo) {
      return res
        .status(404)
        .json({
          error: "ToDo not found or you're not authorized to delete this",
        });
    }

    return res.status(200).json({ message: "ToDo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).send("Internal server error");
  }
};

// Get all users with their todos
const getAllUserWithTodos = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    const userWithTodos = await Promise.all(
      users.map(async (user) => {
        const todos = await ToDo.find({ userId: user._id });
        return { ...user.toObject(), todos };
      })
    );
    res.status(200).send(userWithTodos);
  } catch (error) {
    console.error("Error getting all users with their todos:", error);
    res.status(500).send(error);
  }
};

module.exports = {
  createTodo,
  getSingleToDo,
  getAllTodo,
  updateTodo,
  deleteTodo,
  getAllUserWithTodos,
};
