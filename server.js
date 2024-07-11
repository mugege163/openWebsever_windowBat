const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');

// 查找可用端口
function findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
        function testPort(port) {
            const server = http.createServer()
                .listen(port, () => server.close(() => resolve(port)))
                .on('error', (err) => {
                    if (err.code === 'EADDRINUSE') {
                        testPort(port + 1);
                    } else {
                        reject(err);
                    }
                });
        }
        testPort(startPort);
    });
}

// 创建服务器
// 创建服务器
async function startServer() {
  const port = await findAvailablePort(50680);
  const server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);
      let filePath = parsedUrl.pathname;
      
      // 默认首页或处理文件路径
      if(filePath === '/') {
          filePath = '/index.html';
      }
      filePath = path.join(__dirname, filePath);

      // 检查文件是否存在
      fs.exists(filePath, (exists) => {
          if (!exists) {
              // 文件不存在，返回404
              res.writeHead(404);
              res.end('File Not Found');
          } else {
              // 根据文件类型设置Content-Type
              const ext = path.extname(filePath);
              let contentType = 'text/html';
              switch (ext) {
                  case '.js':
                      contentType = 'text/javascript';
                      break;
                  case '.css':
                      contentType = 'text/css';
                      break;
                  case '.json':
                      contentType = 'application/json';
                      break;
                  case '.png':
                  case '.jpg':
                  case '.jpeg':
                      contentType = `image/${ext.replace(/^\./, '')}`;
                      break;
                  // 可以添加更多类型...
              }

              // 读取文件并发送
              fs.readFile(filePath, (err, content) => {
                  if (err) {
                      res.writeHead(500);
                      res.end('Error loading file.');
                  } else {
                      res.writeHead(200, { 'Content-Type': contentType });
                      res.end(content);
                  }
              });
          }
      });
  });

  server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      openInBrowser(port);
  });
}

// 在浏览器中打开网页
function openInBrowser(port) {
    exec(`start http://localhost:${port}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error opening browser: ${error}`);
        }
    });
}

startServer().catch(console.error);