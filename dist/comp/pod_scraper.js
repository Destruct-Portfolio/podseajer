import Pup_scraper from "./pup_scraper.js";
import * as fs from "fs";
import ObjectsToCsv from "objects-to-csv";
async function Delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export default class Pod_scraper extends Pup_scraper {
    start;
    constructor(start_at) {
        super();
        this.start = start_at ? start_at : 0;
    }
    async $extract() {
        let podcasts = [];
        if (this.$page !== null) {
            await this.$page.goto("https://app.podseeker.co/", {
                timeout: 0,
                waitUntil: "networkidle2",
            });
            await this.$page.type("#user_email", "wtr-alt7@pm.me", { delay: 100 });
            await this.$page.type("#user_password", "Mdo2@8nv3H!i4BbYWjhHogJxj2Zkqn", { delay: 100 });
            await this.$page.click("#kt-login_signin_submit");
            await this.$page.waitForNavigation();
            await this.$page.click("#kt_content > div > div.podseeker-container.container.search-result > div.row.advanced-search > div.col-sm-12 > a", { delay: 100 });
            await Delay(5000);
            await this.$page.click("#podcast_search > div:nth-child(1) > div:nth-child(1) > div > div > div > span > span.selection > span > ul > li > input", { delay: 100 });
            await this.$page.waitForSelector("#select2-q_podcast_genres_genre_id_in-results>li", { timeout: 30 * 1000 * 1 });
            let categories = fs
                .readFileSync("./categories.txt")
                .toString()
                .split("\n");
            for (var i = 0; i < categories.length; i++) {
                let categorie = categories[i];
                console.log("[+] Searching For :: ", categorie);
                await this.$page.reload({ timeout: 0 });
                if (!categorie.includes(">"))
                    continue;
                await this.$page.type("#podcast_search", categorie);
                await this.$page.click("#kt_content > div > div.podseeker-container.container.search-result > div:nth-child(1) > div > div > button");
                await Delay(5000);
                await this.$page.waitForSelector("#result_query_pod > span");
                let results = await this.$page.evaluate(() => {
                    return document.querySelector("#result_query_pod > span").innerText;
                });
                console.log(results.split(" ")[0]);
                let total_scraped = 0;
                let stage_at = 0;
                while (total_scraped !== parseInt(results.split(" ")[0])) {
                    // scrape the pods
                    let x_d = await this.$page.evaluate(async (x) => {
                        let podcasts = [];
                        let records = Array.from(document.querySelectorAll("div.podcast-info"));
                        console.log(records.length);
                        records.splice(0, x.x);
                        for (let i = 0; i < records.length; i++) {
                            try {
                                //let tem: any = {};
                                const elemen = records[i];
                                let tem = {
                                    name: elemen.querySelector("div.row > div > div.text-truncate").innerText,
                                    img: elemen.querySelector("img").src,
                                    genera: elemen.querySelector("div.row > div:nth-child(2)").innerText.split("\n")[2],
                                    location: elemen.querySelector("div.row > div:nth-child(3)").innerText.split("\n")[2],
                                    active: elemen.querySelector("div.row > div:nth-child(6)").innerText.split("\n")[0],
                                    link: elemen.querySelector("a").href,
                                };
                                console.log(tem);
                                podcasts.push(tem);
                            }
                            catch (err) {
                                console.log(err);
                            }
                        }
                        return podcasts;
                    }, { x: stage_at });
                    console.log(`we have collected : ${x_d.length} Pod`);
                    // scrape the emails from the pods
                    for (let index = 0; index < x_d.length; index++) {
                        let ele = x_d[index];
                        let fd = await this.$page.evaluate(async (x) => {
                            console.log(x.x);
                            let email = x.x;
                            async function displayFileContentsPromise(x) {
                                return fetch(x, {
                                    headers: {
                                        accept: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01",
                                        "accept-language": "en-US,en;q=0.6",
                                        newrelic: "eyJ2IjpbMCwxXSwiZCI6eyJ0eSI6IkJyb3dzZXIiLCJhYyI6IjM3MDcwNjYiLCJhcCI6IjUzNTg5OTEzMiIsImlkIjoiZWE4YzVjMGRkN2ViMDllNiIsInRyIjoiOThhMDAzZjc3Zjg5MDg2NzRiNGM4MTk4YWE1MTZjMDAiLCJ0aSI6MTY5Nzc0MjU4OTI3N319",
                                        "sec-ch-ua": '"Chromium";v="118", "Brave";v="118", "Not=A?Brand";v="99"',
                                        "sec-ch-ua-mobile": "?0",
                                        "sec-ch-ua-platform": '"Windows"',
                                        "sec-fetch-dest": "empty",
                                        "sec-fetch-mode": "cors",
                                        "sec-fetch-site": "same-origin",
                                        "sec-gpc": "1",
                                        traceparent: "00-98a003f77f8908674b4c8198aa516c00-ea8c5c0dd7eb09e6-01",
                                        tracestate: "3707066@nr=0-1-3707066-535899132-ea8c5c0dd7eb09e6----1697742589277",
                                        "x-csrf-token": "pgolJUscpL9kaUgEN9OtUEvD0+Mx4WnO2TLREV8JCTJDIbUIjEltX2iyQp5SGFzKHhKCTtDWIg68nuvv7tJuQA==",
                                        "x-newrelic-id": "VwEHVlZVDhAEUVhSDwYGX1Y=",
                                        "x-requested-with": "XMLHttpRequest",
                                    },
                                    referrer: "https://app.podseeker.co/podcasts",
                                    referrerPolicy: "strict-origin-when-cross-origin",
                                    body: null,
                                    method: "GET",
                                    mode: "cors",
                                    credentials: "include",
                                })
                                    .then((response) => response.text())
                                    .then((text) => {
                                    return text;
                                })
                                    .catch((error) => console.error(error));
                            }
                            let xdr = await displayFileContentsPromise(email);
                            let emails = xdr ? xdr.match(/[\w\.-]+@[\w\.-]+\.\w+/) : null;
                            return emails;
                        }, { x: ele.link });
                        ele.email = fd;
                        console.log(ele);
                    }
                    console.log("We are Here Now ...");
                    // clicking the next btn
                    await this.$page.waitForSelector("#load-more-podcasts").then((x) => {
                        console.log("Element Showed UP ");
                    });
                    await Delay(5000);
                    //await this.$page.click("#load-more-podcasts");
                    await this.$page.evaluate(() => {
                        document.querySelector("#load-more-podcasts").click();
                    });
                    x_d.map((pod) => {
                        podcasts.push(pod);
                    });
                    await Delay(5000);
                    let last_pod = x_d[x_d.length - 1];
                    console.log("******************************LAST PODCAST COLLECETED *******************************");
                    console.log(last_pod);
                    console.log("******************************LAST PODCAST COLLECETED *******************************");
                    if (last_pod !== undefined) {
                        if (last_pod.name === x_d[x_d.length - 1]) {
                            break;
                        }
                    }
                    else {
                        break;
                    }
                    total_scraped = +20;
                    stage_at = stage_at + 20;
                    console.log(podcasts.length);
                    const csv = new ObjectsToCsv(podcasts);
                    console.log(`Going to write :: ${csv.data.length} new podcast`);
                    // Save to file:
                    await csv.toDisk(`./buisness_2.csv`);
                    podcasts = [];
                }
            }
        }
    }
}
