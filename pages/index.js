import { useEffect, useState } from "react"
import Script from "next/script";



const containerBoxStyle = { border: 'solid 2px black', maxWidth: '500px', padding: '16px', margin: '16px' }
// Depending on the use case. We might get this from API instead
const plans = {
  basicMonthly: 'cbdemo_basic-USD-monthly',
  basicYearly: 'cbdemo_basic-USD-yearly'
}

export default function Home() {
  const [subscription, setSubscription] = useState(null)
  const [cbInstance, setCbInstance] = useState(null);
  const handleCheckout = (planId) => {
    if (typeof window !== 'undefined') {
      if (!cbInstance && window.Chargebee) {
        setCbInstance(
          window.Chargebee.init({
            site: process.env.NEXT_PUBLIC_CHARGEBEE_DOMAIN,
          })
        );
        return;
      }
      cbInstance?.openCheckout({
        hostedPage: async () => {
          const data = await (await fetch(`/api/billing/generate_checkout_url?planId=${planId}`)).json()
          return data;
        },
        success(hostedPageId) {
          alert("Successfully created/updated subscription")
        },
        close: () => {
          console.log("checkout new closed");
        },
        step(step) {
          console.log("checkout", step);
        },
      });
    }
  };

  useEffect(() => {
    fetch('/api/billing').then(res => res.json()).then(data => {
      setSubscription(data?.subscription)
    })
  }, [setSubscription])

  return (
    <>
      <div style={containerBoxStyle}>
        <h2>Current Subscription Payload</h2>
        <pre>{JSON.stringify(subscription, null, 4)}</pre>
      </div>
      <div style={containerBoxStyle}>
        <h2>Subscribe / Manage your Subscription</h2>
        <button onClick={() => handleCheckout(plans.basicMonthly)}>Subscribe</button>
      </div>
      <Script
        src="https://js.chargebee.com/v2/chargebee.js"
        onLoad={() => {
          setCbInstance(
            window.Chargebee.init({
              site: process.env.NEXT_PUBLIC_CHARGEBEE_DOMAIN,
            })
          );
        }}
      />
    </>
  )
}
