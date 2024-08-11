const Note = require("../models/note");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const createNote = async (req, res) => {
  try {
    const newNote = new Note({ ...req.body, userID: req.userId });
    const savedNote = await newNote.save();
    res.status(201).send(savedNote);
  } catch (err) {
    res.status(400).send(err);
  }
};

const getNote = async (req, res) => {
  try {
    const notes = await Note.find({ userID: req.user.userID });
    res.status(200).send(notes);
  } catch {
    res.status(400).send(err);
  }
};

const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate("userID", "username");
    res.status(200).send(notes);
  } catch (err) {
    res
      .status(400)
      .send({ error: "Error fetching posts", details: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const noteID = req.params.id;
    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteID, userID: req.userId },
      {
        title: req.body.title,
        content: req.body.content,
      },
      {
        new: true,
      }
    );
    res.status(200).send(updatedNote);
  } catch (err) {
    res.status(400).send(err);
  }
};

const deleteNote = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId; // Supponiamo che l'ID dell'utente venga passato come header

    const note = await Note.findById(postId);
    if (!note) {
      return res.status(404).send({ message: "Note not found!" });
    }

    if (note.userID.toString() !== userId) {
      return res
        .status(403)
        .send({ message: "You are not authorized to delete this note!" });
    }

    await Note.findByIdAndDelete(postId);
    res.status(200).send({ message: "Deleted Note!", deletedNote: note });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error deleting note", error: err.message });
  }
};

const addComment = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId; // Assumendo che `req.userId` contenga l'ID dell'utente autenticato

  const { content } = req.body;

  try {
    // Recupera il post dal database
    const post = await Note.findById(postId);

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    // Recupera l'utente dal database usando l'ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Crea un nuovo commento
    const newComment = {
      userID: user._id,
      username: user.username,
      content: content,
      date: new Date(),
    };

    // Aggiungi il commento al post e salva
    post.comments.push(newComment);
    await post.save();

    res.status(201).send(post);
  } catch (err) {
    res.status(400).send(err);
  }
};

const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.userId;

  if (!commentId) {
    return res.status(400).send({ message: "CommentId mancante o non valido" });
  }

  try {
    // Trova il post con i commenti popolati
    const post = await Note.findById(postId).populate("comments.userID");

    if (!post) {
      return res.status(404).send({ message: "Post non trovato" });
    }

    // Trova il commento all'interno del post
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).send({ message: "Commento non trovato" });
    }

    // Verifica se l'utente è autorizzato a eliminare il commento
    if (!comment.userID || comment.userID._id.toString() !== userId) {
      return res
        .status(403)
        .send({ message: "Non sei autorizzato a eliminare questo commento" });
    }

    // Elimina il commento dal post
    post.comments.remove(commentId);
    await post.save();

    res.status(200).send({ message: "Commento eliminato con successo" });
  } catch (err) {
    console.error("Errore durante l'eliminazione del commento:", err);
    res
      .status(500)
      .send({ message: "Errore interno del server", error: err.message });
  }
};

const addLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const note = await Note.findById(postId);

    if (!note) {
      return res.status(404).json({ error: "Nota non trovata" });
    }

    if (note.likedBy.includes(userId)) {
      return res
        .status(400)
        .json({ error: "Hai già messo like a questa nota" });
    }

    note.likes += 1;
    note.likedBy.push(userId);

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    console.error("Errore durante l'aggiunta del like:", error.message);
    res.status(500).json({ error: "Errore del server" });
  }
};

const removeLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const note = await Note.findById(postId);

    if (!note) {
      return res.status(404).json({ error: "Nota non trovata" });
    }

    if (note.likedBy.includes(userId)) {
      note.likes -= 1;
      note.likedBy.remove(userId);
    }

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    console.error("Errore durante l'aggiunta del like:", error.message);
    res.status(500).json({ error: "Errore del server" });
  }
};
const addCommentLike = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.userId;

    const note = await Note.findById(postId);

    if (!note) {
      return res.status(404).json({ error: "Nota non trovata" });
    }

    const comment = note.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Commento non trovato" });
    }

    if (comment.likedBy.includes(userId)) {
      return res
        .status(400)
        .json({ error: "Hai già messo like a questo commento" });
    }

    comment.likes += 1;
    comment.likedBy.push(userId);

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    console.error(
      "Errore durante l'aggiunta del like al commento:",
      error.message
    );
    res.status(500).json({ error: "Errore del server" });
  }
};

const removeCommentLike = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.userId;

    const note = await Note.findById(postId);

    if (!note) {
      return res.status(404).json({ error: "Nota non trovata" });
    }

    const comment = note.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.likedBy.includes(userId)) {
      comment.likes -= 1;
      comment.likedBy = comment.likedBy.filter(
        (id) => id.toString() !== userId
      );
    }

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    console.error("Error removing like from comment:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createNote,
  getNote,
  getAllNotes,
  updateNote,
  deleteNote,
  addLike,
  addComment,
  deleteComment,
  removeLike,
  addCommentLike,
  removeCommentLike,
};
