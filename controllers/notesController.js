const Note = require("../models/Note")
const User = require("../models/User")
const asyncHandler = require("express-async-handler")

// @desc Get all notes
// @route GET /notes
// @access Private

const getAllNotes = asyncHandler(async (req, res) => {
  // Get all notes from MongoDB
  const notes = await Note.find().lean()

  // If no notes
  if (!notes?.length) {
    return res.status(400).json({ message: "No notes found" })
  }

  // Add username to each note before sending the response
  const notesWithUser = await Promise.all(notes.map(async (note) => {
    const user = await User.findById(note.user).lean().exec()
    // Check if user exists, if not then user = unknown
    let username = "Unknown"
    if (user) {
      username = user.username
    }
    return { ...note, username }
  }))

  res.json(notesWithUser)
})

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body

  // Confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" })
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).collation({ locale: "en", strength: 2 }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" })
  }

  // Create and store new Note
  const note = await Note.create({ user, title, text })

  if (note) { // Created
    res.status(201).json({ message: `New note created` })
  } else {
    res.status(400).json({ message: "Invalid note data received" })
  }
})

// @desc Update note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body

  // Confirm data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" })
  }

  const note = await Note.findById(id).exec()
  console.log("got note")

  if (!note) {
    return res.status(400).json({ message: "Note not found" })
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).collation({ locale: "en", strength: 2 }).lean().exec()

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note title" })
  }

  note.user = user
  note.title = title
  note.text = text
  note.completed = completed

  const updatedNote = await note.save()

  res.json({ message: `${updatedNote.title} updated` })
})

// @desc Delete note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Note ID required" })
  }

  // Confirm note exists to delete
  const note = await Note.findById(id).exec()

  if (!note) {
    return res.status(400).json({ message: "Note not found" })
  }

  await note.deleteOne()

  const reply = `Note ${note.title} with ID ${note._id} deleted`

  res.json(reply)
})

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote
}
