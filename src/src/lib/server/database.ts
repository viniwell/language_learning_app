import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function register(email: string, username: string, password: string){
    try{
        if (password.length < 5){
            return {status: 400, error: "Weak password"};
        }

        const checkEmail = prisma.user.findUnique({
            where: {email}
        })
        const checkUsername = prisma.user.findUnique({
            where: {username}
        })

        if (await checkEmail) return {status: 400, error: "User with such email already exists"};
        if (await checkUsername) return {status: 400, error: "User with such username already exists"};


        const newUser = await prisma.user.create({
            data: {
                email, username, password
            }
        })

        return {message: "User created successfully", status: 201}

    } catch(error){
        console.log(error);
        return {status: 500, error: "Internal server error"};
    }
}



export async function getUserByCredentials(credential: string, password: string){
    try{

        const checkEmail = await prisma.user.findUnique({
            where: {email: credential, password}
        })
        if (checkEmail) return {status: 200, user: checkEmail};


        const checkUsername = await prisma.user.findUnique({
            where: {username: credential, password}
        })
        if (checkUsername) return {status: 200, user: checkUsername};



        return {error: "No user found", status: 404}

    } catch(error){
        console.log(error);
        return {status: 500, error: "Internal server error"};
    }
}



export async function login(credential: string, password: string){
    try{
        const user = await getUserByCredentials(credential, password);

        if (!user || user.status != 200 || !user.user) return {status: 404, error: "Incorrect credentials"};
     
        const existingSession = await prisma.session.findFirst({
            where: {userId: user.user.id}
        })

        if (existingSession) return {status: 201, sessionId: existingSession.id};

        const newSession = await prisma.session.create({
            data: {userId: user.user.id}
        });

        return {status: 201, sessionId: newSession.id};
        

    } catch(error){
        console.log(error);
        return {status: 500, error: "Internal server error"};
    }
}


export async function getUserById(userId: Number | String){
    try{

        const user = await prisma.user.findUnique({
            where: {id: Number(userId)}
        })

        if(!user) return {error: "No user found", status: 404};


        return {user: user, status: 200}

    } catch(error){
        console.log(error);
        return {status: 500, error: "Internal server error"};
    }
}

export async function getSession(sessionId: Number | String){
    try{

        const session = await prisma.session.findUnique({
            where: {id: Number(sessionId)}
        })

        if(!session) return {error: "No session found", status: 404};


        return {session: session, status: 200}

    } catch(error){
        console.log(error);
        return {status: 500, error: "Internal server error"};
    }
}