import prisma from "../controllers/db";

const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();

const signUpBody = zod.object({
    name:zod.string().min(3).max(255),
    email: zod.string().email(),
    password : zod.string().min(6).max(255)
})

router.post("/signup",async(req:any,res:any)=>{
    try{
        // const {success} = signUpBody.parse(req.body);
        // if(!success){
        //    return  res.status(501).json({
        //         error:"Email already taken/invaild input"
        //     })
        // }

        const existingUser = await prisma.user.findUnique({
            where:{
                email:req.body.email
            }
        })

        if(existingUser){
           return res.status(501).json({
                error:"Email already taken"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hashSync(req.body.password,salt);

        const createdUser = await prisma.user.create({
            data:{
                name:req.body.name,
                email:req.body.email,
                password:hashedPassword
            }
        })

        const userid = createdUser.id;

        // create an account for the user
        
        await prisma.account.create({
          data:{
            userId:userid,
            balance : 1 + Math.random()*1000 
          }
        })
       
        const token = jwt.sign({
            userid
        },process.env.JWT_SECRET)




        res.status(200).json({
            message:"User Created Successfully",
            createdUser,
            token
        })

    }catch(err){
        res.status(501).json({
            error:"Something went wrong"
        })
    }
})


router.post("/signin", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        password: true,
        id: true,
      },
    });

    if (!existingUser) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const correctPass = await bcrypt.compare(password, existingUser.password);

    if (!correctPass) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const userid = existingUser.id;

    const token = jwt.sign(
      {
        userid: userid,
      },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      message: "User Logged In Successfully",
      token,
    });
  } catch (e: any) {
    res.status(500).json({
      error: "Something went wrong",
      message: e.message,
    });
    console.log(e);
  }
});


router.put("/update",async(req:any,res:any)=>{
    try{
        const {name,password} = req.body;

        const update = await prisma.user.update({
            where:{
                id:req.user.userid
            },
            data:{
                name,
                password
            }
        })
    }catch(e){
        res.status(501).json({
            error:"Something went wrong"
        })
    }
})


router.get("/",async(req:any,res:any)=>{
    try{

    const filter = req.query.filter;
    const users = await prisma.user.findMany({
        where:{
            name:{
                contains:filter
            }
        }
    })

    res.status(200).json({
        users
    })

    }catch(e:any){
        console.log(e)
        res.status(501).json({
            error:"Something went wrong",
            message:e.message
        })
    }
})


module.exports = router;