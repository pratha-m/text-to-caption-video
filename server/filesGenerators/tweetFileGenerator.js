const tweetHtmlGenerator=(dynamicText)=>{
    const htmlTemplate=`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dummy Tweet</title>
        <link rel="stylesheet" href="styles.css">
        <style>
    body{
        font-family: Arial, sans-serif;
        background-color: #323232;
        margin: 0;
        padding: 0;
        height: 1084px;
        width: 1084px;   
    }
    .tweet {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin: 20px auto;
        padding: 20px;
        display: flex;
        align-items: flex-start;
        height: 1080px;
        width: 1920px;   
    }
    .profile-image {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-right: 20px;
        padding-left: 25px;
        padding-top: 25px;
    }
    .tweet-content {
        flex-grow: 1;
    }
    .profile-info {
        margin-top: 20px;
    }
    .profile-name {
        margin: 0;
        font-size: 22px;
        padding-top: 25px;
    }
    .username {
        color: #888;
        font-size: 20px;
        padding-top: 25px;
    }
    .tweet-text {
        margin: 0;
        font-size: 30px;
        line-height: 1.5;
        padding-top: 50px;
        margin-left: -80px;
    }
    .highlighted{
        background-color: orange;
        border-radius: 5px;
        padding: 3px;
        color: white;
    }
        </style>
    </head>
    <body>
        <div class="tweet">
            <img src="https://cdn.vectorstock.com/i/preview-1x/14/11/round-avatar-icon-symbol-character-image-vector-16831411.jpg" alt="Profile Image" class="profile-image">
            <div class="tweet-content">
                <div class="profile-info">
                    <h2 class="profile-name">John Doe</h2>
                    <span class="username">@johndoe</span>
                </div>
                <p class="tweet-text">${dynamicText}</p>
            </div>
        </div>
    </body>
    </html>`
    return htmlTemplate;
}
module.exports={tweetHtmlGenerator};