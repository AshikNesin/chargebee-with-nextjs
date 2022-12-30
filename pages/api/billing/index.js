import Subscription from "server/models/Subscription";
import dbConnect from 'server/config/database'

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
    await dbConnect()
    const userId = req.query?.userId || 'example_user_id'
    const subscription = await Subscription.getCurrentUserSubscription({
        userId,
    })
    res.json({ subscription });
}
