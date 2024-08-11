const express = require("express");
const connectDB = require("./mongoose");
const cors = require("cors"); //per collegare frontend
const noteController = require("./controllers/notesController");
const userController = require("./controllers/usersController");
const app = express();
const port = process.env.PORT;
const verifyToken = require("./middlware/authToken");

app.use(express.json());
app.use(
  cors({
    origin: "https://fullstack-7899a.web.app", //da modificare con il sito
  })
);

connectDB();

app.post("/note", verifyToken, noteController.createNote);
app.get("/note", verifyToken, noteController.getNote);
app.get("/notes", verifyToken, noteController.getAllNotes);
app.put("/note/:id", verifyToken, noteController.updateNote);
app.delete("/note/:postId", verifyToken, noteController.deleteNote);
app.post("/note/:postId/comment", verifyToken, noteController.addComment);
app.delete(
  "/note/:postId/comment/:commentId",
  verifyToken,
  noteController.deleteComment
);
app.post("/like/note/:postId", verifyToken, noteController.addLike);
app.delete("/like/note/:postId", verifyToken, noteController.removeLike);
app.post(
  "/like/note/:postId/comment/:commentId",
  verifyToken,
  noteController.addCommentLike
);
app.delete(
  "/like/note/:postId/comment/:commentId",
  verifyToken,
  noteController.removeCommentLike
);

app.post("/register", userController.registerUser);
app.post("/login", userController.loginUser);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
