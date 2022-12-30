import Subscription from "server/models/Subscription";
import dbConnect from 'server/config/database'


// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
    await dbConnect()
    const subscription = await Subscription.getCurrentUserSubscription({
        userId: 'example_user_id_2',
    })
    res.json({ subscription });
}
