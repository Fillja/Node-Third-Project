import express from 'express'
import prisma from '../prismaClient.js';

const router = express.Router();

// Get all todos for logged-in user
router.get('/', async (req, res) => {
    try{
        const todos = await prisma.todos.findMany({
            where: {
                userId: req.userId
            }
        })

        res.json(todos);
    }
    catch(err){
        console.log(err.message);
        res.sendStatus(503);
    }
});

// Create a new todo
router.post('/', async (req, res) => {
    try{
        const { task } = req.body;

        const todo = await prisma.todo.create({
            data:{
                task: task,
                userId: req.userId
            }
        });

        res.json({ todo });
    }
    catch(err){
        console.log(err.message);
        res.sendStatus(503);
    }
});

// Update a todo
router.put('/:id', async (req, res) => {
    const { completed } = req.body;
    const { id } = req.params;
    const userId = req.userId;
    
    const updatedTodo = await prisma.todo.update({
        where: {
            id: parseInt(id),
            userId: userId
        },
        data:{
            completed: !!completed
        }
    })

    res.json({ updatedTodo });
});

// Delete a todo
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    const deleted = await prisma.todo.delete({
        where: {
            id: parseInt(id),
            userId: userId
        }
    })
    res.json({ Message: `User ${deleted} was successfully deleted.` });
});

export default router