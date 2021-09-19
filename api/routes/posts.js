const router = require("express").Router()
const Post = require("../models/Posts")
const User = require("../models/User")

//create Posts
router.post("/", async (req, res) => {
    const newPost = await new Post(req.body)
    try {
        const savePost = await newPost.save()
        res.status(200).json(savePost)
    } catch (err) {
        res.status(500).json(err)
    }
})

// update Posts
router.put("/:id", async (req, res) => {
    const post = await Post.findById(req.params.id)
    if (post.userId === req.body.userId) {
        try {
              await post.updateOne({ $set: req.body });
            res.status(200).json("the post has been updated")

        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json("you can only update your post")
    }
})

// Delete post
router.delete("/:id/delete", async (req, res) => {
    
    try {
      const post = await Post.findById(req.params.id);
      const deletedPost=  await post.deleteOne();
        res.status(200).json(deletedPost);
    } catch (err) {
      res.status(500).json(err);
    }
  });

// like / unlike
router.put("/:id/like", async (req, res) => {
    const post = await Post.findById(req.params.id)
    try {
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("The post has been liked")
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("The post has been Unliked")
        }
    } catch (err) {
        res.status(500).json(err)
    }
})

// get Post 
router.get("/:id", async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(post)

    }catch(err){
        res.status(500).json(err)
    }
})

// get friends all Post on timeline
router.get("/timeline/:userId", async (req, res) => {
    try {
      const currentUser = await User.findById(req.params.userId);
      const userPosts = await Post.find({ userId: currentUser._id });
      const friendPosts = await Promise.all(
        currentUser.followings.map((friendId) => {
          return Post.find({ userId: friendId });
        })
      );
      res.status(200).json(userPosts.concat(...friendPosts))
      res.status(200).json(friendPosts)
    } catch (err) {
      res.status(500).json(err);
    }
  });


  // get User's posts 
router.get('/profile/:username', async (req,res) =>{
    try{
        const user = await User.findOne({username:req.params.username});
        const posts = await Post.find({userId:user._id})
        res.status(200).json(posts)

    }catch(err){
        res.status(500).json(err);
    }
})
  
module.exports = router;
