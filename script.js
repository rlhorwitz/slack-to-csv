const luxon = require("luxon");
const users = require("./data/users.json");
const fs = require("fs-extra");

const DATA_PATH = './data';

const jsonToCSV = async (rootDir, parentDir, filename) => {
  const data = await fs.readFile(`${rootDir}/${parentDir}/${filename}`);
  let csvString = "User,Timestamp,Message Text,Attachment(s)\n";
  const messages = JSON.parse(data);
  messages.forEach(message => {
    const user = users.find(user => user.id == message.user);
    csvString += `"${user && user.real_name ? user.real_name : "Unknown User"}","${luxon.DateTime.fromSeconds(parseInt(message.ts)).toRFC2822()}","${message.text}"`;
    if (message.attachments && message.attachments.length > 0) {
      csvString += `"${message.attachments.map(attachment => attachment.original_url).join(',')}"`;
    }
    csvString += '\n';

    const outputFileName = `./output/${parentDir}/${filename.split('.')[0]}.csv`
    fs.outputFile(outputFileName, csvString);
  });
};

const main = async () => {
  const dataDirContents = await fs.readdir(DATA_PATH);
  dataDirContents.forEach(async (item) => {
    const stats = await fs.stat(`${DATA_PATH}/${item}`);
    if (stats.isDirectory()) {
      const jsonFiles = await fs.readdir(`${DATA_PATH}/${item}`);
      jsonFiles.forEach(jsonFile => {
        jsonToCSV(DATA_PATH, item, jsonFile);
      });
    }
  });
}

main();
