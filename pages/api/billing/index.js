import Subscription from "server/models/Subscription";
import dbConnect from 'server/config/database'

export default async function handler(req, res) {
    await dbConnect()
    // We're mocking userId below. Ideally, get it from your auth module
    const userId = req.query?.userId || 'example_user_id'
    const subscription = await Subscription.getCurrentUserSubscription({
        userId,
    })
    res.json({ subscription });
}
