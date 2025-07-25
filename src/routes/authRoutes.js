import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js';

const router = express.Router();

// Register a new user endpoint
router.post('/register', async (req, res) => {
    const {username, password} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    try{
        // Save user to DB
        const user = await prisma.user.create({
            data:{
                username: username,
                password: hashedPassword
            }
        });

        // Create a default todo for the user
        const defaultTodo = "Hello! Add your first todo.";
        await prisma.todo.create({
            data:{
                task: defaultTodo,
                userId: user.id
            }
        });

        // Create a token
        const token = jwt.sign(
            { id: user.id }, 
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

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try{
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        });

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