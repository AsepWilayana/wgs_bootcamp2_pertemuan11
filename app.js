const http = require("http");
const fs = require("fs");
const express = require("express");
var expressLayouts = require("express-ejs-layouts");
const pool = require("./db");
const app = express();
const port = 3000;
var morgan = require("morgan");
const {
  loadContact,
  save_context,
  validateAdd,
  validateUpdate,
  Deletedata,
  Updatedata,
} = require("./kontek");

const { urlencoded } = require("express");
const console = require("console");

app.use(express.json());

// create "middleware"
app.use(morgan("dev"));

app.set("view engine", "ejs");

// untuk membuka/akses image
app.use(express.static("assets/"));
app.use("assets/", express.static("assets/"));

app.use(expressLayouts);
app.set("layout", "layout/layout");

app.use(express.urlencoded({ extended: true }));

app.get("/addasync", async (req, res) => {
  try {
    const name = "asep wilayana";
    const mobile = "083808682474";
    const email = "asep@asep.com";

    const newCont = await pool.query(
      `INSERT INTO contacts values ('${name}','${mobile}','${email}') RETURNING *`
    );
    res.json(newCont);
  } catch (error) {
    console.log(error);
  }
});

// halaman home
app.get("/", (req, res) => {
  const nama = "Asep Wilayana";
  const title = "Web Server EJS";

  const cont = loadContact();

  res.render("index", { nama: nama, title: title, cont });
});

// // halaman contact
// // get semua contact
app.get("/contact", async (req, res) => {
  const title = "Web Server EJS";
  const newCont = await pool.query(`SELECT name, mobile, email FROM contacts;`);
  let respone = "";
  const cont = newCont.rows;
  if (req.query.deleted) respone = "Delete data berhasil";
  if (req.query.updated) respone = "Updated data berhasil";
  if (req.query.add) respone = "Updated data berhasil";
  console.log(newCont.result);
  res.render("contact", { title: title, respone, cont });
});

// halaman add contact
app.get("/contact/add", (req, res) => {
  const title = "Web Server EJS";
  errors = "";
  Errorname = "";
  Erroremail = "";
  Errormobile = "";

  res.render("addContact", {
    title: title,
    errors,
    Errorname,
    Erroremail,
    Errormobile,
  });
});

// fungsi tambah contact
app.post("/contact", validateAdd, async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const mobile = req.body.mobile;
  const title = "Web Server EJS";

  await pool.query(
    `INSERT INTO contacts values ('${name}','${mobile}','${email}')`
  );
  res.redirect("/contact?add=success");
});

// fungsi delete contact
app.get("/delete/:id", async (req, res) => {
  const name = req.params.id;

  await pool.query(`DELETE FROM contacts WHERE name = '${name}';`);

  res.redirect("/contact?deleted=success");
});

// //halaman update contact
app.get("/update/:id", async (req, res) => {
  const title = "Web Server EJS";
  const name = req.params.id;
  const cont = await pool.query(
    `SELECT * FROM contacts WHERE name = '${name}';`
  );
  const contact = cont.rows[0];
  if (!contact) {
    res.status(404).render("error_page", { respone: "page not found : 404" });
  }

  errors = "";
  Errorname = "";
  Erroremail = "";
  Errormobile = "";

  res.render("updateContact", {
    title: title,
    contact,
    errors,
    Errorname,
    Erroremail,
    Errormobile,
  });
});

// // fungsi update
app.post("/:id", validateUpdate, async (req, res) => {
  const name = req.params.id;
  const Newname = req.body.name;
  const Newemail = req.body.email;
  const Newmobile = req.body.mobile;

  await Updatedata(name, Newname, Newemail, Newmobile);
  // res.render("contact", { title: title, cont, respone });
  res.redirect("/contact?updated=success");
});

// get contact by id (detail)
app.get("/contact/:id", async (req, res) => {
  const title = "Web Server EJS";
  const name = req.params.id;
  // const contacts = loadContact();
  // const contact = contacts.find((item) => item.name == name);
  const cont = await pool.query(
    `SELECT * FROM contacts WHERE name = '${name}';`
  );
  const contact = cont.rows[0];
  if (!contact) {
    res.status(404).render("error_page", { respone: "page not found : 404" });
  }
  res.render("detail", { title: title, contact });
});

// halaman about
app.get("/about", (req, res) => {
  const title = "Web Server EJS";
  res.render("about", { title: title });
});

// app.get("/product/:id", (req, res) => {
//   res.send(
//     "product id :" +
//       req.params.id +
//       "<br/>" +
//       "category id :" +
//       req.query.category
//   );
// });
app
  .use("/", (req, res) => {
    res.status(404).send("page not found : 404");
  })

  .listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
