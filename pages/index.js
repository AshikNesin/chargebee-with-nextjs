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
  const [isLoading, setIsLoading] = useState(true)
  const [cbInstance, setCbInstance] = useState(null);

  useEffect(() => {
    let params = (new URL(document.location)).searchParams;
    const queryString = {}
    if (params.get("userId")) {
      queryString.userId = params.get("userId")
    }
    const qs = Object.keys(queryString).map(key => {
      return `${key}=${encodeURIComponent(queryString[key])}`;
    }).join('&');

    fetch(`/api/billing?${qs}`).then(res => res.json()).then(data => {
      setSubscription(data?.subscription)
      setIsLoading(false)
    })
  }, [setSubscription])

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

          let params = (new URL(document.location)).searchParams;

          const queryString = {
            planId,
          }

          if (params.get("userId")) {
            queryString.userId = params.get("userId")
          }

          const qs = Object.keys(queryString).map(key => {
            return `${key}=${encodeURIComponent(queryString[key])}`;
          }).join('&');


          const data = await (await fetch(`/api/billing/generate_checkout_url?${qs}`)).json()
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

  const hasSubscription = !isLoading && subscription !== null

  return (
    <>
      <div style={containerBoxStyle}>
        <h2>Current Subscription Record</h2>
        <span>To set custom <b>userId</b>. You can add userId query string (eg: ?userId=example)</span>
        <pre>{isLoading ? 'fetching data from api' : JSON.stringify(subscription, null, 4)}</pre>
      </div>
      <div style={containerBoxStyle}>
        <h2>Subscribe / Manage your Subscription</h2>
        <button onClick={() => handleCheckout(hasSubscription ? plans.basicYearly : plans.basicMonthly)}> {hasSubscription ? 'Upgrade' : 'Subscribe'}</button>
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
