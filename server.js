require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

app.use(bodyParser.json({ extended: true, limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 50000,
  })
);

//Setup Mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", (err) => console.log(err.message));
db.on("open", () => console.log("Connected to mongoose"));

//Setup CORS
var whitelist = ["http://localhost:2100", "http://localhost:3000"];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

//Setup Authorization
const { auth, router } = require("./login/routes/auth");

//Setup GraphQl
const { graphqlHTTP } = require("express-graphql");
const { GraphQLSchema } = require("graphql");
const rootQuery = require("./graphql/root-object");

const graphQlSchema = new GraphQLSchema({
  query: rootQuery,
});

app.use(
  "/graphql",
  graphqlHTTP({
    graphiql: true,
    schema: graphQlSchema,
  })
);

//Setup API to upsert data
//HRIS
const departmentRoutes = require("./hris/routes/department");
const divisionRoutes = require("./hris/routes/division");
const employeeRoutes = require("./hris/routes/employee");
const activityRoutes = require("./hris/routes/employee-activity");
const approvalRoutes = require("./hris/routes/approval");

//Login
const roleRoutes = require("./login/routes/role");
const appRoutes = require("./login/routes/app");
const userRoutes = require("./login/routes/user");
const accessRoutes = require("./login/routes/access-role");
const menuRoutes = require("./login/routes/menu");

//Reqruitment
const candidateRoutes = require("./reqruitment/routes/candidate");
const jobRoutes = require("./reqruitment/routes/job");
const applicationRoutes = require("./reqruitment/routes/application");
const questionRoutes = require("./reqruitment/routes/question");
const optionRoutes = require("./reqruitment/routes/option");
const onlineTestRoutes = require("./reqruitment/routes/online-test");

// app.post("/api/auth/:token", auth, (req, res) => {

// })

//HRIS
app.use("/api/department", departmentRoutes);
app.use("/api/division", divisionRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/approval", approvalRoutes);

//Login
app.use("/api/role", auth, roleRoutes);
app.use("/api/app", auth, appRoutes);
app.use("/api/user", auth, userRoutes);
app.use("/api/user", auth, userRoutes);
app.use("/api/access", auth, accessRoutes);
app.use("/api/menu", auth, menuRoutes);
app.use("/api/auth", router);

//Reqruitment
app.use("/api/candidate", candidateRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/option", optionRoutes);
app.use("/api/test", onlineTestRoutes);

app.listen(process.env.PORT || 5000, () => console.log("HRIS running"));
