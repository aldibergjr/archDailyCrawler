var request = require('request')
var cheerio = require('cheerio')
const puppeteer = require('puppeteer');
var fs = require('fs');
const { get } = require('request');
const { filter } = require('domutils');
const {climate_definitions} = require("./climateDefinitions")

const search_base_url = "https://www.archdaily.com/search/projects"
//?q=museum&ad_medium=filters

var queryBuilder = async (filters) =>{
    //single
    var result = [];
    var query = search_base_url
    if(filters.color)
        query +=  "/color/" + filters.color
    if(filters.material)
        query += "/materials/" + filters.material
    if(filters.year)
        query += "/year/" + filters.year
    if(filters.area){
        var bounds = filters.area.split("-")
        query += "/min_area/" + bounds[0] + "/max_area/" + bounds[1]
    }
    if(filters.category)
        query += "/categories/"+ filters.category

    let suffix = "?q=" + filters.query + (filters.movement? " " + filters.movement : "");

    //multiple
    if(filters.climate)
    {
        let tempQuery = query;
        climate_definitions[filters.climate].forEach(async (country) => {
            tempQuery+= "/country/" + country
            tempQuery += suffix;
            await queryRunner(tempQuery, 3).then(res =>{
                result = result.concat(res)
            })
        });
    }else{
        query += suffix
        console.log(query)
        await queryRunner(query, 15).then(res => {
            result = res;
        });
    }

    return result;


}

var queryRunner = async (url, execs) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    var plip = await page.waitForSelector(".gridview__item ").then(async ()=>{
       
      
        const DALE = await page.evaluate((ex) => {
            var item = document.querySelectorAll(".gridview > div > .gridview__item ")
            var result = []
            for(let i = 0; i < ex ; i++){
                let projLink = item[i].querySelector("a").href
                let projTitle = item[i].querySelector("a > h3").textContent;
                let projThumb = item[i].querySelector(".ad-swiper > .swiper-container > .swiper-wrapper > .swiper-slide > a > div > img").src
                result.push({projLink, projTitle, projThumb})
            }
            return result;
        }, execs)

        return DALE
       
    })
    
    browser.close();
    return plip;
 
  
   //
}



filters = {
    color: 'green',
    query: 'museum'
}
console.log(queryBuilder(filters).then(res => console.log(res)))

