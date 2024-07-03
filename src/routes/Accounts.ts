import express from "express";
import prisma from "../controllers/db";
import { authMiddleware } from "../middleware";

const router = express.Router();

router.get("/", authMiddleware, async (req: any, res: any) => {
  try {
    const account = await prisma.account.findUnique({
      where: {
        userId: req.user.userId,
      },
      select: {
        balance: true,
      },
    });

    if (!account) {
      return res.status(404).json({
        error: "Account not found",
      });
    }

    res.status(200).json({
      balance: account.balance,
    });
  } catch (e: any) {
    res.status(500).json({
      error: "Something went wrong",
    });
    console.log(e.message);
  }
});


router.post("/transfer",authMiddleware,async(req:any,res:any)=>{
    try{

        const {amount,receiver} = req.body;
        const sender = req.user.userId;
        
        const senderBalance = await prisma.account.findMany({
            where:{
                userId:sender
            },
            select:{
                balance:true
            }
        })

        const receiverBalance = await prisma.account.findMany({
            where:{
                userId:receiver
            },
            select:{
                balance:true
            }
        })

        if (senderBalance[0].balance < amount){
            return res.status(400).json({
                error:"Insufficient balance"
            })
        }

        await prisma.account.update({
            where:{
                userId:sender
            },
            data:{
                balance:senderBalance[0].balance-amount
            }
        })

        await prisma.account.update({
            where:{
                userId:receiver
            },
            data:{
                balance:receiverBalance[0].balance+amount
            }
        })

        res.status(200).json({
            message:"Transfer successful"
        })

    }catch(e:any){
        console.log(e.message);
        res.status(500).json({
            error:e.message
        })
    }
})

module.exports = router;
