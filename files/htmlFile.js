const makeHtmlText=(dynamicText)=>{
    const htmlTemplate=`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
                .highlighted{
                    color: red;
                }
            </style>
        </head>
        <body>
            <div id="container">
                ${dynamicText}
            </div>
        </body>
        </html>
    `
    return htmlTemplate;
}

module.exports={makeHtmlText};