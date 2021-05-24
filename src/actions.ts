import { Request, Response } from 'express'
import { getRepository } from 'typeorm'  // getRepository"  traer una tabla de la base de datos asociada al objeto
import { Users } from './entities/Users'
import { Exception } from './utils'
import jwt from 'jsonwebtoken'

export const createUser = async (req: Request, res:Response): Promise<Response> =>{

	// important validations to avoid ambiguos errors, the client needs to understand what went wrong
	if(!req.body.first_name) throw new Exception("Please provide a first_name")
	if(!req.body.last_name) throw new Exception("Please provide a last_name")
	if(!req.body.email) throw new Exception("Please provide an email")
	if(!req.body.password) throw new Exception("Please provide a password")

	const userRepo = getRepository(Users)
	// fetch for any user with this email
	const user = await userRepo.findOne({ where: {email: req.body.email }})
	if(user) throw new Exception("Users already exists with this email")

	const newUser = getRepository(Users).create(req.body);  //Creo un usuario
	const results = await getRepository(Users).save(newUser); //Grabo el nuevo usuario 
	return res.json(results);
}

export const getUsers = async (req: Request, res: Response): Promise<Response> =>{
		const users = await getRepository(Users).find();
		return res.json(users);
}

//controlador para el logueo
export const login = async (req: Request, res: Response): Promise<Response> =>{
		
	if(!req.body.email) throw new Exception("Please specify an email on your request body", 400)
	if(!req.body.password) throw new Exception("Please specify a password on your request body", 400)

	const userRepo = await getRepository(Users)

	// We need to validate that a user with this email and password exists in the DB
	const user = await userRepo.findOne({ where: { email: req.body.email, password: req.body.password }})
	if(!user) throw new Exception("Invalid email or password", 401)

	// this is the most important line in this function, it create a JWT token
	const token = jwt.sign({ user }, process.env.JWT_KEY as string, { expiresIn: 60 * 60 });
	
	// return the user and the recently created token to the client
	return res.json({ user, token });
}
