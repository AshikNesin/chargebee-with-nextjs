const mongoose = require("mongoose");
const { Schema } = mongoose;
import chargebee from "chargebee";
import { initChargebee } from 'server/config/chargebee'

initChargebee()

const subscriptionSchema = new Schema(
  {
    // 👉 Ideally, userId schema will look like below.
    // Since we're not building auth I've commented it our and using plain string instead.
    userId: {
      // type: mongoose.Schema.Types.ObjectId,
      // require: "Please input userId",
      // ref: "User",
      type: String,
      default: null
    },
    chargebeeCustomerId: {
      type: String,
      default: null,
    },
    chargebeeSubscriptionId: {
      type: String,
      default: null,
    },
    chargebeeSubscriptionStatus: {
      type: String,
      default: null,
    },
    chargebeePlanId: {
      type: String,
      default: null,
    },
    metaData: {
      type: Object,
      default: {},
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

class SubscriptionClass extends mongoose.Model {
  static async getCurrentUserSubscription({ userId }) {
    return this.findOne({ userId }).setOptions({
      lean: true,
    });
  }

  static async updateCbCustomer(userId, payload = {}) {
    console.log({ fn: 'updateCbCustomer', userId, payload });

    const modified = {
      chargebeeCustomerId: payload?.customer?.id,
    };

    // updateOne create a new record if not available (option: {upsert: true})
    return this.updateOne(
      { userId },
      modified,
      { upsert: true, runValidators: true }
    ).setOptions({ lean: true });
  }

  static async update(userId, payload = {}) {
    console.log({ fn: 'update', userId, payload });
    const modified = {
      ...payload,
    };
    // updateOne create a new record if not available (option: {upsert: true})
    return this.updateOne(
      { userId },
      modified,
      { upsert: true, runValidators: true }
    ).setOptions({ lean: true });
  }

  static async handleWebooks(payload) {
    try {

      let modified = {};
      const context = payload?.content;
      const eventType = payload?.event_type;
      switch (eventType) {
        case "customer_created":
        case "customer_deleted":
          await this.updateCbCustomer(context?.customer?.id, {
            customer: context?.customer,
          });
          break;
        case "subscription_created":
        case "subscription_cancelled":
        case "subscription_changed":
        case "subscription_renewed": {
          const subscription = context?.subscription;
          modified.chargebeeSubscriptionId = subscription.id;
          modified.chargebeeSubscriptionStatus = subscription.status;
          if (
            subscription.subscription_items &&
            subscription.subscription_items.length
          ) {
            modified.chargebeePlanId =
              context?.subscription.subscription_items[0].item_price_id;
          }
          if (subscription?.meta_data) {
            modified.metaData = subscription.meta_data;
          } else {
            modified.metaData = {};
            modified.metaData.maxSites = 5;
            modified.metaData.maxCustomDomains = 5;
          }

          if (eventType === "subscription_created") {

            await chargebee.subscription
              // TODO: subscription.id
              .update_for_items(subscription?.id, {
                meta_data: {
                  maxSites: 5,
                  maxCustomDomains: 5,
                },
              })
              .request();
          }
          const reply = await this.update(context?.customer?.id, modified);
          console.log(reply);
          break;
        }
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  }
}

subscriptionSchema.loadClass(SubscriptionClass);

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);
