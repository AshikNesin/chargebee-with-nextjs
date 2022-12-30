import chargebee from "chargebee";
import { initChargebee } from 'server/config/chargebee'

initChargebee()
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
    // Ideally, we'll get customer details from our auth module.
    // Here we're hard coding for our convenience since we're not implementing auth module.


    const { planId } = req.query;
    const userId = req.query?.userId || 'example_user_id'

    const payload = {
        subscription: {
            id: userId,
        },
        subscription_items: [
            {
                item_price_id: planId,
                quantity: 1,
            },
        ],
        customer: {
            id: userId,
            email: `${userId}@example.com`
        },
    };

    let hasSubscription = false;

    try {
        const { subscription: currentSubscription } = await chargebee.subscription
            .retrieve(userId)
            .request();

        hasSubscription = Boolean(currentSubscription?.id);
    } catch (error) {
        // Do nothing
    }

    try {
        if (!hasSubscription) {
            // New Checkout
            const result = await chargebee.hosted_page
                .checkout_new_for_items(payload)
                .request();
            res.send(result?.hosted_page);
        } else {
            // Update Checkout
            const result = await chargebee.hosted_page
                .checkout_existing_for_items(payload)
                .request();
            res.send(result?.hosted_page);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ errorMessage: 'Something went down in billing' })
        throw error;
    }
}
