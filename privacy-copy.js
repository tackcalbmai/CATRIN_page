/* Plain-language privacy copy. Detailed identifiers stay out of visitor-facing text. */
(() => {
  "use strict";

  const updates = {
    lv: {
      policyDataTitle: "Kādus datus apstrādājam",
      policyDataText: "Kad sazināties ar mums vai piesakāt vizīti, varat norādīt savu vārdu, tālruņa numuru, vēlamo datumu, interesējošo pakalpojumu un komentāru. Vietnē fotogrāfijas netiek augšupielādētas — tās varat pievienot tieši WhatsApp sarakstē.",
      policyPurposeTitle: "Kāpēc šie dati ir vajadzīgi",
      policyPurposeText: "Kontaktinformāciju izmantojam tikai, lai atbildētu uz Jūsu jautājumu, vienotos par vizīti un nodrošinātu saskaņoto pakalpojumu. Vietnes apmeklējuma statistiku izmantojam tikai ar Jūsu piekrišanu, lai saprastu, ko vietnē varam uzlabot.",
      policyStorageTitle: "Datu glabāšana un nodošana",
      policyStorageText: "Datus glabājam tikai tik ilgi, cik nepieciešams saziņai, pakalpojuma nodrošināšanai vai normatīvajos aktos noteikto pienākumu izpildei. Sazinoties ar mums WhatsApp, Instagram vai Facebook, piemērojami arī šo pakalpojumu sniedzēju noteikumi.",
      policyExternalTitle: "Karte un ārējās saites",
      policyExternalText: "Kontaktu lapā pieejama karte, bet saites uz Google Maps, Waze, WhatsApp, Instagram un Facebook atveras attiecīgo pakalpojumu vidē. Uz tiem attiecas konkrētā pakalpojuma privātuma noteikumi.",
      policyCookiesTitle: "Sīkdatnes un vietnes statistika",
      policyCookiesText: "Ar Jūsu piekrišanu izmantojam Google Analytics, lai apkopotā veidā saprastu vietnes apmeklējumu un pilnveidotu tās saturu. Tas nav nepieciešams, lai izmantotu vietni. Savu izvēli jebkurā laikā varat mainīt kājenē, izvēloties “Sīkdatņu iestatījumi”.",
      policyUpdated: "Atjaunots: 2026. gada 11. augustā.",
    },
    ru: {
      policyDataTitle: "Какие данные мы обрабатываем",
      policyDataText: "Когда Вы связываетесь с нами или записываетесь на визит, Вы можете указать имя, номер телефона, желаемую дату, интересующую услугу и комментарий. Фотографии не загружаются на сайт — их можно прикрепить прямо в чате WhatsApp.",
      policyPurposeTitle: "Для чего нужны эти данные",
      policyPurposeText: "Контактные данные используются только для ответа на Ваш вопрос, согласования визита и оказания согласованной услуги. Статистику посещений сайта мы используем только с Вашего согласия, чтобы понимать, что можно улучшить на сайте.",
      policyStorageTitle: "Хранение и передача данных",
      policyStorageText: "Данные хранятся только столько, сколько необходимо для общения, оказания услуги или выполнения требований закона. При общении через WhatsApp, Instagram или Facebook также действуют правила соответствующих сервисов.",
      policyExternalTitle: "Карта и внешние ссылки",
      policyExternalText: "На странице контактов доступна карта, а ссылки на Google Maps, Waze, WhatsApp, Instagram и Facebook открываются в соответствующих сервисах. Для них действуют правила конфиденциальности конкретного сервиса.",
      policyCookiesTitle: "Cookie и статистика сайта",
      policyCookiesText: "С Вашего согласия мы используем Google Analytics, чтобы в обобщённом виде понимать посещаемость сайта и улучшать его содержание. Это не требуется для использования сайта. Свой выбор можно изменить в любое время внизу страницы через «Настройки cookie».",
      policyUpdated: "Последнее обновление: 11 августа 2026 года.",
    },
    en: {
      policyDataTitle: "Data we process",
      policyDataText: "When you contact us or request a visit, you may provide your name, phone number, preferred date, requested service and a note. Photographs are not uploaded to the website — you can attach them directly in a WhatsApp chat.",
      policyPurposeTitle: "Why we use this data",
      policyPurposeText: "We use contact details only to answer your question, arrange a visit and provide the agreed service. We use website visit statistics only with your consent, to understand what we can improve on the website.",
      policyStorageTitle: "Storage and sharing",
      policyStorageText: "We retain data only for as long as necessary to communicate, provide the service or meet legal obligations. When you contact us through WhatsApp, Instagram or Facebook, those services’ terms also apply.",
      policyExternalTitle: "Map and external links",
      policyExternalText: "The contact page offers a map, and links to Google Maps, Waze, WhatsApp, Instagram and Facebook open in the relevant service. Each service’s own privacy terms apply.",
      policyCookiesTitle: "Cookies and website statistics",
      policyCookiesText: "With your consent, we use Google Analytics to understand website visits in aggregate and improve its content. It is not needed to use the website. You can change your choice at any time in the footer through “Cookie settings”.",
      policyUpdated: "Last updated: 11 August 2026.",
    },
  };

  const language = document.documentElement.lang?.toLowerCase().split("-")[0] || "lv";
  Object.assign(window.CATRIN_COPY?.[language] || {}, updates[language] || updates.lv);
})();
