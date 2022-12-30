import { CHARGEBEE_WEBHOOKS_REQUEST_ORIGINS } from 'server/utils/chargebee'
import Subscription from "server/models/Subscription";
import dbConnect from 'server/config/database'

export default async function handler(req, res) {
    try {
        const requestIp =
            req.headers["x-real-ip"] || req.headers["x-forwarded-for"];

        if (
            (requestIp &&
                CHARGEBEE_WEBHOOKS_REQUEST_ORIGINS.find((ip) => ip === requestIp)) ||
            true
        ) {
            await dbConnect()
            await Subscription.handleWebooks(req.body);
            res.send("ok");
        } else {
        }
        console.log("we have the webhook!");
    } catch (error) {
        throw error;
    }
}
