import Script from "next/script";

/**
 * GTMScript — Google Tag Manager + all pixel scripts
 * Loads asynchronously, respects consent
 */
export default function GTMScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const lineTagId = process.env.NEXT_PUBLIC_LINE_TAG_ID;
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const twitterPixelId = process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID;

  return (
    <>
      {/* Google Tag Manager */}
      {gtmId && (
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push(
            {'gtm.start':new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}

      {/* Meta/Facebook Pixel */}
      {fbPixelId && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${fbPixelId}');
            fbq('track','PageView');`}
        </Script>
      )}

      {/* LINE Tag */}
      {lineTagId && (
        <Script id="line-tag" strategy="afterInteractive">
          {`(function(g,d,o){
            g._ltq=g._ltq||[];g._lt=g._lt||function(){g._ltq.push(arguments)};
            var h=location.protocol==='https:'?'https://d.line-scdn.net':'http://d.line-cdn.net';
            var s=d.createElement('script');s.async=1;
            s.src=o||h+'/n/line_tag/public/release/v1/lt.js';
            var t=d.getElementsByTagName('script')[0];t.parentNode.insertBefore(s,t);
          })(window,document);
          _lt('init',{customerType:'lap',tagId:'${lineTagId}'});
          _lt('send','pv',['${lineTagId}']);`}
        </Script>
      )}

      {/* TikTok Pixel */}
      {tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
            ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
            ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
            ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
            var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
            var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${tiktokPixelId}');ttq.page();
          }(window,document,'ttq');`}
        </Script>
      )}

      {/* Twitter/X Pixel */}
      {twitterPixelId && (
        <Script id="twitter-pixel" strategy="afterInteractive">
          {`!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
            },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
            a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
            twq('config','${twitterPixelId}');`}
        </Script>
      )}
    </>
  );
}

/**
 * GTMNoScript — noscript fallback for GTM (place after <body>)
 */
export function GTMNoScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
