import express from 'express'
import db from '../db.js'

const router = express.Router();

// Get all todos for logged-in user
router.get('/', (req, res) => {
    try{
        const getTodos = db.prepare(`
            SELECT * FROM todos WHERE user_id = ?
            `);
        const todos = getTodos.all(req.userId);

        res.json(todos);
    }
    catch(err){
        console.log(err.message);
        res.sendStatus(503);
    }
});

// Create a new todo
router.post('/', (req, res) => {
    try{
        const { task } = req.body;

        const createTodo = db.prepare(`
            INSERT INTO todos (user_id, task) VALUES (?, ?)
            `);
        const createResult = createTodo.run(req.userId, task);

        res.json({ 
            id: createResult.lastInsertRowid, 
            tasks: task, 
            completed: 0 
        });
    }
    catch(err){
        console.log(err.message);
        res.sendStatus(503);
    }
});

// Update a todo
router.put('/:id', (req, res) => {
    const { completed } = req.body;
    const { id } = req.params;

    const updatedTodo = db.prepare(`
        UPDATE todos SET completed = ? WHERE id = ?
        `);
    updatedTodo.run(completed, id);

    res.json({ message: "Todo completed" });
});

// Delete a todo
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    const deleteTodo = db.prepare(`
        DELETE FROM todos WHERE id = ? AND user_id = ?
        `);
    deleteTodo.run(id, userId);

    res.json({ message: "Todo deleted" });
});

export default router