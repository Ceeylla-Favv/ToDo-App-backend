const express = require("express");
const isLoggedIn = require("../middleware/authenticate");
const { createTodo, getAllTodo, getSingleToDo, updateTodo, deleteTodo, getAllUserWithTodos } = require("../controllers/todoController");
const roleMiddleware = require("../middleware/roleMiddleware");
const todoRouter = express.Router();


// Create a new ToDo
todoRouter.route("/create-todo").post([isLoggedIn], createTodo);

// Get all ToDos for the authenticated user
todoRouter.route("/get-all-todo").get([isLoggedIn], getAllTodo);

// Get a single ToDo by ID (only if it belongs to the authenticated user)
todoRouter.route("/get-todo/:id").get([isLoggedIn], getSingleToDo);

// Update a ToDo by ID (only if it belongs to the authenticated user)
todoRouter.route("/update-todo/:id").put([isLoggedIn], updateTodo);

// Delete a ToDo by ID (only if it belongs to the authenticated user)
todoRouter.route("/delete-todo/:id").delete([isLoggedIn], deleteTodo);

// Get all users with their ToDos (Admin only)
todoRouter
  .route("/admin-get-all-todos")
  .get([isLoggedIn], roleMiddleware(["Admin"]), getAllUserWithTodos);

module.exports = todoRouter;
