(function () {
  var PIXEL_ID = '996422179485793';
  var CONSENT_KEY = 'meta_ads_consent';
  var started = false;
  var checkoutStarted = false;
  var notice;

  function installPixel() {
    if (started) return;
    started = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('consent', 'grant');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
    window.fbq('track', 'ViewContent', {
      content_name: 'Kit do Professor de Português',
      content_category: 'Infoproduto'
    });
  }

  function setConsent(allowed) {
    try {
      localStorage.setItem(CONSENT_KEY, allowed ? 'granted' : 'denied');
    } catch (error) {
      allowed = false;
    }
    if (allowed) installPixel();
    else if (window.fbq) window.fbq('consent', 'revoke');
    closeNotice();
  }

  function closeNotice() {
    if (notice) notice.remove();
    notice = null;
  }

  function showNotice() {
    if (notice) return;
    notice = document.createElement('section');
    notice.className = 'meta-consent';
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-label', 'Preferências de privacidade');

    var copy = document.createElement('p');
    copy.textContent = 'Usamos cookies de publicidade para medir campanhas. Você pode aceitar ou rejeitar esse rastreamento.';
    var accept = document.createElement('button');
    accept.type = 'button';
    accept.textContent = 'Aceitar';
    accept.addEventListener('click', function () { setConsent(true); });
    var reject = document.createElement('button');
    reject.type = 'button';
    reject.textContent = 'Rejeitar';
    reject.addEventListener('click', function () { setConsent(false); });

    notice.append(copy, accept, reject);
    document.body.appendChild(notice);
  }

  function isCheckoutUrl(value) {
    try {
      var url = new URL(value, window.location.href);
      return url.protocol === 'https:' && (
        url.hostname === 'checkout.wiven.com.br' ||
        url.hostname === 'pay.wiapy.com'
      );
    } catch (error) {
      return false;
    }
  }

  document.addEventListener('click', function (event) {
    if (!window.fbq || checkoutStarted) return;
    var anchor = event.target.closest('a[href]');
    if (!anchor || !isCheckoutUrl(anchor.href)) return;
    checkoutStarted = true;
    var eventData = {
      content_name: anchor.id === 'upsellDecline' ? 'Plano Básico' : 'Kit Completo',
      content_category: 'Infoproduto',
      currency: 'BRL'
    };
    if (anchor.id === 'upsellDecline') eventData.value = 12;
    if (anchor.id === 'upsellAccept') eventData.value = 17.9;
    window.fbq('track', 'InitiateCheckout', eventData);
  });

  var preference = document.createElement('button');
  preference.type = 'button';
  preference.className = 'meta-consent-preferences';
  preference.textContent = 'Privacidade';
  preference.setAttribute('aria-label', 'Alterar preferências de cookies');
  preference.addEventListener('click', showNotice);
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(preference);
    var consent = null;
    try { consent = localStorage.getItem(CONSENT_KEY); } catch (error) {}
    if (consent === 'granted') installPixel();
    else if (consent !== 'denied') showNotice();
  });
})();
