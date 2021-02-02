const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLID,
  GraphQLFloat,
  GraphQLSkipDirective,
  GraphQLList,
} = require("graphql");

const { getMultipleData, getSingleData } = require("../login/get-data");

const asyncFunction = require("async");
const Division = require("../hris/models/schema/division");
const Department = require("../hris/models/schema/department");
const Employee = require("../hris/models/schema/employee");
const Contract = require("../hris/models/schema/employee-contract");
const Salary = require("../hris/models/schema/employee-salary");
const Activity = require("../hris/models/schema/employee-activity");
const Reimburse = require("../hris/models/schema/employee-reimburse");
const RefApproval = require("../hris/models/schema/ref-approval");
const Approval = require("../hris/models/schema/approval");

const User = require("../login/models/schema/user");
const Role = require("../login/models/schema/role");
const App = require("../login/models/schema/app");
const RoleAccess = require("../login/models/schema/role-access");
const Menu = require("../login/models/schema/menu");

const Candidate = require("../reqruitment/models/schema/candidate");
const Job = require("../reqruitment/models/schema/job");
const JobApplication = require("../reqruitment/models/schema/application");
const Question = require("../reqruitment/models/schema/question");
const Option = require("../reqruitment/models/schema/option");
const OnlineTestDetail = require("../reqruitment/models/schema/online-test-detail");

const {
  employeeObj,
  divisionObj,
  employeeSalaryObj,
  employeeContractObj,
  employeeActivityObj,
  employeeReimburseObj,
  refApprovalObj,
  approvalObj,
  departmentObj,
  user,
  role,
  app,
  accessRole,
  menu,
  questionObj,
  optionObj,
  jobObj,
  jobApplicationObj,
  candidateObj,
  testObj,
} = require("./data-object");

const rootQuery = new GraphQLObjectType({
  name: "RootQuery",
  description: "Root Query",
  fields: () => ({
    divisions: {
      type: GraphQLList(divisionObj),
      description: "Get Multiple Data Divisions",
      args: {
        keyword: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        return await Division.find({ name: new RegExp(args.keyword, "i") });
      },
    },
    departments: {
      type: GraphQLList(departmentObj),
      description: "Get Multiple Data Departments",
      args: {
        keyword: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        return await Department.find({ name: new RegExp(args.keyword, "i") });
      },
    },
    employees: {
      type: GraphQLList(employeeObj),
      description: "Get Multiple Data Employees",
      args: {
        keyword: { type: GraphQLString },
        division: { type: GraphQLString },
        department: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const search = {
          $or: [
            { employeeId: new RegExp(args.keyword, "i") },
            // { identityNumber: new RegExp(args.keyword, 'i') },
            { email: new RegExp(args.keyword, "i") },
            { name: new RegExp(args.keyword, "i") },
          ],
        };
        if (args.division !== null && args.division !== undefined)
          search.division = args.division;
        if (args.department !== null && args.department !== undefined)
          search.department = args.department;
        return await Employee.find(search);
      },
    },
    employeeContracts: {
      type: GraphQLList(employeeContractObj),
      description: "Get Multiple Data Employee Contracts",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        return await Contract.find({ employeeId: args.id }).sort({
          dateFrom: "desc",
        });
      },
    },
    employeeSalaries: {
      type: GraphQLList(employeeSalaryObj),
      description: "Get Multiple Data Employee Salaries",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        return await Salary.find({ employeeId: args.id }).sort({
          createAt: "desc",
        });
      },
    },
    employeeActivities: {
      type: GraphQLList(employeeActivityObj),
      description: "Get Multiple Data Employee Activities",
      args: {
        id: { type: GraphQLID },
        keyword: { type: GraphQLString },
        status: { type: GraphQLString },
        type: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const employee = await Employee.findById(args.id);
        let search = { name: new RegExp(args.keyword, "i") };
        if (args.id !== undefined && args.id !== null)
          search.employeeId = employee.id;
        if (args.status !== undefined && args.status !== null)
          search.status = args.status;
        if (args.type !== undefined && args.type !== null)
          search.type = args.type;
        return await Activity.find(search).sort({ createAt: "desc" });
      },
    },
    employeeReimburses: {
      type: GraphQLList(employeeReimburseObj),
      description: "Get Multiple Data Employee Reimburses",
      args: {
        keyword: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const employee = await Employee.find({
          employeeId: new RegExp(args.keyword, "i"),
        });
        let search = { employeeId: employee.id };
        if (args.status !== undefined && args.status !== null)
          search.status = args.status;
        return await Reimburse.find(search);
      },
    },
    approvalReferences: {
      type: GraphQLList(refApprovalObj),
      description: "Get Multiple Data Approval References",
      args: {
        level: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        let search = {};
        if (args.level !== undefined && args.level !== null)
          search.level = args.level;
        return await RefApproval.find(search);
      },
    },
    approvals: {
      type: GraphQLList(approvalObj),
      description: "Get Multiple Data Approvals",
      args: {
        activityId: { type: GraphQLID },
        userId: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        let search = {};
        if (args.activityId !== undefined && args.activityId !== null) {
          return await Approval.find({ activityId: args.activityId });
        }

        if (args.userId !== undefined && args.userId !== null) {
          const reimburses = await Reimburse.find({ status: { $ne: "Done" } });
          const approvals = await Approval.find({
            activityId: { $in: reimburses.map((x) => x.activityId) },
          });

          return approvals.filter((approval) => {
            if (approval.userId === args.userId) {
              const isPrevLevelApproved =
                approvals.filter(
                  (x) =>
                    (x.level < approval.level && x.approvedFlag) ||
                    approval.level === 1
                ).length > 0;
              const isCurrentLevelApprovedOrReject =
                approvals.filter(
                  (x) => x.level === approval.level && x.approvedFlag !== null
                ).length > 0;

              return isPrevLevelApproved && !isCurrentLevelApprovedOrReject;
            }
          });
        }
      },
    },
    division: {
      type: divisionObj,
      description: "Get Single Data Division",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        return await Division.findById(args.id);
      },
    },
    department: {
      type: departmentObj,
      description: "Get Single Data Department",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        return await Department.findById(args.id);
      },
    },
    employee: {
      type: employeeObj,
      description: "Get Single Data Employee",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        return await Employee.findById(args.id);
      },
    },
    employeeContract: {
      type: employeeContractObj,
      description: "Get Single Data Employee Contract",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        return await Contract.findById(args.id);
      },
    },
    employeeSalary: {
      type: employeeSalaryObj,
      description: "Get Single Data Employee Salary",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        return await Salary.findById(args.id);
      },
    },
    employeeActivity: {
      type: employeeActivityObj,
      description: "Get Single Data Employee Activity",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        return await Activity.findById(args.id);
      },
    },
    employeeReimburse: {
      type: employeeReimburseObj,
      description: "Get Single Data Employee Reimburse",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        return await Reimburse.findById(args.id);
      },
    },
    approvalReference: {
      type: refApprovalObj,
      description: "Get Single Data Approval Reference",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        return await RefApproval.findById(args.id);
      },
    },
    approval: {
      type: approvalObj,
      description: "Get Single Data Approval",
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        return await Approval.findById(args.id);
      },
    },
    levels: {
      type: GraphQLList(GraphQLInt),
      resolve: async () => {
        return await RefApproval.find().distinct("level");
      },
    },
    user: {
      type: user,
      description: "Get Single User",
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args) => {
        return getSingleData(User, args.id);
      },
    },
    role: {
      type: role,
      description: "Get Single Role",
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args) => {
        return getSingleData(Role, args.id);
      },
    },
    app: {
      type: app,
      description: "Get Single App",
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args) => {
        return getSingleData(App, args.id);
      },
    },
    accessRole: {
      type: GraphQLList(accessRole),
      description: "Get Access Role",
      args: {
        role: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        let search = {};
        if (args.role !== undefined && args.role !== "")
          search.role = args.role;
        return getMultipleData(RoleAccess, search);
      },
    },
    menu: {
      type: menu,
      description: "Get Single Menu",
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args) => {
        return getSingleData(Menu, args.id);
      },
    },
    users: {
      type: GraphQLList(user),
      description: "Get Multiple Users",
      args: {
        search: { type: GraphQLString },
        active: { type: GraphQLBoolean },
        role: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        let search = {};

        if (args.search !== undefined && args.search !== "") {
          search.$or = [
            { username: new RegExp(args.search, "i") },
            { name: new RegExp(args.search, "i") },
            { email: new RegExp(args.search, "i") },
          ];
        }

        if (args.active !== undefined && args.active !== "")
          search.activeFlag = args.active;
        if (args.role !== undefined && args.role !== "")
          search.role = args.role;

        return getMultipleData(User, search);
      },
    },
    usersForEmployee: {
      type: GraphQLList(user),
      description: "Get Multiple Users for Link to Employee Data",
      args: {
        employeeId: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        if (args.employeeId !== null && args.employeeId !== undefined) {
          return getMultipleData(User, {
            role: { $ne: "Sys-Master" },
            employeeId: { $in: [null, args.employeeId] },
            activeFlag: true,
          });
        } else {
          return getMultipleData(User, {
            role: { $ne: "Sys-Master" },
            employeeId: null,
            activeFlag: true,
          });
        }
      },
    },
    roles: {
      type: GraphQLList(role),
      description: "Get Multiple Roles",
      args: {
        search: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        const search = { name: new RegExp(args.search, "i") };
        return getMultipleData(Role, search);
      },
    },
    apps: {
      type: GraphQLList(app),
      description: "Get Multiple Apps",
      args: {
        search: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        const search = { name: new RegExp(args.search, "i") };
        return getMultipleData(App, search);
      },
    },
    menus: {
      type: GraphQLList(menu),
      description: "Get Multiple Menu by App",
      args: {
        idApp: { type: GraphQLNonNull(GraphQLID) },
        parent: { type: GraphQLBoolean },
      },
      resolve: async (parent, args) => {
        const app = await getSingleData(App, args.idApp);
        const search = { app: app.name };
        if (args.parent !== undefined && args.parent !== "")
          search.parent = null;
        return getMultipleData(Menu, search);
      },
    },
    candidate: {
      type: candidateObj,
      description: "Get Single Candidate",
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args) => {
        return getSingleData(Candidate, args.id);
      },
    },
    job: {
      type: jobObj,
      description: "Get Single Job",
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args) => {
        return getSingleData(Job, args.id);
      },
    },
    jobApplication: {
      type: jobApplicationObj,
      description: "Get Single Job Application",
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args) => {
        return getSingleData(JobApplication, args.id);
      },
    },
    question: {
      type: questionObj,
      description: "Get Single Question",
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args) => {
        return getSingleData(Question, args.id);
      },
    },
    option: {
      type: optionObj,
      description: "Get Single Option",
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args) => {
        return getSingleData(Option, args.id);
      },
    },
    onlineTestDetail: {
      type: GraphQLList(testObj),
      description: "Get Detail Online Test of Candidate",
      args: {
        id: { type: GraphQLID },
      },
      resolve: (parent, args) => {
        return getMultipleData(OnlineTestDetail, { applicationId: args.id });
      },
    },
    candidates: {
      type: GraphQLList(candidateObj),
      description: "Get Multiple Candidates",
      args: {
        keyword: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        const search = {
          $or: [
            { identityNumber: new RegExp(args.keyword, "i") },
            { email: new RegExp(args.keyword, "i") },
            { name: new RegExp(args.keyword, "i") },
          ],
        };
        return getMultipleData(Candidate, search);
      },
    },
    jobs: {
      type: GraphQLList(jobObj),
      description: "Get Multiple Jobs",
      args: {
        keyword: { type: GraphQLString },
        closed: { type: GraphQLBoolean },
        published: { type: GraphQLBoolean },
        typeJob: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        let search = {
          $or: [
            { title: new RegExp(args.keyword, "i") },
            { desc: new RegExp(args.keyword, "i") },
            { requirement: new RegExp(args.keyword, "i") },
          ],
        };

        if (args.closed !== undefined && args.closed !== null)
          search.closedFlag = args.closed;
        if (args.published !== undefined && args.published !== null)
          search.publishedFlag = args.published;
        if (args.typeJob !== undefined && args.typeJob !== null)
          search.type = args.typeJob;

        return getMultipleData(Job, search);
      },
    },
    jobApplications: {
      type: GraphQLList(jobApplicationObj),
      description: "Get Multiple Job Applications",
      args: {
        jobId: { type: GraphQLID },
        keyword: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        let search = {
          $or: [
            { jobName: new RegExp(args.keyword, "i") },
            { candidateName: new RegExp(args.keyword, "i") },
          ],
        };
        if (args.status !== null && args.status !== undefined)
          search.status = args.status;
        if (args.jobId !== null && args.jobId !== undefined)
          search.jobId = args.jobId;
        return await JobApplication.find(search).sort({ jobId: "asc" }).exec();
      },
    },
    questions: {
      type: GraphQLList(questionObj),
      description: "Get Multiple Questions",
      args: {
        jobId: { type: GraphQLID },
        keyword: { type: GraphQLString },
        type: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        let search = {
          $or: [
            { desc: new RegExp(args.keyword, "i") },
            { weight: args.keyword },
          ],
        };
        if (args.type !== undefined && args.type !== null)
          search.type = args.type;
        if (args.jobId !== undefined && args.jobId !== null)
          search.jobId = args.jobId;
        return getMultipleData(Question, search);
      },
    },
    options: {
      type: GraphQLList(optionObj),
      description: "Get Multiple Options",
      args: {
        questionId: { type: GraphQLID },
        keyword: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        const search = {
          questionId: args.questionId,
          desc: new RegExp(args.keyword, "i"),
        };

        return getMultipleData(Option, search);
      },
    },
  }),
});

module.exports = rootQuery;
