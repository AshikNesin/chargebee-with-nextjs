import Subscription from "server/models/Subscription";
import dbConnect from 'server/config/database'
import customer from 'server/mocks/customer'

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
    await dbConnect()
    const subscription = await Subscription.getCurrentUserSubscription({
        userId: customer.id,
    })
    res.json({ subscription });
}
