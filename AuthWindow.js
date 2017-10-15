const {ipcMain, BrowserWindow} = require('electron');
const path = require('path');
const {OAuth} = require('oauth');

class AuthWindow {
  constructor({consumerKey, consumerSecret}) {
    this.windowPath = path.resolve(__dirname, "auth.html");

    this.auth = new OAuth(
      'http://www.tumblr.com/oauth/request_token',
      'http://www.tumblr.com/oauth/access_token',
      consumerKey,
      consumerSecret,
      '1.0',
      'http://localhost/',
      'HMAC-SHA1'
    );
  }

  open() {
    this.window = new BrowserWindow({width: 200, height: 125});
    this.window.loadURL(`file://${this.windowPath}`);
    this.window.on('closed', function() {
      this.window = null;
    });

    return new Promise(this.registerAuthCallback.bind(this));
  }

  registerAuthCallback(resolve, reject) {
    ipcMain.on('start-auth', () => {
      this.auth.getOAuthRequestToken((err, oauthToken, oauthTokenSecret, results) => {
        if (err) {
          console.log(err);
          reject();
          return;
        }

        this.window.webContents.on('will-navigate', (event, url) => {
          event.preventDefault();
          const matched = url.match(/\?oauth_token=([^&#]*)&oauth_verifier=([^&#]*)/);
          if (matched === null) {
            reject();
            return;
          }

          this.auth.getOAuthAccessToken(
            oauthToken,
            oauthTokenSecret,
            matched[2],
            (err, oauthAccessToken, oauthAccessTokenSecret, results) => {
              if (err) {
                console.log(err);
                reject();
                return;
              }

              resolve({
                accessToken: oauthAccessToken,
                accessTokenSecret: oauthAccessTokenSecret
              });
            }
          );
        });

        this.window.loadURL(`http://www.tumblr.com/oauth/authorize?oauth_token=${oauthToken}`);
      });
    });
  }

  close() {
    this.window.close();
  }
}

module.exports = AuthWindow;
