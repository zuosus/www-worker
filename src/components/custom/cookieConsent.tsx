'use client'

import { useEffect } from 'react'
import 'vanilla-cookieconsent/dist/cookieconsent.css'
import * as CookieConsent from 'vanilla-cookieconsent'

const CookieConsentComponent = () => {
  useEffect(() => {
    void CookieConsent.run({
      onChange: () => {
        window.dispatchEvent(new Event('cc_consent_change'))
      },
      onFirstConsent: () => {
        window.dispatchEvent(new Event('cc_consent_change'))
      },
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom right',
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: 'box',
          position: 'right',
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
      categories: {
        necessary: {
          readOnly: true,
        },
        analytics: {},
      },
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: `Hello traveller, it's cookie time!`,
              description:
                'Our website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <a href="#" data-cc="show-preferencesModal">Let me choose</a>',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Accept necessary',
              showPreferencesBtn: 'Manage preferences',
            },
            preferencesModal: {
              title: 'Preference Manager',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Accept necessary',
              savePreferencesBtn: 'Save preferences',
              closeIconLabel: 'Close',
              sections: [
                {
                  title: 'Cookie Usage',
                  description:
                    'We use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="#">privacy policy</a>.',
                },
                {
                  title: 'Strictly Necessary Cookies',
                  description:
                    'These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly',
                  linkedCategory: 'necessary',
                  cookieTable: {
                    headers: {
                      name: 'Cookie',
                      domain: 'Domain',
                      description: 'Description',
                    },
                    body: [
                      {
                        name: 'cc_cookie',
                        domain: 'notes.zuos.us',
                        description: 'for cookies preferences',
                      },
                    ],
                  },
                },
                {
                  title: 'Performance and Analytics cookies',
                  description:
                    'These cookies allow the website to remember the choices you have made in the past',
                  linkedCategory: 'analytics',
                  cookieTable: {
                    headers: {
                      name: 'Cookie',
                      domain: 'Domain',
                      description: 'Description',
                    },
                    body: [
                      {
                        name: 'auth_token',
                        domain: 'notes.zuos.us',
                        description: 'for features requiring authentication',
                      },
                    ],
                  },
                },
                {
                  title: 'More Information',
                  description:
                    'For any queries in relation to our policy on cookies and your choices, please read our <a href="/legal/user-agreement">User Agreement</a> and <a href="/legal/privacy-policy">Privacy Policy</a>.',
                },
              ],
            },
          },
        },
      },
    })
  }, [])

  return null
}

export default CookieConsentComponent
