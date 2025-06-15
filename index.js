const { faker } = require('@faker-js/faker');
const express = require("express");
const mysql = require("mysql2"); // ✅ FIXED
const path = require("path");
const methodOverride = require("method-override");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));

const getrandomuser = () => {
  return {
    id: faker.string.uuid(),
    username: faker.internet.userName(),  // use userName for older versions
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
};

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // ✅ fixed typo: use → user
  database: 'new',
  password: 'Shivamroy@18'
});

connection.connect((err) => {
  if (err) {
    console.error("Connection failed:", err);
    return;
  }
  console.log("Connected to MySQL!");
  
  // let users = [];
  // for (let i = 0; i < 100; i++) {
  //   let { id, username, email, password } = getrandomuser();
  //   users.push([id, username, email, password]); // ✅ match format for bulk insert
  // }

  // let q = `INSERT INTO user (id, username, email, password) VALUES ?`;

  // connection.query(q, [users], (err, result) => {
  //   if (err) {
  //     console.error("Insert failed:", err);
  //   } else {
  //     console.log("Inserted rows:", result.affectedRows);
  //   }
  //   connection.end(); // Close the connection
  // });
});
app.listen('8080',()=>{
  console.log('listening at port 8080');
})
app.get('/',(req,res)=>{
  let q = `select count(*)from user`;
  try{
    connection.query(q,(err,result)=>{
if(err){
  throw err;
}
let count = result[0]['count(*)'];
res.render('home.ejs',{count});
    });
  }
  catch(err){
    console.log(err);
  }
});
app.get('/show',(req,res)=>{
  let q = `select * from user`;
  try{
    connection.query(q,(err,result)=>{
      res.render("show.ejs",{result});
    });
  }
  catch(err){
    console.log(err);
  }
});
app.get("/post/:id/edit",(req,res)=>{
     let {id } = req.params;
     let q = `Select * from user where id = '${id}'`;
      try{
    connection.query(q,(err,result)=>{
      let user = result[0];
      res.render("edit.ejs",{user});
    });
  }
  catch(err){
    console.log(err);
  }
});
//patch
app.patch("/post/:id", (req, res) => {
    let { id } = req.params;
    let { username: newuser, password: formpass } = req.body; // Destructure and rename for clarity

    // First, retrieve the user to verify the password
    let q1 = `SELECT * FROM user WHERE id = ?`; // Use placeholder for ID

    try {
        connection.query(q1, [id], (err, result) => {
            if (err) {
                console.error("Error fetching user for update:", err);
                return res.status(500).send("Error fetching user data.");
            }

            if (result.length === 0) {
                return res.status(404).send("User not found.");
            }

            let user = result[0];

            // Correct comparison for password
            if (formpass === user.password) { // Use === for strict equality comparison
                // Use a parameterized query for the UPDATE statement to prevent SQL injection
                let q2 = `UPDATE user SET username = ? WHERE id = ?`;

                connection.query(q2, [newuser, id], (err, updateResult) => {
                    if (err) {
                        console.error("Error updating username:", err);
                        return res.status(500).send("Error updating username.");
                    }
                    console.log("Username updated successfully:", updateResult);
                    res.redirect('/show'); // Redirect after successful update
                });
            } else {
                // Return immediately after sending the response
                return res.send('Wrong password');
            }
        });
    } catch (err) {
        console.error("Catch block error during update:", err);
        res.status(500).send("Server error during update operation.");
    }
});

//get

app.get('/user',(req,res)=>{
  res.render('new.ejs');
});
app.post('/postnew',(req,res)=>{
    let{userid , name , email , password} = req.body;
    let user =[];
    user.push([userid, name, email, password]);
    let q = `INSERT INTO user (id, username, email, password) VALUES ?`;

      connection.query(q, [user], (err, result) => {
    if (err) {
      console.error("Insert failed:", err);
    } else {
      console.log("Inserted rows:", result.affectedRows);
      res.send("inserted into database");
    }});
    res.redirect('/show');

});
//delet
app.delete('/post/:id/delete',(req,res)=>{
        let {id} =req.params;
        let q = `Delete from user where id='${id}'`;
        try{
    connection.query(q,(err,result)=>{
      res.redirect('/show');
      console.log(`entry with id this ${id} has been deleted from database`);
    });
  }
  catch(err){
    console.log(err);
  }
        
});