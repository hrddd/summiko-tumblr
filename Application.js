const {app, crashReporter} = require('electron');
const AuthWindow = require('./AuthWindow');
const MainWindow = require('./MainWindow');
const {product_name, company_name, consumer_key, consumer_secret} = require('./config.json');

class Application {
  constructor() {
    this.authWindow = new AuthWindow({
      consumerKey: consumer_key,
      consumerSecret: consumer_secret
    });
    this.mainWindow = null;
  }

  run() {
    crashReporter.start({
      productName: product_name,
      companyName: company_name,
      submitURL: './',
      uploadToServer: true
    });
    if(!app) return;
    app.on('window-all-closed', () => {
      if (process.platform != 'darwin') {
        app.quit();
      }
    });

    app.on('ready', () => {
      this.authWindow.open()
        .then(({accessToken, accessTokenSecret}) => {
          this.mainWindow = new MainWindow({
            consumerKey: consumer_key,
            consumerSecret: consumer_secret,
            accessToken: accessToken,
            accessTokenSecret: accessTokenSecret
          });
          return this.mainWindow.open();
        })
        .then(() =>{
          this.authWindow.close();
        });
    });
  }
}

module.exports = Application;
