const luxon = require("luxon");
const users = require("./data/users.json");
const fs = require("fs-extra");

const DATA_PATH = './data';

const jsonToCSV = (rootDir, parentDir, filename) => {
    fs.readFile(`${rootDir}/${parentDir}/${filename}`, (readFileErr, data) => {
      let csvString = "User,Timestamp,Message Text,Attachment(s)\n";
      const messages = JSON.parse(data);
      messages.forEach(message => {
          const user = users.find(user => user.id == message.user);
        csvString += `"${user && user.real_name ? user.real_name : "Unknown User"}","${luxon.DateTime.fromSeconds(parseInt(message.ts)).toRFC2822()}","${message.text}"`;
        if(message.attachements && message.attachments.length > 0) {
          csvString += `"${message.attachments.map(attachment => attachment.original_url).join(',')}"`;
        }
        csvString += '\n';

        const outputFileName = `./output/${parentDir}/${filename.split('.')[0]}.csv`
        fs.outputFile(outputFileName, csvString);
      });
    });
};

fs.readdir(DATA_PATH, (dataDirReadErr, items) => {
    items.forEach(item => {
        fs.stat(`${DATA_PATH}/${item}`, (dataDirStatErr, stats) => {
            if (stats.isDirectory()) {
                fs.readdir(`${DATA_PATH}/${item}`, (fileDirReadErr, jsonFiles) => {
                    jsonFiles.forEach(jsonFile => {
                      jsonToCSV(DATA_PATH, item, jsonFile);
                    });
                });
            }
        });
    });
});