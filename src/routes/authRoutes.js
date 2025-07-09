import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const router = express.Router();

// Register a new user endpoint
router.post('/register', (req, res) => {
    const {username, password} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    try{
        // Save user to DB
        const insertUser = db.prepare(`
            INSERT INTO users(username, password)
            VALUES (?, ?)
            `);
        const userResult = insertUser.run(username, hashedPassword);

        // Create a default todo for the user
        const defaultTodo = "Hello! Add your first todo.";
        const insertTodo = db.prepare(`
            INSERT INTO todos(user_id, task)
            VALUES (?,?)
            `);
        insertTodo.run(userResult.lastInsertRowid, defaultTodo);

        // Create a token
        const token = jwt.sign(
            { id: userResult.lastInsertRowid }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({token});
    }
    catch(err){
        console.log(err.message | "Unexpected error occured" );
        res.sendStatus(503);
    }

});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    try{
        const getUser = db.prepare(`
            SELECT * FROM users WHERE username = ?
            `);

        // Get user from db and check if there is one associated with username
        const user = getUser.get(username);
        if(!user){
            return res.status(404).send({message: "User was not found."});
        }

        // Check if password is valid
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if(!passwordIsValid){
            return res.status(401).send({message: "Invalid password."});
        } 

        console.log(user);

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.json({ token });
    }
    catch(err){
        console.log(err.message);
        res.sendStatus(503);
    }
});

export default router