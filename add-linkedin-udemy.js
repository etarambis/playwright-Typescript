const { chromium } = require("@playwright/test");
const { spawn } = require("child_process");


(async() => {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chromeArgs = [
        '--remote-debugging-port=9222',
        '--user-data-dir=C:/temp/chrome_debug',
        '--no-first-run'
    ];

    // Llamar al ejecutable directamente sin shell para evitar la advertencia deprecada
    const chrome = spawn(chromePath, chromeArgs, { shell: false });

    await new Promise(r => setTimeout(r, 3_000))

    const browser = await chromium.connectOverCDP("http://127.0.0.1:9222")
    const defaultContext = browser.contexts()[0]
    const page = defaultContext.pages()[0]

    await page.goto("https://www.linkedin.com/mynetwork/")
    
    const allContactBancks = "//h3[contains(.,'Personas del sector «Banca» que podrías conocer')]/ancestor::section[@class='_1584405c d539a08c _30f522bf _6414668d ddf9dd88']//div[@class='_27d29e99 _50839dda _5c38935e']"
    const ocupation = "//p[contains(@class,'a47a5b30 _82e673d8 d46a57f8')]" 
    const connectButton = "//button[contains(.,'Conectar')]"
    const contactName = "//span[contains(@class, 'a049d22c')]/ancestor::div[@class='fc8676fc _66860746 adcdcd5c _4d5bc031 bd1e8f9a b2861596 _919c8987']"

    await page.waitForTimeout(5000)

    for(let i = 0; i < 4; i++ ){
        await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight))
        await page.waitForTimeout(3_000)
    }
    
    const allContacts = await page.locator(allContactBancks).all()
    await allContacts.at(0).scrollIntoViewIfNeeded()
     
    console.log("number the contacts found: " , allContacts.length)

    for (let contact of allContacts){
        let currentRole = await contact.locator(ocupation).textContent()
        console.log(currentRole)

    }
    
     const matches = ["Pichincha", "QA" , "TESTER", "QUALITY"]
     const contactsThatMatch = []

    for(let contact of allContacts){
        let currentRole = await contact.locator(ocupation).textContent().then(x => x.toLocaleLowerCase())
            for(let match of matches){
                if(currentRole.includes(match.toLocaleLowerCase())){
                  contactsThatMatch.push(contact)
                  break
            } 
       }
    }

    
    console.log("End: All contacts the match: ")
    console.log("Contacts that match: ", contactsThatMatch.length)

    for(let contact of contactsThatMatch){

        let currentRole = await contact.locator(ocupation).textContent()
        let currenName = await contact.locator(contactName).textContent()
        await contact.locator(connectButton).click()
        console.log("Contact that match: ", currentRole)
        console.log("Contact Name: ", currenName)
        await page.waitForTimeout(4000)
    }

})
();