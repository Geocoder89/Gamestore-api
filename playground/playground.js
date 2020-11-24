// const http = require("http");

// const todos = [
//   { id: 1, text: "Todo1" },
//   { id: 2, text: "Todo2" },
//   { id: 3, text: "Todo3" },
// ];
// const server = http.createServer((req, res) => {
//   const { method, url } = req;

//   let body = [];
//   req
//     .on("data", (chunk) => {
//       body.push(chunk);
//     })
//     .on("close", () => {
//       body = Buffer.concat(body).toString();

//       let status = 404;
//       const response = {
//         success: false,
//         data: null,
//       };

//       if (method === "GET" && url === "/todos") {
//         status = 200;
//         response.data = todos;
//         response.success = true;
//       }

//       res.writeHead(status, {
//         "Content-Type": "application/json",
//         "X-Powered-By": "Node.js",
//       });

//       res.end(JSON.stringify(response));
//     });
// });

// const PORT = 5000;

// server.listen(PORT, () => {
//   console.log(`Server is listening on port ${PORT}`);
// });
