const mongoose = require('mongoose')
const dotenv = require("dotenv")
const helmet = require("helmet");
const morgon = require('morgan');
const userRoute = require("./routes/users")
const authRoute = require("./routes/auth")
const postsRoute = require('./routes/posts')
const messageRoute = require('./routes/message')
const conversetionRoute = require('./routes/conv')
const multer = require('multer')
const path = require("path");
const { unlink } = require('fs/promises');
const express = require('express')
const app = express()
const http = require('http').Server(app);
const port = process.env.PORT || 8000;;

const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];
const addUser = (userId,socketId)=>{
 !users.some((user)=>user.userId===userId)
  && users.push({userId,socketId})
  
}
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};
io.on("connection", (socket) => {
  console.log("a user connected.");
  //take user id and socketId from user and pass connected user to the client
  console.log(users)
  socket.on("addUser",(userId)=>{
      addUser(userId,socket.id)
      io.emit("getUsers",users)
  })
  
  //get and send message to the client
  socket.on("sendMessage", async({ senderId, receiverId, text }) => {
      const user = await getUser(receiverId);
      console.log(receiverId)
      console.log(user)
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    });
  

  socket.on("disconnect",()=>{
      console.log("a user Disconnected...! ");
      removeUser(socket.id);
      io.emit("getUsers",users)
  })
});


dotenv.config();

mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false

  }).then(() => {
    console.log(`connected to Mongodb`)
  }).catch((err) => {
    console.log(`connection Fail due to ${err}`)
  })


//middleware
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use(express.json());
app.use(helmet());
app.use(morgon("common"))


const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"public/images");
  },
  filename:(req,file,cb)=>{
    cb(null,req.body.name);
  },

})


const upload = multer({storage:storage});

app.post("/api/upload",upload.single("file"), async(req,res)=>{
  try{
    return res.status(200).json("File uploaded successfully")
  }catch(err){
    console.error(err)
  }
})

app.post("/api/deleteImage",async(req,res)=> {
  try {
    await unlink(`public/images/${req.body.postName}`);
    res.status(200).json(`successfully deleted ${req.body.postname}`);
  }catch(error) {
    res.json(error);
  }
});
app.use("/api/users", userRoute)
app.use("/api/auth", authRoute)
app.use("/api/posts", postsRoute)
app.use("/api/conv",conversetionRoute)
app.use("/api/message",messageRoute)

http.listen(port, () => {
  console.log(`Backend Server is running on port ${port}`)
})

