import Mixpanel from 'mixpanel'

const token = process.env.MIXPANEL_PROJECT_TOKEN

let mixpanel: Mixpanel.Mixpanel

if (token) {
  mixpanel = Mixpanel.init(token)
  console.log('Mixpanel initialised')
}

export { mixpanel }