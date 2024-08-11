const mongoose = require("mongoose");
const User = require("./user");

const noteSchema = new mongoose.Schema({
  username: {
    type: String,
    ref: "User",
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: {
        type: String,
      },
      content: {
        type: String,
      },
      likes: {
        type: Number,
        default: 0,
      },
      likedBy: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Note = mongoose.model("Note", noteSchema);
module.exports = Note;
