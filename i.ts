import { JSDOM } from 'jsdom'

const main = async () => {
  const a = performance.now()
  const r = await fetch('https://events.princes-trust.org.uk/fundraisers/lunayu/future-steps')
  const b = performance.now()
  const t = await r.text()
  const c = performance.now()

  const dom = new JSDOM(t)
  const d = performance.now()
  const v = dom.window.document.querySelector('.iveRaised > .money > strong')?.textContent
  const e = performance.now()
  console.log(v)

  console.log('fetch', b - a)
  console.log('text', c - b)
  console.log('dom', d - c)
  console.log('query', e - d)
}

main()
