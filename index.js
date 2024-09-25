const express = require('express');
const app = express();
const port = 9999;
const fs = require('fs');
const path = require('path');



app.use(express.json());

app.post('/chunk', async (req, res) => {
  try{
    console.log("req",req.body)
       
    let response = { status: false, message: 'Failed to open video file' };
        
      
     const videoPath = path.join(__dirname, 'public');
     // console.log("videoPath",videoPath)
      const mediaId = req.body.media_id
      let media_path =req.body.media_url
      let chunk_size = req.body.chenk_size
      // let total_size =parseInt(event.body.total_size)
     // let media_path = videoPath + '/a5475c64-e848-4adb-ac33-25a779f2303e.mp4'
      // event.body.media_url
      //__dirname + '/a5475c64-e848-4adb-ac33-25a779f2303e.mp4'
      console.log("media_path",media_path)
      
      if (!fs.existsSync(videoPath)) {
         fs.mkdirSync(videoPath, { recursive: true });
     }
     
     const videoMediaPath = path.join(__dirname, 'public',mediaId);

     if (!fs.existsSync(videoMediaPath)) {
         fs.mkdirSync(videoMediaPath, { recursive: true });
     }else{
      // Clean directory
      fs.readdirSync(videoMediaPath).forEach((file) => {
         const filePath = path.join(videoMediaPath, file);
         fs.unlinkSync(filePath);
     });
     }

      const chunkSize = parseInt(chunk_size) * 1024 * 1024; // 30MB
      const sourceFile = fs.openSync(media_path, 'r');
      
      if (sourceFile) {
          let i = 1;
          let chunkFileList = [];
          const buffer = Buffer.alloc(chunkSize);
          let bytesRead;
          
          while ((bytesRead = fs.readSync(sourceFile, buffer, 0, chunkSize, null)) > 0) {
              const chunkFileName = path.join(videoMediaPath, `chunk_${i}.mp4`);
              fs.writeFileSync(chunkFileName, buffer.slice(0, bytesRead));
              chunkFileList.push(chunkFileName);
              i++;
          }

          fs.closeSync(sourceFile);

          // Sort chunk files by creation time
          chunkFileList.sort((a, b) => {
              return fs.statSync(a).ctimeMs - fs.statSync(b).ctimeMs;
          });

          console.log("chunkFileList",chunkFileList)

          console.log('video splitting =>', media_path, 'media_upload', 'response');
          response = { status: true, message: 'Media splitting successfully', files: chunkFileList };
          res.send(response)
      }
      
      }catch(err){
         throw new Error(err)
      }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

