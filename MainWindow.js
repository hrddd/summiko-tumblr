const {BrowserWindow} = require('electron');
const path = require('path');
const tumblr = require('tumblr.js');
const {blog_name} = require('./config.json');

class MainWindow {
  constructor({consumerKey, consumerSecret, accessToken, accessTokenSecret}) {
    this.windowPath = path.resolve(__dirname, "index.html");
    this.tumblrClient = tumblr.createClient({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      token: accessToken,
      token_secret: accessTokenSecret,
    });
  }

  open() {
    return new Promise((resolve, reject) => {
      this.window = new BrowserWindow({width: 200, height: 125, alwaysOnTop: true, titleBarStyle: 'hidden'});
      this.window.webContents.on('did-finish-load', (event, url) => {
        resolve();
        this.tumblrClient.posts(blog_name, (err, resp) => {
          // dist only gif
          // let gifArray = resp.posts.filter((item) => {
          //   return item['photos'][0]['alt_sizes'][1]['url'].match(/gif/);
          // });
          this.window.webContents.send('posts-load-finish', resp.posts);
        });
      });
      this.window.on('closed', function() {
        this.window = null;
      });
      this.window.loadURL(`file://${this.windowPath}`);
    });
  }
}

module.exports = MainWindow;
